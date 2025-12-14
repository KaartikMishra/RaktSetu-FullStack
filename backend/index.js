import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb } from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bloodRequestRoutes from './routes/bloodRequests.js';
import adminRoutes from './routes/admin.js';
import registerRoutes from './routes/register.js';
import adminAuthRoutes from './routes/adminAuth.js';
import hospitalRoutes from './routes/hospitals.js';
import hospitalStaffRoutes from './routes/hospitalStaff.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'RaktSetu API is running',
        version: '1.0.0',
        endpoints: {
            registration: {
                donor: 'POST /api/register/register-donor',
                hospital: 'POST /api/register/register-hospital',
                seeker: 'POST /api/register/register-seeker (returns nearby hospitals)'
            },
            hospitals: {
                search: 'GET /api/hospitals/search?location=delhi',
                nearby: 'GET /api/hospitals/nearby?lat=28.6&lng=77.2&radius=10',
                list: 'GET /api/hospitals?city=mumbai',
                cities: 'GET /api/hospitals/cities'
            },
            hospitalStaff: {
                inventory: 'GET /api/hospital/inventory',
                addStock: 'POST /api/hospital/inventory/add',
                updateStock: 'POST /api/hospital/inventory/update',
                reduceStock: 'POST /api/hospital/inventory/reduce',
                reminders: 'GET /api/hospital/reminders',
                sendReminders: 'POST /api/hospital/reminders/send'
            },
            admin: {
                login: 'POST /api/admin/admin-login',
                dashboard: 'GET /api/admin/admin-dashboard'
            }
        }
    });
});

// Serve static files from uploads directory
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', uploadRoutes); // Register upload route under /api/users
app.use('/api/requests', bloodRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAuthRoutes);      // Admin login and dashboard
app.use('/api/register', registerRoutes);    // Role-specific registration
app.use('/api/hospitals', hospitalRoutes);   // Hospital search
app.use('/api/hospital', hospitalStaffRoutes); // Hospital staff inventory & reminders

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to database and start server
connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});