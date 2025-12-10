import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import { protect } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { bloodRequestValidation, validate } from '../middleware/validate.js';

const router = express.Router();

// @route   GET /api/requests
// @desc    Get blood requests (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        // Filter based on role
        if (req.user.role === 'seeker' || req.user.role === 'hospital') {
            // Users see only their own requests
            query.requesterId = req.user._id;
        }
        // Admin sees all requests

        const requests = await BloodRequest.find(query)
            .populate('requesterId', 'name email phone')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: { requests }
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/requests
// @desc    Create a blood request
// @access  Private (seeker, hospital)
router.post('/', protect, roleCheck('seeker', 'hospital'), bloodRequestValidation, validate, async (req, res) => {
    try {
        const { bloodGroup, unitsRequested, urgency, reason, location, contactPhone } = req.body;

        const request = await BloodRequest.create({
            requesterId: req.user._id,
            requesterName: req.user.name,
            requesterType: req.user.role === 'hospital' ? 'hospital' : 'seeker',
            bloodGroup,
            unitsRequested,
            urgency: urgency || 'medium',
            reason,
            location,
            contactPhone: contactPhone || req.user.phone
        });

        res.status(201).json({
            success: true,
            message: 'Blood request created successfully',
            data: { request }
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/requests/:id
// @desc    Get single blood request
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id)
            .populate('requesterId', 'name email phone')
            .populate('approvedBy', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Blood request not found'
            });
        }

        // Check authorization (admin can see all, others only their own)
        if (req.user.role !== 'admin' && request.requesterId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this request'
            });
        }

        res.json({
            success: true,
            data: { request }
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/requests/:id
// @desc    Update blood request status
// @access  Private (admin only)
router.put('/:id', protect, roleCheck('admin'), async (req, res) => {
    try {
        const { status, notes } = req.body;

        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Blood request not found'
            });
        }

        // Update fields
        if (status) {
            request.status = status;
            if (status === 'approved' || status === 'rejected') {
                request.approvedBy = req.user._id;
            }
            if (status === 'fulfilled') {
                request.fulfilledAt = new Date();
            }
        }
        if (notes) {
            request.notes = notes;
        }

        await request.save();

        res.json({
            success: true,
            message: 'Request updated successfully',
            data: { request }
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/requests/:id
// @desc    Delete blood request
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Blood request not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && request.requesterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this request'
            });
        }

        await BloodRequest.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Request deleted successfully'
        });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;
