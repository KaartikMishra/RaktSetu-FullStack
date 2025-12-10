/**
 * Hospital Staff Routes
 * 
 * Routes for hospital staff to manage:
 * 1. Blood Inventory - View and update stock levels
 * 2. Donor Reminders - Send notifications to eligible donors
 */

import express from 'express';
import BloodInventory from '../models/BloodInventory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is hospital staff
const isHospitalStaff = (req, res, next) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Hospital staff only.'
        });
    }
    next();
};

// Apply authentication to all routes
router.use(protect);
router.use(isHospitalStaff);

// ============================================================================
// BLOOD INVENTORY ROUTES
// ============================================================================

/**
 * @route   GET /api/hospital/inventory
 * @desc    Get blood inventory for the logged-in hospital
 * @access  Hospital Staff
 */
router.get('/inventory', async (req, res) => {
    try {
        const hospitalId = req.user._id;
        console.log(`📦 Fetching inventory for hospital: ${hospitalId}`);

        // Get all inventory items for this hospital
        let inventory = await BloodInventory.getHospitalInventory(hospitalId);

        // If no inventory exists, create default entries for all blood groups
        if (inventory.length === 0) {
            console.log('📝 Creating default inventory entries...');
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

            for (const bg of bloodGroups) {
                await BloodInventory.create({
                    hospital_id: hospitalId,
                    blood_group: bg,
                    units_available: 0
                });
            }

            inventory = await BloodInventory.getHospitalInventory(hospitalId);
        }

        // Format response
        const formattedInventory = inventory.map(item => ({
            id: item._id,
            blood_group: item.blood_group,
            units_available: item.units_available,
            last_updated: item.last_updated,
            is_low_stock: item.isLowStock(),
            min_threshold: item.min_threshold
        }));

        res.json({
            success: true,
            count: formattedInventory.length,
            data: { inventory: formattedInventory }
        });

    } catch (error) {
        console.error('❌ Error fetching inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching inventory'
        });
    }
});

/**
 * @route   POST /api/hospital/inventory/add
 * @desc    Add units to a blood group
 * @access  Hospital Staff
 * 
 * Body: { blood_group: "A+", units: 5 }
 */
router.post('/inventory/add', async (req, res) => {
    try {
        const { blood_group, units } = req.body;
        const hospitalId = req.user._id;

        // Validate input
        if (!blood_group || units === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Blood group and units are required'
            });
        }

        const unitsToAdd = parseInt(units);
        if (isNaN(unitsToAdd) || unitsToAdd <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Units must be a positive number'
            });
        }

        console.log(`➕ Adding ${unitsToAdd} units of ${blood_group}`);

        // Add units to inventory
        const inventory = await BloodInventory.addUnits(hospitalId, blood_group, unitsToAdd);

        res.json({
            success: true,
            message: `Added ${unitsToAdd} units of ${blood_group}. Total: ${inventory.units_available}`,
            data: {
                blood_group: inventory.blood_group,
                units_available: inventory.units_available,
                last_updated: inventory.last_updated
            }
        });

    } catch (error) {
        console.error('❌ Error adding inventory:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error adding inventory'
        });
    }
});

/**
 * @route   POST /api/hospital/inventory/update
 * @desc    Set a new value for units_available
 * @access  Hospital Staff
 * 
 * Body: { blood_group: "A+", units: 10 }
 */
router.post('/inventory/update', async (req, res) => {
    try {
        const { blood_group, units } = req.body;
        const hospitalId = req.user._id;

        // Validate input
        if (!blood_group || units === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Blood group and units are required'
            });
        }

        const newUnits = parseInt(units);
        if (isNaN(newUnits) || newUnits < 0) {
            return res.status(400).json({
                success: false,
                message: 'Units cannot be negative'
            });
        }

        console.log(`🔄 Updating ${blood_group} to ${newUnits} units`);

        // Update inventory
        const inventory = await BloodInventory.upsertInventory(hospitalId, blood_group, newUnits);

        res.json({
            success: true,
            message: `Updated ${blood_group} to ${newUnits} units`,
            data: {
                blood_group: inventory.blood_group,
                units_available: inventory.units_available,
                last_updated: inventory.last_updated
            }
        });

    } catch (error) {
        console.error('❌ Error updating inventory:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error updating inventory'
        });
    }
});

