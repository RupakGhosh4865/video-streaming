const Video = require('../models/Video');
const { processVideo } = require('../utils/videoProcessor');
const cloudinary = require('../config/cloudinary');

// @desc    Upload a new video
// @route   POST /api/videos/upload
// @access  Private (editor/admin)
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file provided' });
        }

        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Video title is required' });
        }

        // Create the video document immediately so we have an ID for Cloudinary folder
        const newVideo = await Video.create({
            title,
            description,
            filename: req.file.originalname,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
            ownerId: req.user._id,
            orgId: req.user.orgId || '',
            status: 'processing',
        });

        const io = req.app.get('io');

        // Trigger Cloudinary processing asynchronously — pass the memory buffer
        processVideo(
            newVideo._id,
            req.user._id,
            req.file.buffer,       // In-memory buffer (multer memoryStorage)
            req.file.originalname,
            io
        ).catch(err => {
            console.error('Background Cloudinary processing error:', err);
        });

        res.status(201).json({
            message: 'Video upload initiated. Processing in background...',
            video: newVideo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during video upload' });
    }
};

// @desc    Get all videos for a user
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
    try {
        const query = { ownerId: req.user._id };
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        const videos = await Video.find(query).sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching videos' });
    }
};

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Private
const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Access control: user owns video or belongs to same org
        if (video.ownerId.toString() !== req.user._id.toString() && 
            (!video.orgId || video.orgId !== req.user.orgId)) {
            return res.status(403).json({ message: 'Not authorized to access this video' });
        }

        res.json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching video details' });
    }
};

// @desc    Stream / get secure Cloudinary URL for a video
// @route   GET /api/videos/:id/stream
// @access  Private
const streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Authorization check
        if (video.ownerId.toString() !== req.user._id.toString() && 
            (!video.orgId || video.orgId !== req.user.orgId)) {
            return res.status(403).json({ message: 'Not authorized to stream this video' });
        }

        // Status check
        if (video.status !== 'safe') {
            return res.status(403).json({ message: 'Video is flagged or still processing' });
        }

        if (!video.streamUrl) {
            return res.status(404).json({ message: 'Video stream URL not available yet' });
        }

        // Return the Cloudinary URL — frontend plays this directly
        res.json({ streamUrl: video.streamUrl });
    } catch (error) {
        console.error('Error retrieving video stream URL:', error);
        res.status(500).json({ message: 'Server error retrieving stream URL' });
    }
};

// @desc    Delete a video (Admin)
// @route   DELETE /api/admin/videos/:id
// @access  Admin
const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Delete from Cloudinary if it was uploaded there
        if (video.cloudinaryId) {
            await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
        }

        await video.deleteOne();
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting video' });
    }
};

module.exports = {
    uploadVideo,
    getVideos,
    getVideoById,
    streamVideo,
    deleteVideo,
};
