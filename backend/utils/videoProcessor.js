const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const Video = require('../models/Video');

const processVideo = async (videoId, ownerId, io) => {
    try {
        const video = await Video.findById(videoId);
        if (!video) throw new Error('Video not found');

        const videoPath = path.join(__dirname, '..', 'uploads', ownerId.toString(), video.filename);
        const uploadDir = path.dirname(videoPath);

        // Step 1: Initialize
        io.to(ownerId.toString()).emit('processing:start', { videoId, progress: 0, step: 'Initializing...' });
        video.status = 'processing';
        await video.save();

        // Step 2: Extract Metadata
        io.to(ownerId.toString()).emit('processing:progress', { videoId, progress: 20, step: 'Extracting metadata...' });
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) reject(err);
                resolve(metadata);
            });
        });

        const format = metadata.format;
        const stream = metadata.streams.find(s => s.codec_type === 'video');
        
        video.duration = format.duration;
        video.resolution = stream ? `${stream.width}x${stream.height}` : 'unknown';
        video.codec = stream ? stream.codec_name : 'unknown';

        // Step 3: Extract Screenshots
        io.to(ownerId.toString()).emit('processing:progress', { videoId, progress: 40, step: 'Extracting thumbnails...' });
        const thumbnails = await new Promise((resolve, reject) => {
            let generatedFiles = [];
            ffmpeg(videoPath)
                .on('filenames', (filenames) => {
                    generatedFiles = filenames;
                })
                .on('end', () => {
                    resolve(generatedFiles);
                })
                .on('error', (err) => {
                    reject(err);
                })
                .screenshots({
                    count: 5,
                    folder: uploadDir,
                    filename: `${videoId}-thumbnail-%i.png`,
                });
        });

        video.thumbnails = thumbnails.map(thumb => `/uploads/${ownerId}/${thumb}`);
        io.to(ownerId.toString()).emit('processing:progress', { videoId, progress: 60, step: 'Running sensitivity analysis...' });

        // Step 4: Simulate Analysis
        await new Promise(resolve => setTimeout(resolve, 700)); // 700ms delay
        const isSafe = Math.random() > 0.2; // 80% chance of being safe
        video.status = isSafe ? 'safe' : 'flagged';
        io.to(ownerId.toString()).emit('processing:progress', { videoId, progress: 80, step: 'Finalizing database records...' });

        // Step 5: Complete
        video.processedAt = new Date();
        await video.save();

        io.to(ownerId.toString()).emit('processing:complete', {
            videoId,
            status: video.status,
            video: video
        });

    } catch (error) {
        console.error('Video processing failed:', error);
        if (io) {
            io.to(ownerId.toString()).emit('processing:complete', {
                videoId,
                status: 'error',
                error: error.message
            });
        }
    }
};

module.exports = { processVideo };
