require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const Video = require('../models/Video');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany();
        await Organisation.deleteMany();
        await Video.deleteMany();
        console.log('Cleared existing data');

        // 1. Create Org
        const orgId = new mongoose.Types.ObjectId();
        const mainOrg = await Organisation.create({
            _id: orgId,
            name: 'VideoVault Demo Corp',
            ownerId: new mongoose.Types.ObjectId() // temporary placeholder
        });

        // 2. Create Users — plain passwords, model pre-save hook hashes them
        const adminId = new mongoose.Types.ObjectId();
        
        await User.create([
            {
                _id: adminId,
                name: 'Admin User',
                email: 'admin@videovault.com',
                password: 'password123',
                role: 'admin',
                orgId: mainOrg._id
            },
            {
                name: 'Editor User',
                email: 'editor@videovault.com',
                password: 'password123',
                role: 'editor',
                orgId: mainOrg._id
            },
            {
                name: 'Viewer User',
                email: 'viewer@videovault.com',
                password: 'password123',
                role: 'viewer',
                orgId: mainOrg._id
            }
        ]);

        // Fix Org Owner
        mainOrg.ownerId = adminId;
        await mainOrg.save();

        console.log('Created Users & Organization');

        // 3. Create Sample Videos
        await Video.create([
            {
                title: 'Welcome to VideoVault',
                description: 'An introductory video on how to use the platform securely.',
                filename: 'demo-welcome.mp4',
                originalName: 'demo-welcome.mp4',
                size: 15400000,
                mimeType: 'video/mp4',
                status: 'safe',
                ownerId: adminId,
                orgId: mainOrg._id,
                resolution: '1920x1080',
                codec: 'h264'
            },
            {
                title: 'Quarterly Review Q3',
                description: 'Financial results and future projections.',
                filename: 'demo-finance.mp4',
                originalName: 'demo-finance.mp4',
                size: 45000000,
                mimeType: 'video/mp4',
                status: 'safe',
                ownerId: adminId,
                orgId: mainOrg._id,
                resolution: '1280x720',
                codec: 'h264'
            },
            {
                 title: 'Sensitive Internal Memo',
                 description: 'This video contains flagged information.',
                 filename: 'demo-flagged.mp4',
                 originalName: 'demo-flagged.mp4',
                 size: 5000000,
                 mimeType: 'video/mp4',
                 status: 'flagged',
                 ownerId: adminId,
                 orgId: mainOrg._id,
                 resolution: '640x480',
                 codec: 'h264'
            }
        ]);

        console.log('Created 3 Sample Videos');
        
        console.log('Seeding COMPLETE! You can login with admin@videovault.com | password123');
        process.exit(0);

    } catch (error) {
        console.error('Failed to seed:', error);
        process.exit(1);
    }
};

seedData();
