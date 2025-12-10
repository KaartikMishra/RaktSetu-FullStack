import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    role: {
        type: String,
        enum: ['admin', 'donor', 'seeker', 'hospital'],
        default: 'seeker'
    },
    verified: {
        type: Boolean,
        default: false
    },
    // Donor-specific profile fields
    profile: {
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        dateOfBirth: Date,
        weight: Number,
        lastDonation: Date,
        eligibleNext: Date,
        totalDonations: {
            type: Number,
            default: 0
        },
        donationsThisYear: {
            type: Number,
            default: 0
        },
        address: String,
        emergencyContact: String,

        // Achievement badge (gold, silver, bronze, none)
        achievementBadge: {
            type: String,
            enum: ['gold', 'silver', 'bronze', 'none'],
            default: 'none'
        },

        // Eligibility quiz results
        quizResult: {
            isEligible: Boolean,
            score: Number,
            percentage: Number,
            completedAt: Date,
            answers: mongoose.Schema.Types.Mixed
        },

        // Donation history
        donationHistory: [{
            date: Date,
            location: String,
            units: { type: Number, default: 1 },
            status: { type: String, enum: ['completed', 'cancelled', 'pending'], default: 'completed' }
        }],

        // Hospital-specific fields
        hospitalName: String,
        license: String,
        capacity: Number,
        specialties: [String],
        contactPerson: String
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
