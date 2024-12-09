import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { ConnectDb } from './db/ConnectDb.js';
import cors from "cors";
import connectCloudinary from './utils/cloudinary.js';
import { clerkMiddleware } from '@clerk/express'

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies


app.use(clerkMiddleware())

connectCloudinary()

import songRoutes from './routes/song.js'
import authRoute from './routes/auth.route.js'
import playlist from './routes/playList.route.js'
app.use('/api/v1/' , songRoutes)
app.use('/api/v1/' , authRoute)
app.use('/api/v1/' , playlist)

app.listen(PORT , ()=>{
  ConnectDb();
  console.log('server listening on port : '+PORT);
})