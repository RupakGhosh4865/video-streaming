const fs = require('fs');
const path = require('path');
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

        // Access control: Make sure user owns video or belongs to same org
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

// @desc    Stream video file securely
// @route   GET /api/videos/:id/stream
// @access  Private (uses protectQuery)
const streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // 1. Authorization Check
        if (video.ownerId.toString() !== req.user._id.toString() && 
            (!video.orgId || video.orgId !== req.user.orgId)) {
            return res.status(403).json({ message: 'Not authorized to stream this video' });
        }

        // 2. Status Check
        if (video.status !== 'safe') {
            return res.status(403).json({ message: 'Video is flagged or still processing' });
        }

        // 3. Resolve Path
        const videoPath = path.join(__dirname, '..', 'uploads', video.ownerId.toString(), video.filename);
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ message: 'Video file missing on server' });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // 4. Stream Logic
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if(start >= fileSize) {
                res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
                return;
            }

            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': video.mimeType,
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': video.mimeType,
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error during video streaming' });
        }
    }
};

module.exports = {
    uploadVideo,
    getVideos,
    getVideoById,
    streamVideo,
};
