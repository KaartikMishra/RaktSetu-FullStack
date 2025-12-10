/**
 * RaktSetu - Hospital Model
 * 
 * Schema for storing hospital data with location information
 * for geographic matching with blood seekers.
 */

import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true,
        maxlength: [200, 'Hospital name cannot exceed 200 characters']
    },

    // Contact Information
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    website: {
        type: String,
        trim: true
    },

    // Address Information
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        lowercase: true  // Store in lowercase for easier matching
    },
    state: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },

    // Geolocation (for distance-based matching)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            default: [0, 0]
        }
    },

    // Hospital Details
    type: {
        type: String,
        enum: ['government', 'private', 'trust', 'clinic'],
        default: 'private'
    },
    hasBloodBank: {
        type: Boolean,
        default: true
    },
    bloodBankLicense: {
        type: String,
        trim: true
    },

    // Available Blood Groups (current inventory status)
    availableBloodGroups: [{
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }],

    // Operating Hours
    operatingHours: {
        open: { type: String, default: '00:00' },
        close: { type: String, default: '23:59' },
        is24x7: { type: Boolean, default: true }
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Create 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

// Create text index for searching
hospitalSchema.index({ name: 'text', city: 'text', address: 'text' });

// Create index on city for faster lookups
hospitalSchema.index({ city: 1 });

/**
 * Static method to find hospitals by city (case-insensitive)
 * @param {String} city - City name to search
 * @returns {Array} - List of matching hospitals
 */
hospitalSchema.statics.findByCity = function (city) {
    const normalizedCity = city.toLowerCase().trim();
    return this.find({
        city: { $regex: new RegExp(normalizedCity, 'i') },
        isActive: true
    }).sort({ name: 1 });
};

/**
 * Static method to find hospitals near a location
 * @param {Number} longitude - Longitude coordinate
 * @param {Number} latitude - Latitude coordinate
 * @param {Number} maxDistanceKm - Maximum distance in kilometers
 * @returns {Array} - List of nearby hospitals
 */
hospitalSchema.statics.findNearby = function (longitude, latitude, maxDistanceKm = 10) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistanceKm * 1000  // Convert km to meters
            }
        },
        isActive: true
    });
};

/**
 * Static method to search hospitals by city name or partial match
 * This is more flexible and handles variations in city names
 * @param {String} searchTerm - Search term (city, area, etc.)
 * @returns {Array} - List of matching hospitals
 */
hospitalSchema.statics.searchByLocation = async function (searchTerm) {
    const normalizedTerm = searchTerm.toLowerCase().trim();

    // First, try exact city match
    let hospitals = await this.find({
        city: normalizedTerm,
        isActive: true
    }).sort({ name: 1 });

    // If no exact match, try partial match
    if (hospitals.length === 0) {
        hospitals = await this.find({
            $or: [
                { city: { $regex: new RegExp(normalizedTerm, 'i') } },
                { address: { $regex: new RegExp(normalizedTerm, 'i') } },
                { state: { $regex: new RegExp(normalizedTerm, 'i') } }
            ],
            isActive: true
        }).sort({ name: 1 });
    }

    return hospitals;
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
