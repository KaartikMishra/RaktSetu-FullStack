import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        // Log connection info (database name only, no credentials)
        const dbName = conn.connection.db.databaseName;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${dbName}`);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};
