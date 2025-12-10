/**
 * RaktSetu - Hospital Routes
 * 
 * Endpoints for hospital search and management:
 * - /hospitals/search    : Search hospitals by location
 * - /hospitals/nearby    : Find hospitals near coordinates
 * - /hospitals           : List all hospitals
 */

import express from 'express';
import Hospital from '../models/Hospital.js';

const router = express.Router();

// ============================================================================
// HOSPITAL SEARCH ROUTES
// ============================================================================

/**
 * @route   GET /api/hospitals
 * @desc    Get all active hospitals
 * @access  Public
 * 
 * Query parameters:
 * - city: Filter by city name
 * - limit: Number of results (default 50)
 */
router.get('/', async (req, res) => {
    try {
        const { city, limit = 50 } = req.query;

        let query = { isActive: true };

        if (city) {
            query.city = { $regex: new RegExp(city.toLowerCase().trim(), 'i') };
        }

        const hospitals = await Hospital.find(query)
            .limit(parseInt(limit))
            .sort({ name: 1 });

        res.json({
            success: true,
            count: hospitals.length,
            data: { hospitals }
        });

    } catch (error) {
        console.error('❌ Error fetching hospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching hospitals'
        });
    }
});

/**
 * @route   GET /api/hospitals/search
 * @desc    Search hospitals by location (city, area, or address)
 * @access  Public
 * 
 * Query parameters:
 * - location: Search term (city name, area, etc.)
 * 
 * Example: /api/hospitals/search?location=delhi
 */
router.get('/search', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a location to search'
            });
        }

        console.log(`🔍 Searching hospitals for location: "${location}"`);

        // Search for hospitals matching the location
        const hospitals = await Hospital.searchByLocation(location);

        // Format the response
        const formattedHospitals = hospitals.map(h => ({
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
            coordinates: h.location?.coordinates
        }));

        console.log(`✅ Found ${formattedHospitals.length} hospitals in "${location}"`);

        res.json({
            success: true,
            message: `Found ${formattedHospitals.length} hospitals in or near "${location}"`,
            searchedLocation: location,
            count: formattedHospitals.length,
            data: { hospitals: formattedHospitals }
        });

    } catch (error) {
        console.error('❌ Hospital search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during hospital search'
        });
    }
});

/**
 * @route   GET /api/hospitals/nearby
 * @desc    Find hospitals near specific coordinates
 * @access  Public
 * 
 * Query parameters:
 * - lat: Latitude
 * - lng: Longitude
 * - radius: Search radius in km (default 10)
 * 
 * Example: /api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=5
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude (lat) and longitude (lng)'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const maxDistance = parseFloat(radius);

        console.log(`📍 Searching hospitals near [${latitude}, ${longitude}] within ${maxDistance}km`);

        // Find hospitals near the coordinates
        const hospitals = await Hospital.findNearby(longitude, latitude, maxDistance);

        // Format the response with distance info
        const formattedHospitals = hospitals.map(h => ({
            id: h._id,
            name: h.name,
            address: h.address,
            city: h.city,
            phone: h.phone,
            type: h.type,
            hasBloodBank: h.hasBloodBank,
            availableBloodGroups: h.availableBloodGroups,
            coordinates: h.location?.coordinates
        }));

        console.log(`✅ Found ${formattedHospitals.length} hospitals nearby`);

        res.json({
            success: true,
            message: `Found ${formattedHospitals.length} hospitals within ${maxDistance}km`,
            searchedLocation: { latitude, longitude, radiusKm: maxDistance },
            count: formattedHospitals.length,
            data: { hospitals: formattedHospitals }
        });

    } catch (error) {
        console.error('❌ Nearby hospital search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during nearby hospital search'
        });
    }
});

/**
 * @route   GET /api/hospitals/cities
 * @desc    Get list of all cities with hospitals
 * @access  Public
 */
router.get('/cities', async (req, res) => {
    try {
        const cities = await Hospital.distinct('city', { isActive: true });

        // Capitalize city names for display
        const formattedCities = cities.map(city => ({
            value: city,
            label: city.charAt(0).toUpperCase() + city.slice(1)
        }));

        res.json({
            success: true,
            count: formattedCities.length,
            data: { cities: formattedCities }
        });

    } catch (error) {
        console.error('❌ Error fetching cities:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching cities'
        });
    }
});

/**
 * @route   GET /api/hospitals/:id
 * @desc    Get single hospital by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            data: { hospital }
        });

    } catch (error) {
        console.error('❌ Error fetching hospital:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching hospital'
        });
    }
});

export default router;