/**
 * @route   POST /api/hospital/inventory/reduce
 * @desc    Reduce units from a blood group (when blood is used)
 * @access  Hospital Staff
 * 
 * Body: { blood_group: "A+", units: 2 }
 */
router.post('/inventory/reduce', async (req, res) => {
    try {
        const { blood_group, units } = req.body;
        const hospitalId = req.user._id;

        // Validate input
        if (!blood_group || units === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Blood group and units are required'
            });
        }

        const unitsToReduce = parseInt(units);
        if (isNaN(unitsToReduce) || unitsToReduce <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Units must be a positive number'
            });
        }

        console.log(`➖ Reducing ${unitsToReduce} units of ${blood_group}`);

        // Reduce units from inventory
        const inventory = await BloodInventory.reduceUnits(hospitalId, blood_group, unitsToReduce);

        res.json({
            success: true,
            message: `Reduced ${unitsToReduce} units of ${blood_group}. Remaining: ${inventory.units_available}`,
            data: {
                blood_group: inventory.blood_group,
                units_available: inventory.units_available,
                last_updated: inventory.last_updated,
                is_low_stock: inventory.isLowStock()
            }
        });

    } catch (error) {
        console.error('❌ Error reducing inventory:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error reducing inventory'
        });
    }
});

// ============================================================================
// DONOR REMINDER ROUTES
// ============================================================================

/**
 * Calculate if a donor is eligible to donate (3 months after last donation)
 */
const isDonorEligible = (lastDonationDate) => {
    if (!lastDonationDate) return true; // Never donated = eligible

    const lastDonation = new Date(lastDonationDate);
    const threeMonthsLater = new Date(lastDonation);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    return new Date() >= threeMonthsLater;
};

/**
 * Calculate eligible date (3 months after last donation)
 */
const getEligibleDate = (lastDonationDate) => {
    if (!lastDonationDate) return new Date(); // Already eligible

    const lastDonation = new Date(lastDonationDate);
    const eligibleDate = new Date(lastDonation);
    eligibleDate.setMonth(eligibleDate.getMonth() + 3);

    return eligibleDate;
};

/**
 * @route   GET /api/hospital/reminders
 * @desc    Get list of donors eligible for donation reminder
 * @access  Hospital Staff
 */
router.get('/reminders', async (req, res) => {
    try {
        const hospitalId = req.user._id;
        console.log(`🔔 Fetching eligible donors for reminders`);

        // Find all donors (users with role 'donor')
        const donors = await User.find({ role: 'donor' })
            .select('name email phone profile.bloodGroup profile.lastDonation');

        // Check each donor's eligibility
        const eligibleDonors = [];

        for (const donor of donors) {
            const lastDonation = donor.profile?.lastDonation;
            const isEligible = isDonorEligible(lastDonation);

            if (isEligible) {
                // Check if reminder was already sent recently
                const reminderSent = await Notification.wasReminderSentRecently(
                    donor._id,
                    hospitalId,
                    30 // Don't re-remind within 30 days
                );

                eligibleDonors.push({
                    id: donor._id,
                    name: donor.name,
                    email: donor.email,
                    phone: donor.phone,
                    blood_group: donor.profile?.bloodGroup || 'Unknown',
                    last_donation: lastDonation,
                    eligible_from: getEligibleDate(lastDonation),
                    reminder_sent: reminderSent
                });
            }
        }

        res.json({
            success: true,
            count: eligibleDonors.length,
            data: {
                donors: eligibleDonors,
                pending_reminders: eligibleDonors.filter(d => !d.reminder_sent).length
            }
        });

    } catch (error) {
        console.error('❌ Error fetching eligible donors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching eligible donors'
        });
    }
});

