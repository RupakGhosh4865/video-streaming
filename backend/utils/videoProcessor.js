const cloudinary = require('../config/cloudinary');
const Video = require('../models/Video');
const { Readable } = require('stream');

/**
 * Converts a Buffer to a Node.js Readable stream
 */
const bufferToStream = (buffer) => {
    return Readable.from(buffer);
};

/**
 * Processes a video by uploading it to Cloudinary.
 * Persists progress to the database to ensure UI consistency.
 */
const processVideo = async (videoId, ownerId, fileBuffer, originalName, io) => {
    let video;
    try {
        video = await Video.findById(videoId);
        if (!video) throw new Error('Video not found in database');

        const emitAndSave = async (progress, step) => {
            console.log(`[Video ${videoId}] ${step} (${progress}%)`);
            video.processingProgress = progress;
            video.processingStep = step;
            await video.save();
            
            if (io) {
                io.to(ownerId.toString()).emit('processing:progress', {
                    videoId,
                    progress,
                    step,
                });
            }
        };

        // Step 1: Initialize
        video.status = 'processing';
        await emitAndSave(5, 'Initializing Cloudinary upload...');

        // Step 2: Upload to Cloudinary via stream
        // We add a timeout safety net
        const uploadResult = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Cloudinary upload timed out after 5 minutes'));
            }, 5 * 60 * 1000);

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: `videovault/${ownerId}`,
                    public_id: `${videoId}`,
                    eager: [{ format: 'mp4', quality: 'auto' }],
                    eager_async: true,
                },
                (error, result) => {
                    clearTimeout(timeout);
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            // Handle stream-level errors explicitly
            uploadStream.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });

            const readableStream = bufferToStream(fileBuffer);
            readableStream.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });

            readableStream.pipe(uploadStream);
        });

        await emitAndSave(70, 'Extracting metadata and generating thumbnails...');

        // Step 3: Extract metadata and generate thumbnail
        const duration = uploadResult.duration || 0;
        const resolution = uploadResult.width && uploadResult.height
            ? `${uploadResult.width}x${uploadResult.height}`
            : 'unknown';

        const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
            resource_type: 'video',
            format: 'jpg',
            transformation: [{ start_offset: '1' }],
        });

        // Step 4: Finalize
        await emitAndSave(95, 'Finalizing video entry...');

        video.cloudinaryId = uploadResult.public_id;
        video.streamUrl = uploadResult.secure_url;
        video.thumbnails = [thumbnailUrl];
        video.duration = duration;
        video.resolution = resolution;
        video.codec = 'h264';
        video.status = 'safe';
        video.processingProgress = 100;
        video.processingStep = 'Complete';
        video.processedAt = new Date();
        await video.save();

        if (io) {
            io.to(ownerId.toString()).emit('processing:complete', {
                videoId,
                status: 'safe',
                video,
            });
        }

        console.log(`✅ Video ${videoId} processed successfully.`);

    } catch (error) {
        console.error(`❌ Video ${videoId} processing failed:`, error.message);

        if (video) {
            video.status = 'flagged';
            video.processingStep = `Error: ${error.message}`;
            await video.save();
        }

        if (io) {
            io.to(ownerId.toString()).emit('processing:complete', {
                videoId,
                status: 'flagged',
                error: error.message,
            });
        }
    }
};

module.exports = { processVideo };
