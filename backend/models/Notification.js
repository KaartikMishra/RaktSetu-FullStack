/**
 * Notification Model
 * 
 * Stores reminder notifications sent to donors.
 * Tracks which donors have been reminded and when.
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // Recipient donor
    donor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor ID is required']
    },

    // Hospital that sent the notification
    hospital_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Hospital ID is required']
    },

    // Notification type
    type: {
        type: String,
        enum: ['donation_reminder', 'blood_request', 'thank_you', 'general'],
        default: 'donation_reminder'
    },

    // Message content
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },

    // Delivery method
    delivery_method: {
        type: String,
        enum: ['email', 'sms', 'app', 'console'],
        default: 'console'
    },

    // Notification status
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
    },

    // When the notification was sent
    sent_at: {
        type: Date
    },

    // Read status
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for quick lookups
notificationSchema.index({ donor_id: 1, hospital_id: 1, type: 1 });
notificationSchema.index({ status: 1 });

/**
 * Mark notification as sent
 */
notificationSchema.methods.markAsSent = async function () {
    this.status = 'sent';
    this.sent_at = new Date();
    return this.save();
};

/**
 * Static method to get recent notifications for a donor
 */
notificationSchema.statics.getDonorNotifications = async function (donorId, limit = 10) {
    return this.find({ donor_id: donorId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('hospital_id', 'name profile.hospitalName');
};

/**
 * Static method to check if reminder was sent recently
 */
notificationSchema.statics.wasReminderSentRecently = async function (donorId, hospitalId, daysAgo = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const recentReminder = await this.findOne({
        donor_id: donorId,
        hospital_id: hospitalId,
        type: 'donation_reminder',
        sent_at: { $gte: cutoffDate }
    });

    return !!recentReminder;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
