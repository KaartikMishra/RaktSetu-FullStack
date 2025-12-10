import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    donorName: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    units: {
        type: Number,
        default: 1,
        min: 1
    },
    donationDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: String,
    // Blood bank / hospital that collected
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for efficient queries
donationSchema.index({ donorId: 1, donationDate: -1 });
donationSchema.index({ status: 1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
