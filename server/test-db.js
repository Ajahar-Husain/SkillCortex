import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const user = new User();
            user.name = "Direct Test";
            user.email = "direct_test@test.com";
            user.password = "password123";
            user.role = "candidate";

            console.log("User object before save:", user.toObject());
            await user.save();
            console.log("Saved successfully!");
            process.exit(0);
        } catch (err) {
            console.error("Save Error:", err.message);
            console.error("Stack:", err.stack);
            process.exit(1);
        }
    });
