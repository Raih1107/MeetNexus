import express, { Router } from 'express';
import "dotenv/config" ;
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import { connectDB } from './lib/db.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT ;

app.use(cookieParser());
app.use(express.json());


app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.listen(PORT, ()=> {
    console.log(`server running on ${PORT}`);
    console.log("Connected DB:", mongoose.connection.name);
    connectDB();
})