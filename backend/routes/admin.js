import express from 'express';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import { protect } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require admin role
router.use(protect, roleCheck('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (admin only)
router.get('/users', async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;

        let query = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: { users }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (admin only)
router.get('/stats', async (req, res) => {
    try {
        // Count users by role
        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalSeekers = await User.countDocuments({ role: 'seeker' });
        const totalHospitals = await User.countDocuments({ role: 'hospital' });
        const totalUsers = await User.countDocuments();

        // Blood request stats
        const totalRequests = await BloodRequest.countDocuments();
        const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
        const approvedRequests = await BloodRequest.countDocuments({ status: 'approved' });
        const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
        const rejectedRequests = await BloodRequest.countDocuments({ status: 'rejected' });

        // Requests by blood group
        const requestsByBloodGroup = await BloodRequest.aggregate([
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
        ]);

        // Recent requests
        const recentRequests = await BloodRequest.find()
            .populate('requesterId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Donation stats
        const totalDonations = await Donation.countDocuments({ status: 'completed' });

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    donors: totalDonors,
                    seekers: totalSeekers,
                    hospitals: totalHospitals
                },
                requests: {
                    total: totalRequests,
                    pending: pendingRequests,
                    approved: approvedRequests,
                    fulfilled: fulfilledRequests,
                    rejected: rejectedRequests,
                    byBloodGroup: requestsByBloodGroup.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {})
                },
                donations: {
                    total: totalDonations
                },
                recentRequests
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (admin only)
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'donor', 'seeker', 'hospital'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (admin only)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;
