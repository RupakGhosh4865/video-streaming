const Video = require('../models/Video');
const { processVideo } = require('../utils/videoProcessor');

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

        // The file is already saved by multer
        const newVideo = await Video.create({
            title,
            description,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
            ownerId: req.user._id,
            orgId: req.user.orgId || '',
            streamUrl: `/uploads/${req.user._id}/${req.file.filename}`, // Relative path accessible via static serving
        });

        const io = req.app.get('io');

        // Trigger processing asynchronously (do not await)
        processVideo(newVideo._id, req.user._id, io).catch(err => {
            console.error('Background processing error:', err);
        });

        res.status(201).json({
            message: 'Video upload initiated',
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
        const videos = await Video.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching videos' });
    }
};

module.exports = {
    uploadVideo,
    getVideos,
};
