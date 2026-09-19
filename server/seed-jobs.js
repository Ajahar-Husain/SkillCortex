import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import User from './models/User.js';

dotenv.config();

const seedJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB for seeding.");

        // First, check if there's an HR user to attach these jobs to
        let hrUser = await User.findOne({ role: 'hr' });
        if (!hrUser) {
            console.log("No HR user found. Creating a dummy HR user 'hr_seed@skillcortex.com'...");
            hrUser = await User.create({
                name: 'Seed HR',
                email: 'hr_seed@skillcortex.com',
                password: 'password123', // In real app should be hashed, but schema hooks handle it? Let's check User schema hook
            });
            // User schema hashes before save if we used save, create goes through save hooks.
        }

        const sampleJobs = [
            {
                title: "Frontend Engineer (React)",
                company: "Google",
                description: "We are looking for a skilled Frontend Engineer to build intuitive, dynamic user interfaces for our core search products.",
                requirements: ["React", "JavaScript", "HTML", "CSS", "Performance Optimization"],
                location: "Mountain View, CA",
                salary: "₹30L - ₹50L",
                postedBy: hrUser._id,
                status: 'Open'
            },
            {
                title: "Software Development Engineer",
                company: "TCS",
                description: "Join TCS to work on diverse enterprise client projects requiring strong foundation in Java and backend systems.",
                requirements: ["Java", "Spring Boot", "Microservices", "SQL"],
                location: "Pune, India",
                salary: "₹7L - ₹12L",
                postedBy: hrUser._id,
                status: 'Open'
            },
            {
                title: "Backend Developer (Node.js)",
                company: "Zomato",
                description: "Scale our food delivery backend. You will be responsible for building high-throughput services and optimizing database queries.",
                requirements: ["Node.js", "Express", "MongoDB", "Redis", "System Design"],
                location: "Gurugram, India",
                salary: "₹18L - ₹28L",
                postedBy: hrUser._id,
                status: 'Open'
            },
            {
                title: "Full Stack Developer",
                company: "Accenture",
                description: "Looking for a versatile MERN stack developer to accelerate digital transformation for our global clients.",
                requirements: ["MongoDB", "Express", "React", "Node.js", "Agile"],
                location: "Bengaluru, India",
                salary: "₹10L - ₹16L",
                postedBy: hrUser._id,
                status: 'Open'
            },
            {
                title: "Systems Engineer",
                company: "HP",
                description: "Work on low-level system design and performance tuning for our next generation of computing devices.",
                requirements: ["C", "C++", "Linux", "OS Internals", "Debugging"],
                location: "Bengaluru, India",
                salary: "₹12L - ₹20L",
                postedBy: hrUser._id,
                status: 'Open'
            }
        ];

        console.log("Clearing old seeded jobs from these companies to prevent duplicates...");
        await Job.deleteMany({ company: { $in: ["Google", "TCS", "Zomato", "Accenture", "HP"] } });

        await Job.insertMany(sampleJobs);
        console.log("Successfully seeded 5 authentic sample jobs.");

        mongoose.disconnect();
    } catch (err) {
        console.error("Seeding error:", err);
        mongoose.disconnect();
    }
};

seedJobs();
