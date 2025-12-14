import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * @route   POST /api/users/profile-photo
 * @desc    Upload user profile photo
 * @access  Private
 */
router.post('/profile-photo', protect, upload.single('profileDetail'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user._id;
        const fileUrl = `/uploads/${req.file.filename}`;

        // Get current user to check for old photo
        const currentUser = await User.findById(userId);

        // Delete old photo if exists and isn't a default/external one
        if (currentUser.profilePicture && currentUser.profilePicture.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), currentUser.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update user profile with new photo URL
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: fileUrl },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: {
                user,
                fileUrl
            }
        });

    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during photo upload'
        });
    }
});

export default router;
