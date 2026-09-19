import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const db = mongoose.connection.db;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password123", salt);

            const result = await db.collection('users').insertOne({
                name: "Direct Test",
                email: "direct_driver@test.com",
                password: hashedPassword,
                role: "candidate",
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log("Saved natively successfully!", result);
            process.exit(0);
        } catch (err) {
            console.error("Native Save Error:", err.message);
            process.exit(1);
        }
    });
