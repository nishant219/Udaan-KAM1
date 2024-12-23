import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import winston from './winston.js';

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        winston.info('MongoDB Connected');
        console.log('MongoDB Connected');
    } catch (error) {
        winston.error(error.message);
        console.log(error.message);
        process.exit(1);
    }
}

export default connectDB;