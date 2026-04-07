const multer = require('multer');
const path = require('path');

// Use memory storage — file stays in RAM buffer, no disk writes
// We stream it directly to Cloudinary from the buffer
const storage = multer.memoryStorage();

// File filter (videos only)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, MOV, AVI, and MKV are allowed.'), false);
    }
};

// Multer upload instance — 500MB limit
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
    },
    fileFilter: fileFilter,
});

module.exports = upload;
