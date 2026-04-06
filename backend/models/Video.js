const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    description: {
        type: String,
        default: '',
    },
    filename: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number, // Optional for now, assuming we might extract it later
        default: 0,
    },
    resolution: {
        type: String,
    },
    codec: {
        type: String,
    },
    thumbnails: {
        type: [String],
        default: [],
    },
    mimeType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'safe', 'flagged'],
        default: 'pending',
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orgId: {
        type: String,
        default: '',
    },
    streamUrl: {
        type: String,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    processedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Video', videoSchema);
