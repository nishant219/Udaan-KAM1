import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/database.js';
import winston from './src/config/winston.js';

const app=express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong!'
    });
});

  app.all('*', (req, res, next) => {
    res.status(404).json({
      status: 'error',
      message: `Can't find ${req.originalUrl} on this server!`
    });
});  

const startServer= async()=>{
    try{
        await connectDB();
        const PORT=process.env.PORT || 3000;
        app.listen(PORT,()=>{
            winston.info(`Server is running on port ${PORT}💥 `);
        });
        console.log(`Server is running on port ${PORT}💥 `);
    }catch(error){
        winston.error(`Error in startServer:`, error?.message);
        process.exit(1);
    }
}  

startServer();

export default app;