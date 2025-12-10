/**
 * RaktSetu - Role-Specific Registration Routes
 * 
 * This file provides dedicated registration endpoints for each user role:
 * - /register-donor     : Register a blood donor
 * - /register-hospital  : Register hospital staff
 * - /register-seeker    : Register a blood seeker
 * 
 * All registered users are automatically stored in the database and visible
 * in the admin dashboard.
 */

import express from 'express';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to validate required fields
 * @param {Object} data - Request body data
 * @param {Array} requiredFields - List of required field names
 * @returns {Object} - { isValid: boolean, missingFields: array }
 */
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => !data[field]);
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};

/**
 * Helper function to create a user with a specific role
 * @param {Object} userData - User data from request
 * @param {String} role - User role (donor, hospital, seeker)
 * @returns {Object} - Created user or error
 */
const createUserWithRole = async (userData, role) => {
    const { name, email, password, contact, location, blood_group } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return {
            success: false,
            status: 400,
            message: 'User with this email already exists'
        };
    }

    // Build user object based on role
    const userObj = {
        name,
        email: email.toLowerCase(),
        password,
        phone: contact,
        location,
        role,
        verified: false
    };

    // Add blood group to profile for donors and seekers
    if (role === 'donor' || role === 'seeker') {
        userObj.profile = {
            bloodGroup: blood_group
        };
    }

    // Add hospital-specific fields
    if (role === 'hospital') {
        userObj.profile = {
            hospitalName: userData.hospital_name || name,
            contactPerson: userData.contact_person || name
        };
    }

    // Create the user
    const user = await User.create(userObj);

    // Generate authentication token
    const token = generateToken(user._id);

    return {
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.role,
            profile: user.profile,
            createdAt: user.createdAt
        },
        token
    };
};

// ============================================================================
// REGISTRATION ROUTES
// ============================================================================

/**
 * @route   POST /api/register/register-donor
 * @desc    Register a new blood donor
 * @access  Public
 * 
 * Required fields:
 * - name: Full name of the donor
 * - email: Email address (unique)
 * - password: Account password (min 6 characters)
 * - contact: Phone number
 * - location: City/Area
 * - blood_group: Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
 */
router.post('/register-donor', async (req, res) => {
    try {
        console.log('📋 Donor registration request received');

        // Validate required fields
        const requiredFields = ['name', 'email', 'password', 'contact', 'location', 'blood_group'];
        const validation = validateRequiredFields(req.body, requiredFields);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${validation.missingFields.join(', ')}`
            });
        }

        // Validate blood group
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(req.body.blood_group)) {
            return res.status(400).json({
                success: false,
                message: `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}`
            });
        }

        // Create donor user with quiz data if provided
        const { quiz_result } = req.body;
        const result = await createUserWithRole(req.body, 'donor');

        if (!result.success) {
            return res.status(result.status || 400).json({
                success: false,
                message: result.message
            });
        }

        // If quiz result provided, update the user profile with quiz data
        if (quiz_result) {
            try {
                await User.findByIdAndUpdate(result.user.id, {
                    'profile.quizResult': {
                        isEligible: quiz_result.isEligible,
                        score: quiz_result.score,
                        percentage: quiz_result.percentage,
                        completedAt: quiz_result.completedAt || new Date(),
                        answers: quiz_result.answers
                    }
                });
                console.log('📝 Quiz result saved for donor');
            } catch (quizError) {
                console.error('⚠️ Failed to save quiz result:', quizError.message);
            }
        }

        console.log(`✅ Donor registered successfully: ${result.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Blood donor registered successfully',
            data: {
                ...result,
                quizResult: quiz_result || null
            }
        });

    } catch (error) {
        console.error('❌ Donor registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during donor registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/register/register-hospital
 * @desc    Register new hospital staff
 * @access  Public
 * 
 * Required fields:
 * - name: Hospital or staff name
 * - email: Email address (unique)
 * - password: Account password (min 6 characters)
 * - contact: Phone number
 * - location: Hospital location/address
 * 
 * Optional fields:
 * - hospital_name: Name of the hospital
 * - contact_person: Contact person name
 */
router.post('/register-hospital', async (req, res) => {
    try {
        console.log('🏥 Hospital staff registration request received');

        // Validate required fields
        const requiredFields = ['name', 'email', 'password', 'contact', 'location'];
        const validation = validateRequiredFields(req.body, requiredFields);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${validation.missingFields.join(', ')}`
            });
        }

        // Create hospital staff user
        const result = await createUserWithRole(req.body, 'hospital');

        if (!result.success) {
            return res.status(result.status || 400).json({
                success: false,
                message: result.message
            });
        }

        console.log(`✅ Hospital staff registered successfully: ${result.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Hospital staff registered successfully',
            data: result
        });

    } catch (error) {
        console.error('❌ Hospital registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during hospital staff registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/register/register-seeker
 * @desc    Register a new blood seeker
 * @access  Public
 * 
 * Required fields:
 * - name: Full name of the seeker
 * - email: Email address (unique)
 * - password: Account password (min 6 characters)
 * - contact: Phone number
 * - location: City/Area
 * - blood_group: Required blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
 */
router.post('/register-seeker', async (req, res) => {
    try {
        console.log('🔍 Blood seeker registration request received');

        // Validate required fields
        const requiredFields = ['name', 'email', 'password', 'contact', 'location', 'blood_group'];
        const validation = validateRequiredFields(req.body, requiredFields);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${validation.missingFields.join(', ')}`
            });
        }

        // Validate blood group
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(req.body.blood_group)) {
            return res.status(400).json({
                success: false,
                message: `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}`
            });
        }

        // Create seeker user
        const result = await createUserWithRole(req.body, 'seeker');

        if (!result.success) {
            return res.status(result.status || 400).json({
                success: false,
                message: result.message
            });
        }

        console.log(`✅ Blood seeker registered successfully: ${result.user.email}`);

        // ================================================================
        // HOSPITAL MATCHING: Find hospitals in or near the seeker's location
        // ================================================================
        const seekerLocation = req.body.location;
        console.log(`🏥 Searching for hospitals near: "${seekerLocation}"`);

        let nearbyHospitals = [];
        try {
            // Search for hospitals matching the seeker's location
            const hospitals = await Hospital.searchByLocation(seekerLocation);

            // Format hospital data for response
            nearbyHospitals = hospitals.map(h => ({
                id: h._id,
                name: h.name,
                address: h.address,
                city: h.city,
                state: h.state,
                phone: h.phone,
                email: h.email,
                website: h.website,
                type: h.type,
                hasBloodBank: h.hasBloodBank,
                availableBloodGroups: h.availableBloodGroups,
                is24x7: h.operatingHours?.is24x7,
                // Include distance if available
                coordinates: h.location?.coordinates
            }));

            console.log(`✅ Found ${nearbyHospitals.length} hospitals in/near "${seekerLocation}"`);
        } catch (hospitalError) {
            console.error('⚠️ Error fetching hospitals:', hospitalError.message);
            // Continue with registration even if hospital search fails
        }

        // Return success with user data AND nearby hospitals
        res.status(201).json({
            success: true,
            message: 'Blood seeker registered successfully',
            data: {
                ...result,
                // Include hospitals matching the seeker's location
                nearbyHospitals: {
                    searchedLocation: seekerLocation,
                    count: nearbyHospitals.length,
                    hospitals: nearbyHospitals
                }
            }
        });

    } catch (error) {
        console.error('❌ Seeker registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during blood seeker registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
