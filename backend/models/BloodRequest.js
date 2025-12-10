import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterName: {
        type: String,
        required: true
    },
    requesterType: {
        type: String,
        enum: ['hospital', 'seeker'],
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: [true, 'Blood group is required']
    },
    unitsRequested: {
        type: Number,
        required: [true, 'Number of units is required'],
        min: [1, 'At least 1 unit must be requested']
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    reason: {
        type: String,
        required: [true, 'Reason for request is required'],
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'fulfilled', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fulfilledAt: Date,
    notes: String,
    location: String,
    contactPhone: String
}, {
    timestamps: true
});

// Index for efficient queries
bloodRequestSchema.index({ status: 1, bloodGroup: 1 });
bloodRequestSchema.index({ requesterId: 1 });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

export default BloodRequest;
