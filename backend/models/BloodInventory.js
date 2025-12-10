/**
 * BloodInventory Model
 * 
 * Stores blood stock data for each hospital.
 * Each hospital can have multiple blood groups with different quantities.
 */

import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema({
    // Reference to the hospital (user with role 'hospital')
    hospital_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Hospital ID is required']
    },

    // Blood group type
    blood_group: {
        type: String,
        required: [true, 'Blood group is required'],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },

    // Number of units available
    units_available: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Units cannot be negative']
    },

    // Last update timestamp
    last_updated: {
        type: Date,
        default: Date.now
    },

    // Minimum threshold for low stock warning
    min_threshold: {
        type: Number,
        default: 2
    }
}, {
    timestamps: true
});

// Compound index for hospital + blood group (unique combination)
bloodInventorySchema.index({ hospital_id: 1, blood_group: 1 }, { unique: true });

/**
 * Check if stock is low (below threshold)
 */
bloodInventorySchema.methods.isLowStock = function () {
    return this.units_available <= this.min_threshold;
};

/**
 * Static method to get all inventory for a hospital
 */
bloodInventorySchema.statics.getHospitalInventory = async function (hospitalId) {
    return this.find({ hospital_id: hospitalId })
        .sort({ blood_group: 1 });
};

/**
 * Static method to update or create inventory for a blood group
 */
bloodInventorySchema.statics.upsertInventory = async function (hospitalId, bloodGroup, units) {
    return this.findOneAndUpdate(
        { hospital_id: hospitalId, blood_group: bloodGroup },
        {
            units_available: units,
            last_updated: new Date()
        },
        { upsert: true, new: true, runValidators: true }
    );
};

/**
 * Static method to add units to inventory
 */
bloodInventorySchema.statics.addUnits = async function (hospitalId, bloodGroup, unitsToAdd) {
    const inventory = await this.findOne({ hospital_id: hospitalId, blood_group: bloodGroup });

    if (inventory) {
        inventory.units_available += unitsToAdd;
        inventory.last_updated = new Date();
        return inventory.save();
    } else {
        return this.create({
            hospital_id: hospitalId,
            blood_group: bloodGroup,
            units_available: unitsToAdd,
            last_updated: new Date()
        });
    }
};

/**
 * Static method to reduce units from inventory
 */
bloodInventorySchema.statics.reduceUnits = async function (hospitalId, bloodGroup, unitsToReduce) {
    const inventory = await this.findOne({ hospital_id: hospitalId, blood_group: bloodGroup });

    if (!inventory) {
        throw new Error(`No inventory found for blood group ${bloodGroup}`);
    }

    if (inventory.units_available < unitsToReduce) {
        throw new Error(`Insufficient stock. Only ${inventory.units_available} units available.`);
    }

    inventory.units_available -= unitsToReduce;
    inventory.last_updated = new Date();
    return inventory.save();
};

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);

export default BloodInventory;
