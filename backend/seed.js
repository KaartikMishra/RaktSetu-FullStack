/**
 * RaktSetu Database Seed Script
 * 
 * This script seeds the database with:
 * 1. An admin account
 * 2. Sample hospital data across major Indian cities
 * 
 * Run with: npm run seed
 * 
 * Admin Credentials:
 * - Email: admin_raktsetu@raktsetu.com
 * - Password: Rakt@2025
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const ADMIN_CONFIG = {
    name: 'RaktSetu Administrator',
    email: 'admin_raktsetu@raktsetu.com',
    password: 'Rakt@2025',
    phone: '+91-9999999999',
    location: 'New Delhi, India',
    role: 'admin',
    verified: true
};

// Sample hospital data across major Indian cities
const HOSPITALS_DATA = [
    // Delhi Hospitals
    {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        phone: '+91-11-26588500',
        email: 'director@aiims.edu',
        website: 'https://www.aiims.edu',
        address: 'Ansari Nagar, New Delhi',
        city: 'delhi',
        state: 'Delhi',
        pincode: '110029',
        location: { type: 'Point', coordinates: [77.2090, 28.5672] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Safdarjung Hospital',
        phone: '+91-11-26707437',
        email: 'info@safdarjunghospital.nic.in',
        address: 'Ring Road, Safdarjung Enclave',
        city: 'delhi',
        state: 'Delhi',
        pincode: '110029',
        location: { type: 'Point', coordinates: [77.2023, 28.5679] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'O+', 'O-', 'AB+'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Sir Ganga Ram Hospital',
        phone: '+91-11-25750000',
        email: 'info@sgrh.com',
        website: 'https://www.sgrh.com',
        address: 'Rajinder Nagar, New Delhi',
        city: 'delhi',
        state: 'Delhi',
        pincode: '110060',
        location: { type: 'Point', coordinates: [77.1855, 28.6411] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Max Super Speciality Hospital, Saket',
        phone: '+91-11-26515050',
        email: 'info@maxhealthcare.com',
        website: 'https://www.maxhealthcare.in',
        address: '1, Press Enclave Road, Saket',
        city: 'delhi',
        state: 'Delhi',
        pincode: '110017',
        location: { type: 'Point', coordinates: [77.2177, 28.5274] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'AB+', 'O+'],
        operatingHours: { is24x7: true }
    },

    // Mumbai Hospitals
    {
        name: 'Tata Memorial Hospital',
        phone: '+91-22-27405000',
        email: 'info@tmc.gov.in',
        website: 'https://tmc.gov.in',
        address: 'Dr. E Borges Road, Parel',
        city: 'mumbai',
        state: 'Maharashtra',
        pincode: '400012',
        location: { type: 'Point', coordinates: [72.8425, 19.0048] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Lilavati Hospital',
        phone: '+91-22-26751000',
        email: 'info@lilavatihospital.com',
        website: 'https://www.lilavatihospital.com',
        address: 'A-791, Bandra Reclamation, Bandra West',
        city: 'mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        location: { type: 'Point', coordinates: [72.8296, 19.0509] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'O+', 'AB+'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'KEM Hospital',
        phone: '+91-22-24136051',
        email: 'info@kem.edu',
        address: 'Acharya Donde Marg, Parel',
        city: 'mumbai',
        state: 'Maharashtra',
        pincode: '400012',
        location: { type: 'Point', coordinates: [72.8423, 19.0011] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },

    // Bangalore Hospitals
    {
        name: 'Manipal Hospital, Bangalore',
        phone: '+91-80-25024444',
        email: 'info@manipalhospital.org',
        website: 'https://www.manipalhospitals.com',
        address: '98, HAL Old Airport Road, Kodihalli',
        city: 'bangalore',
        state: 'Karnataka',
        pincode: '560017',
        location: { type: 'Point', coordinates: [77.6480, 12.9584] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'St. John\'s Medical College Hospital',
        phone: '+91-80-22065000',
        email: 'info@stjohns.in',
        website: 'https://www.stjohns.in',
        address: 'Sarjapur Road, Koramangala',
        city: 'bangalore',
        state: 'Karnataka',
        pincode: '560034',
        location: { type: 'Point', coordinates: [77.6244, 12.9279] },
        type: 'trust',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'AB+', 'O+'],
        operatingHours: { is24x7: true }
    },

    // Chennai Hospitals
    {
        name: 'Apollo Hospitals, Chennai',
        phone: '+91-44-28296802',
        email: 'info@apollohospitals.com',
        website: 'https://www.apollohospitals.com',
        address: '21, Greams Lane, Off Greams Road',
        city: 'chennai',
        state: 'Tamil Nadu',
        pincode: '600006',
        location: { type: 'Point', coordinates: [80.2510, 13.0569] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Government General Hospital, Chennai',
        phone: '+91-44-25305000',
        email: 'gghmmc@tn.gov.in',
        address: 'EVR Periyar Salai, Park Town',
        city: 'chennai',
        state: 'Tamil Nadu',
        pincode: '600003',
        location: { type: 'Point', coordinates: [80.2764, 13.0827] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'O+', 'O-', 'AB+'],
        operatingHours: { is24x7: true }
    },

    // Kolkata Hospitals
    {
        name: 'SSKM Hospital',
        phone: '+91-33-22041101',
        email: 'sskm@wbhealth.gov.in',
        address: '244, AJC Bose Road',
        city: 'kolkata',
        state: 'West Bengal',
        pincode: '700020',
        location: { type: 'Point', coordinates: [88.3486, 22.5405] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Apollo Gleneagles Hospital',
        phone: '+91-33-23203040',
        email: 'kolkata@apollohospitals.com',
        website: 'https://kolkata.apollohospitals.com',
        address: '58, Canal Circular Road',
        city: 'kolkata',
        state: 'West Bengal',
        pincode: '700054',
        location: { type: 'Point', coordinates: [88.3959, 22.5175] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'O+', 'AB+'],
        operatingHours: { is24x7: true }
    },

    // Hyderabad Hospitals
    {
        name: 'NIMS Hospital',
        phone: '+91-40-23391245',
        email: 'info@nims.ac.in',
        website: 'https://nims.ac.in',
        address: 'Punjagutta, Hyderabad',
        city: 'hyderabad',
        state: 'Telangana',
        pincode: '500082',
        location: { type: 'Point', coordinates: [78.4487, 17.4189] },
        type: 'government',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'],
        operatingHours: { is24x7: true }
    },
    {
        name: 'Yashoda Hospitals',
        phone: '+91-40-45674567',
        email: 'info@yashodahospitals.com',
        website: 'https://www.yashodahospitals.com',
        address: 'Behind Erra Manzil, Somajiguda',
        city: 'hyderabad',
        state: 'Telangana',
        pincode: '500082',
        location: { type: 'Point', coordinates: [78.4604, 17.4258] },
        type: 'private',
        hasBloodBank: true,
        availableBloodGroups: ['A+', 'B+', 'O+'],
        operatingHours: { is24x7: true }
    }
];

// ============================================================================
// SCHEMAS (Inline to avoid circular dependency issues)
// ============================================================================

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    location: { type: String },
    role: { type: String, enum: ['admin', 'donor', 'seeker', 'hospital'], default: 'seeker' },
    verified: { type: Boolean, default: false },
    profile: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    website: String,
    address: { type: String, required: true },
    city: { type: String, required: true, lowercase: true },
    state: String,
    pincode: String,
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    type: { type: String, enum: ['government', 'private', 'trust', 'clinic'] },
    hasBloodBank: { type: Boolean, default: true },
    availableBloodGroups: [String],
    operatingHours: { is24x7: Boolean },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: true }
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ city: 1 });

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedDatabase() {
    try {
        console.log('🌱 Starting RaktSetu database seeding...\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Create models
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);

        // Seed admin account
        await seedAdmin(User);

        // Seed hospitals
        await seedHospitals(Hospital);

        // Show statistics
        await showStats(User, Hospital);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        console.log('✨ Seeding complete!\n');
    }
}

async function seedAdmin(User) {
    console.log('👤 Seeding admin account...');

    const existingAdmin = await User.findOne({ email: ADMIN_CONFIG.email });

    if (existingAdmin) {
        console.log('   ℹ️  Admin already exists, updating password...');
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(ADMIN_CONFIG.password, salt);
        existingAdmin.verified = true;
        await existingAdmin.save();
        console.log('   ✅ Admin password updated');
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);

        await User.create({
            ...ADMIN_CONFIG,
            password: hashedPassword
        });
        console.log('   ✅ Admin account created');
    }

    console.log('\n   ═══════════════════════════════════════════');
    console.log('          🔐 ADMIN LOGIN CREDENTIALS          ');
    console.log('   ═══════════════════════════════════════════');
    console.log(`   Email:    ${ADMIN_CONFIG.email}`);
    console.log(`   Password: ${ADMIN_CONFIG.password}`);
    console.log('   ═══════════════════════════════════════════\n');
}

async function seedHospitals(Hospital) {
    console.log('🏥 Seeding hospitals...');

    // Count existing hospitals
    const existingCount = await Hospital.countDocuments();

    if (existingCount >= HOSPITALS_DATA.length) {
        console.log(`   ℹ️  ${existingCount} hospitals already exist, skipping...\n`);
        return;
    }

    // Clear existing hospitals and re-seed
    await Hospital.deleteMany({});

    // Insert all hospitals
    const result = await Hospital.insertMany(HOSPITALS_DATA);
    console.log(`   ✅ Seeded ${result.length} hospitals\n`);

    // Show hospitals by city
    const cityCounts = {};
    HOSPITALS_DATA.forEach(h => {
        cityCounts[h.city] = (cityCounts[h.city] || 0) + 1;
    });

    console.log('   📍 Hospitals by city:');
    Object.entries(cityCounts).forEach(([city, count]) => {
        console.log(`      ${city.charAt(0).toUpperCase() + city.slice(1)}: ${count} hospitals`);
    });
    console.log('');
}

async function showStats(User, Hospital) {
    const [totalUsers, admins, donors, hospitals, seekers, totalHospitals] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'donor' }),
        User.countDocuments({ role: 'hospital' }),
        User.countDocuments({ role: 'seeker' }),
        Hospital.countDocuments()
    ]);

    console.log('📊 Database Statistics:');
    console.log('   ────────────────────────');
    console.log(`   Total Users:     ${totalUsers}`);
    console.log(`     → Admins:      ${admins}`);
    console.log(`     → Donors:      ${donors}`);
    console.log(`     → Hospital:    ${hospitals}`);
    console.log(`     → Seekers:     ${seekers}`);
    console.log(`   Total Hospitals: ${totalHospitals}`);
    console.log('   ────────────────────────');
}

// Run the seed function
seedDatabase();
