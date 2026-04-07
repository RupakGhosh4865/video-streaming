const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Generate Access Token
const generateAccessToken = (id, orgId, role) => {
    return jwt.sign({ id, orgId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

const Organisation = require('../models/Organisation');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, orgId } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let finalOrgId = orgId;
        
        // Let's create an org if none was provided so we always have multitenancy boundaries
        if (!finalOrgId) {
             const defaultOrg = await Organisation.create({
                 name: `${name}'s Organization`,
                 // We will set owner Id after the user is created
                 ownerId: new mongoose.Types.ObjectId() // Placeholder
             });
             finalOrgId = defaultOrg._id.toString();
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            orgId: finalOrgId,
        });

        // Update org owner if we just created it
        if (!orgId) {
             await Organisation.findByIdAndUpdate(finalOrgId, { ownerId: user._id });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                orgId: user.orgId,
                token: generateAccessToken(user._id, user.orgId, user.role),
                refreshToken: generateRefreshToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                orgId: user.orgId,
                token: generateAccessToken(user._id, user.orgId, user.role),
                refreshToken: generateRefreshToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) return res.status(401).json({ message: 'User not found' });
        
        const accessToken = generateAccessToken(user._id, user.orgId, user.role);
        res.json({ token: accessToken });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
};
