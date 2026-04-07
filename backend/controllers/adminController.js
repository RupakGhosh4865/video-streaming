const User = require('../models/User');
const Video = require('../models/Video');
const cloudinary = require('../config/cloudinary');

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

// @desc    Delete any video in org (also removes from Cloudinary)
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

        // Delete from Cloudinary if cloudinaryId exists
        if (video.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
                console.log(`Deleted from Cloudinary: ${video.cloudinaryId}`);
            } catch (cloudErr) {
                console.error('Cloudinary delete error (non-fatal):', cloudErr.message);
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
