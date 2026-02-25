import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB DB');

        // Create an HR User bypass mongoose hooks
        const db = mongoose.connection.db;

        // Create Jobs collection directly
        const hrUserId = new mongoose.Types.ObjectId();

        await db.collection('jobs').deleteMany({});
        await db.collection('jobs').insertMany([
            {
                title: 'Full Stack Engineer - AI Integration',
                company: 'TechFlow Solutions',
                description: 'We are looking for a highly skilled Full Stack Engineer to integrate large language models (like Gemini) into our interactive web applications. You will work extensively with React, Node.js, and WebRTC.',
                requirements: ['Expertise in React and Framer Motion', 'Node.js and Express backend experience', 'Knowledge of WebSockets/WebRTC', 'Experience with AI APIs (Google GenAI, OpenAI)'],
                location: 'Remote',
                salary: '$120,000 - $150,000',
                hrRef: hrUserId,
                status: 'open',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Senior Java Backend Engineer',
                company: 'Enterprise Systems Ltd',
                description: 'Join our backend team to build scalable microservices using Spring Boot. You will optimize database queries and handle high-throughput financial transactions.',
                requirements: ['5+ years Java experience', 'Spring Boot Mastery', 'Microservices Architecture', 'PostgreSQL & MongoDB'],
                location: 'New York, NY',
                salary: '$140,000 - $170,000',
                hrRef: hrUserId,
                status: 'open',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        console.log('Seeded Jobs natively');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
