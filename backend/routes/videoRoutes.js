const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, roleGuard } = require('../middleware/authMiddleware');
const { protectQuery } = require('../middleware/authQueryMiddleware');
const { uploadVideo, getVideos, getVideoById, streamVideo } = require('../controllers/videoController');

// Define route
router.post(
    '/upload',
    protect,
    roleGuard(['editor', 'admin']),
    (req, res, next) => {
        // Wrap multer to handle errors directly (like file size or config errors)
        upload.single('video')(req, res, function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    uploadVideo
);

router.get('/', protect, getVideos);
router.get('/:id', protect, getVideoById);
router.get('/:id/stream', protectQuery, streamVideo);

module.exports = router;