/**
 * @route   POST /api/hospital/reminders/send
 * @desc    Send reminders to all eligible donors
 * @access  Hospital Staff
 */
router.post('/reminders/send', async (req, res) => {
    try {
        const hospitalId = req.user._id;
        const hospitalName = req.user.profile?.hospitalName || req.user.name;

        console.log(`📧 Sending reminders from hospital: ${hospitalName}`);

        // Find eligible donors
        const donors = await User.find({ role: 'donor' })
            .select('name email phone profile.bloodGroup profile.lastDonation');

        let sentCount = 0;
        let skippedCount = 0;
        const results = [];

        for (const donor of donors) {
            const lastDonation = donor.profile?.lastDonation;

            if (!isDonorEligible(lastDonation)) {
                continue; // Skip ineligible donors
            }

            // Check if reminder was sent recently
            const recentlyReminded = await Notification.wasReminderSentRecently(
                donor._id,
                hospitalId,
                30
            );

            if (recentlyReminded) {
                skippedCount++;
                continue;
            }

            // Create reminder message
            const message = `Hello ${donor.name}! You're eligible to donate blood again. Please visit ${hospitalName} to save a life. Your blood type ${donor.profile?.bloodGroup || ''} is needed!`;

            // Create notification record
            const notification = await Notification.create({
                donor_id: donor._id,
                hospital_id: hospitalId,
                type: 'donation_reminder',
                message: message,
                delivery_method: 'console', // For now, just log
                status: 'sent',
                sent_at: new Date()
            });

            // Simulate sending (console.log for now)
            console.log(`📨 REMINDER SENT to ${donor.name} (${donor.email}): ${message}`);

            sentCount++;
            results.push({
                donor_name: donor.name,
                email: donor.email,
                status: 'sent'
            });
        }

        console.log(`✅ Sent ${sentCount} reminders, skipped ${skippedCount} (already reminded)`);

        res.json({
            success: true,
            message: `Reminders sent to ${sentCount} eligible donors. ${skippedCount} already reminded recently.`,
            data: {
                sent_count: sentCount,
                skipped_count: skippedCount,
                results: results
            }
        });

    } catch (error) {
        console.error('❌ Error sending reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error sending reminders'
        });
    }
});

/**
 * @route   POST /api/hospital/reminders/send-single
 * @desc    Send reminder to a single donor
 * @access  Hospital Staff
 * 
 * Body: { donor_id: "..." }
 */
router.post('/reminders/send-single', async (req, res) => {
    try {
        const { donor_id } = req.body;
        const hospitalId = req.user._id;
        const hospitalName = req.user.profile?.hospitalName || req.user.name;

        if (!donor_id) {
            return res.status(400).json({
                success: false,
                message: 'Donor ID is required'
            });
        }

        // Find the donor
        const donor = await User.findOne({ _id: donor_id, role: 'donor' });

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        // Create reminder message
        const message = `Hello ${donor.name}! You're eligible to donate blood again. Please visit ${hospitalName} to save a life.`;

        // Create notification record
        await Notification.create({
            donor_id: donor._id,
            hospital_id: hospitalId,
            type: 'donation_reminder',
            message: message,
            delivery_method: 'console',
            status: 'sent',
            sent_at: new Date()
        });

        console.log(`📨 REMINDER SENT to ${donor.name}: ${message}`);

        res.json({
            success: true,
            message: `Reminder sent to ${donor.name}`,
            data: {
                donor_name: donor.name,
                email: donor.email
            }
        });

    } catch (error) {
        console.error('❌ Error sending single reminder:', error);
        res.status(500).json({
            success: false,
            message: 'Server error sending reminder'
        });
    }
});

export default router;
