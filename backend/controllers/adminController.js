const User = require('../models/User');
const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// @desc    Get all users in admin's organization
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsersInOrg = async (req, res) => {
    try {
        const users = await User.find({ orgId: req.user.orgId }).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['viewer', 'editor', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const userToUpdate = await User.findById(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure user belongs to the same org
        if (userToUpdate.orgId !== req.user.orgId) {
             return res.status(403).json({ message: 'Not authorized to modify this user' });
        }

        userToUpdate.role = role;
        await userToUpdate.save();

        res.json({ message: 'User role updated', user: { _id: userToUpdate._id, role: userToUpdate.role }});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating role' });
    }
};

// @desc    Delete any video in org
// @route   DELETE /api/admin/videos/:id
// @access  Private/Admin
const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Ensure video belongs to the same org
        if (video.orgId !== req.user.orgId) {
             return res.status(403).json({ message: 'Not authorized to delete this video' });
        }

        // Remove from file system
        const videoPath = path.join(__dirname, '..', 'uploads', video.ownerId.toString(), video.filename);
        if (fs.existsSync(videoPath)) {
             fs.unlinkSync(videoPath);
        }

        // Remove thumbnails
        if(video.thumbnails) {
            for (let thumb of video.thumbnails) {
                const thumbPath = path.join(__dirname, '..', thumb);
                 if (fs.existsSync(thumbPath)) {
                     fs.unlinkSync(thumbPath);
                }
            }
        }

        await Video.findByIdAndDelete(req.params.id);

        res.json({ message: 'Video removed completely' });
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error deleting video' });
    }
};

module.exports = {
    getUsersInOrg,
    updateUserRole,
    deleteVideo
};
