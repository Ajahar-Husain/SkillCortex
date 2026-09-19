import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import CandidateReview from '../models/CandidateReview.js';
import Resume from '../models/Resume.js';
import { auth, isHR } from '../middleware/auth.js';
import { notify, prettyStatus } from '../services/notify.js';

const router = express.Router();
const toArray = (v) => (typeof v === 'string' ? v.split(',').map((r) => r.trim()).filter(Boolean) : (Array.isArray(v) ? v : []));

// Idempotent sample-job catalogue (mirrors the courses/blogs seeding pattern in
// platform.js) so the landing-page Featured Opportunities and the /jobs browse
// page always have real data to show.
//
// It guarantees that every filter offered by the Jobs UI has matching cards:
//   Work Mode        -> Remote | Hybrid | Office
//   Employment Type  -> Full Time | Part Time | Contract | Internship | Freelance
//   Experience Level -> Entry (min <= 2 yrs) | Mid (2-5 yrs) | Senior (min >= 5 yrs)
// Entries are upserted on title+company, so roles created by HR are never
// duplicated while any new sample role is still added to an existing collection.
let sampleJobsEnsured = false;

async function ensureSampleJobs() {
    if (sampleJobsEnsured) return;
    sampleJobsEnsured = true;

    const sampleJobs = [
        {
            title: 'Senior Frontend Engineer', company: 'Rivulet Tech',
            description: 'Build performant, accessible UI at scale. Own the component library, performance budgets, and cross-team design-system adoption.',
            responsibilities: 'Own frontend architecture; mentor junior engineers; collaborate with design on the component system; drive performance and accessibility improvements.',
            requirements: ['5+ years React', 'Strong TypeScript', 'Design systems experience', 'Performance optimization'],
            skills: ['React', 'TypeScript', 'CSS', 'Design Systems', 'Vite'],
            location: 'Remote (US/EU)', salary: '₹18,00,000 - ₹32,00,000 PA',
            salaryMin: 1800000, salaryMax: 3200000, experienceMin: 5, experienceMax: 9,
            employmentType: 'Full Time', workMode: 'Remote', department: 'Engineering',
            urgentHiring: true, verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 15, difficulty: 'Advanced', numQuestions: 10, passingScore: 75 }
        },
        {
            title: 'Backend Engineer — Node.js', company: 'StackBridge Inc.',
            description: 'Design and ship APIs and microservices for a high-traffic SaaS platform. Strong preference for TypeScript and event-driven architecture.',
            responsibilities: 'Design REST and GraphQL APIs; build and maintain microservices; write integration tests; participate in on-call rotations.',
            requirements: ['4+ years backend with Node.js', 'PostgreSQL or MongoDB', 'Message queues (RabbitMQ/Kafka)', 'Docker and CI/CD'],
            skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'Kafka'],
            location: 'Bangalore, India', salary: '₹14,00,000 - ₹22,00,000 PA',
            salaryMin: 1400000, salaryMax: 2200000, experienceMin: 3, experienceMax: 6,
            employmentType: 'Full Time', workMode: 'Hybrid', department: 'Backend',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 12, difficulty: 'Intermediate', numQuestions: 8, passingScore: 70 }
        },
        {
            title: 'Full Stack Developer (MERN)', company: 'Meridian Solutions',
            description: 'End-to-end ownership of features from database to UI. Build dashboards, real-time data pipelines, and customer-facing tools.',
            responsibilities: 'Build features across the stack; write clean, tested code; pair with product and design; contribute to technical decisions.',
            requirements: ['3+ years React and Node.js', 'MongoDB or PostgreSQL', 'REST API design', 'AWS basics'],
            skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'AWS'],
            location: 'Hyderabad, India', salary: '₹8,00,000 - ₹15,00,000 PA',
            salaryMin: 800000, salaryMax: 1500000, experienceMin: 2, experienceMax: 5,
            employmentType: 'Full Time', workMode: 'Hybrid', department: 'Full Stack',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 10, difficulty: 'Intermediate', numQuestions: 8, passingScore: 70 }
        },
        {
            title: 'Part-Time React Mentor', company: 'SkillCortex',
            description: 'Guide junior developers through React projects, code reviews, and mock interviews. Flexible hours — ideal for senior engineers.',
            responsibilities: 'Conduct weekly 1:1 mentorship calls; review student projects; deliver mock interviews; create learning resources.',
            requirements: ['Strong React and JavaScript knowledge', 'Good communication skills', 'Previous mentoring experience preferred'],
            skills: ['React', 'JavaScript', 'TypeScript', 'Teaching'],
            location: 'Remote', salary: '₹300 - ₹600 / hour',
            salaryMin: 300, salaryMax: 600, experienceMin: 3, experienceMax: 10,
            employmentType: 'Part Time', workMode: 'Remote', department: 'Community',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 8, difficulty: 'Easy', numQuestions: 5, passingScore: 60 }
        },
        {
            title: 'Contract Data Engineer', company: 'DataPulse Analytics',
            description: '6-month contract to build and optimize ETL pipelines, data warehouses, and analytics dashboards. Renewal based on performance.',
            responsibilities: 'Design ETL pipelines; model data in Snowflake/Redshift; build dashboards in Looker/Tableau; document data lineage.',
            requirements: ['Python and SQL fluency', 'Experience with Airflow or dbt', 'Data warehouse experience', 'Dimensional modeling'],
            skills: ['Python', 'SQL', 'Airflow', 'dbt', 'Snowflake', 'Tableau'],
            location: 'Chennai, India (Office)', salary: '₹15,00,000 - ₹20,00,000 PA (contract)',
            salaryMin: 1500000, salaryMax: 2000000, experienceMin: 3, experienceMax: 6,
            employmentType: 'Contract', workMode: 'Office', department: 'Data',
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 12, difficulty: 'Intermediate', numQuestions: 8, passingScore: 70 }
        },
        {
            title: 'Freelance UI/UX Designer', company: 'PixelCraft Studio',
            description: 'Design landing pages, dashboards, and marketing sites for a roster of startups. Project-based engagements with flexible deadlines.',
            responsibilities: 'Create wireframes and high-fidelity designs; build design systems; collaborate with developers on implementation; iterate based on user feedback.',
            requirements: ['Strong portfolio with 5+ projects', 'Figma proficiency', 'Understanding of frontend constraints', 'Commercial experience'],
            skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'CSS'],
            location: 'Remote (Global)', salary: '₹25,000 - ₹80,000 / project',
            salaryMin: 25000, salaryMax: 80000, experienceMin: 2, experienceMax: 8,
            employmentType: 'Freelance', workMode: 'Remote', department: 'Design',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: false }
        },
        {
            title: 'Java Developer — Spring Boot', company: 'Finvault Bank',
            description: 'Build secure, compliant backend services for a regulated banking platform. Strong focus on robustness, testing, and observability.',
            responsibilities: 'Develop Spring Boot services; write unit and integration tests; participate in security reviews; monitor production services.',
            requirements: ['4+ years Java development', 'Spring Boot and Spring Cloud', 'SQL and JPA/Hibernate', 'Fintech or regulated environment experience'],
            skills: ['Java', 'Spring Boot', 'SQL', 'Hibernate', 'Docker', 'Kubernetes'],
            location: 'Mumbai, India', salary: '₹16,00,000 - ₹28,00,000 PA',
            salaryMin: 1600000, salaryMax: 2800000, experienceMin: 4, experienceMax: 8,
            employmentType: 'Full Time', workMode: 'Office', department: 'Backend',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 15, difficulty: 'Advanced', numQuestions: 10, passingScore: 75 }
        },
        {
            title: 'Python ML Engineer', company: 'NeuroSight AI',
            description: 'Take ML models from research to production. Build inference pipelines, optimize model performance, and integrate ML into user-facing products.',
            responsibilities: 'Deploy models to production; build inference APIs; monitor model drift; collaborate with data scientists on model improvements.',
            requirements: ['Python and PyTorch/TensorFlow', 'Experience deploying ML models', 'Cloud platforms (AWS/GCP)', 'API design'],
            skills: ['Python', 'PyTorch', 'TensorFlow', 'AWS', 'Docker', 'FastAPI'],
            location: 'Bangalore, India (Hybrid)', salary: '₹18,00,000 - ₹30,00,000 PA',
            salaryMin: 1800000, salaryMax: 3000000, experienceMin: 3, experienceMax: 7,
            employmentType: 'Full Time', workMode: 'Hybrid', department: 'Machine Learning',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 15, difficulty: 'Advanced', numQuestions: 10, passingScore: 75 }
        },
        {
            title: 'Intern — Web Development', company: 'Crestwave Technologies',
            description: 'Paid internship for final-year students or fresh graduates. Work alongside senior engineers on real customer projects and learn the full stack.',
            responsibilities: 'Build and maintain web features; participate in standups and code reviews; learn the deployment pipeline; document your work.',
            requirements: ['CS or related degree (final year or fresh grad)', 'Basic HTML, CSS, JavaScript', 'Eagerness to learn', 'Good problem-solving skills'],
            skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
            location: 'Pune, India', salary: '₹15,000 - ₹25,000 / month',
            salaryMin: 15000, salaryMax: 25000, experienceMin: 0, experienceMax: 1,
            employmentType: 'Internship', workMode: 'Hybrid', department: 'Engineering',
            urgentHiring: true, verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 8, difficulty: 'Easy', numQuestions: 5, passingScore: 60 }
        },
        {
            title: 'DevOps Engineer', company: 'CloudHarbor Infra',
            description: 'Design and maintain cloud infrastructure, CI/CD pipelines, and observability stack for a multi-cloud SaaS platform.',
            responsibilities: 'Manage Kubernetes clusters; build CI/CD pipelines; automate infrastructure with Terraform; set up monitoring and alerting.',
            requirements: ['3+ years DevOps experience', 'Kubernetes and Docker', 'Terraform or Pulumi', 'CI/CD tools', 'Cloud certification preferred'],
            skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux'],
            location: 'Remote (India)', salary: '₹16,00,000 - ₹26,00,000 PA',
            salaryMin: 1600000, salaryMax: 2600000, experienceMin: 3, experienceMax: 6,
            employmentType: 'Full Time', workMode: 'Remote', department: 'DevOps',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 12, difficulty: 'Intermediate', numQuestions: 8, passingScore: 70 }
        },
        {
            title: 'Freelance Technical Writer', company: 'DevDocs Press',
            description: 'Write developer-focused tutorials, API documentation, and technical blog posts. Project-based with flexible deadlines and recurring clients.',
            responsibilities: 'Research and write technical tutorials; edit and format documentation; collaborate with engineering teams on content accuracy; meet deadlines.',
            requirements: ['Strong technical writing samples', 'Ability to explain complex topics clearly', 'Experience with Markdown and docs-as-code', 'Developer background preferred'],
            skills: ['Technical Writing', 'Markdown', 'Git', 'JavaScript', 'Python'],
            location: 'Remote (Global)', salary: '₹2,000 - ₹8,000 / article',
            salaryMin: 2000, salaryMax: 8000, experienceMin: 1, experienceMax: 6,
            employmentType: 'Freelance', workMode: 'Remote', department: 'Content',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: false }
        },
        {
            title: 'Mobile Developer — React Native', company: 'GoMeet Travel',
            description: 'Build and ship a cross-platform travel booking app used by millions. Own features from prototype to App Store and Play Store release.',
            responsibilities: 'Build features in React Native; integrate with native modules; optimize app performance; manage app store releases.',
            requirements: ['3+ years React Native', 'iOS and Android release experience', 'REST API integration', 'State management (Redux/Zustand)'],
            skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'Firebase'],
            location: 'Remote (US/EU)', salary: '₹20,00,000 - ₹35,00,000 PA',
            salaryMin: 2000000, salaryMax: 3500000, experienceMin: 3, experienceMax: 7,
            employmentType: 'Full Time', workMode: 'Remote', department: 'Mobile',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 12, difficulty: 'Intermediate', numQuestions: 8, passingScore: 70 }
        },
        {
            title: 'Part-Time Database Administrator', company: 'DataRoot Consulting',
            description: 'Provide part-time DBA support for a mid-size SaaS company — query optimization, backup strategy, and incident response. 15-20 hours/week.',
            responsibilities: 'Monitor database performance; optimize slow queries; manage backups and recovery; respond to incidents; advise on schema design.',
            requirements: ['PostgreSQL or MySQL expertise', 'Query profiling and indexing experience', 'Backup and recovery procedures', 'Good stakeholder communication'],
            skills: ['PostgreSQL', 'MySQL', 'SQL', 'Performance Tuning', 'Linux'],
            location: 'Remote', salary: '₹800 - ₹1,200 / hour',
            salaryMin: 800, salaryMax: 1200, experienceMin: 4, experienceMax: 10,
            employmentType: 'Part Time', workMode: 'Remote', department: 'Data',
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 10, difficulty: 'Intermediate', numQuestions: 6, passingScore: 70 }
        },
        {
            title: 'Contract QA Automation Engineer', company: 'TestArmour Inc.',
            description: '3-month contract to build and scale the automated test suite for a fintech product. Playwright, Cypress, and API testing experience required.',
            responsibilities: 'Build E2E test suites; write API integration tests; integrate tests into CI; report and track defects; improve test coverage.',
            requirements: ['Playwright or Cypress', 'API testing (Postman/RestAssured)', 'CI/CD integration', 'Strong attention to detail'],
            skills: ['Playwright', 'Cypress', 'JavaScript', 'API Testing', 'CI/CD'],
            location: 'Chennai, India (Office)', salary: '₹12,00,000 - ₹18,00,000 PA (contract)',
            salaryMin: 1200000, salaryMax: 1800000, experienceMin: 2, experienceMax: 5,
            employmentType: 'Contract', workMode: 'Office', department: 'QA',
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 10, difficulty: 'Intermediate', numQuestions: 6, passingScore: 70 }
        },
        // --- Senior Level (5+ yrs) cards, incl. the ₹25 LPA+ salary buckets ---
        {
            title: 'Senior Backend Engineer', company: 'Adlumen Systems',
            description: 'Own the design and reliability of high-throughput backend services powering a global payments platform.',
            responsibilities: 'Lead service design; mentor engineers; drive performance and reliability; own production on-call.',
            requirements: ['6+ years backend engineering', 'Node.js or Go', 'PostgreSQL', 'Distributed systems'],
            skills: ['Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'AWS'],
            location: 'Remote (India)', salary: '₹26,00,000 - ₹40,00,000 PA',
            salaryMin: 2600000, salaryMax: 4000000, experienceMin: 6, experienceMax: 10,
            employmentType: 'Full Time', workMode: 'Remote', department: 'Backend',
            urgentHiring: true, verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 20, difficulty: 'Advanced', numQuestions: 12, passingScore: 80 }
        },
        {
            title: 'Staff Platform Engineer', company: 'CloudHarbor Infra',
            description: 'Lead the platform roadmap: multi-cluster Kubernetes strategy, developer experience, and cost efficiency at scale.',
            responsibilities: 'Set platform architecture; build the internal developer platform; mentor SREs; drive reliability targets.',
            requirements: ['7+ years platform/DevOps', 'Kubernetes at scale', 'Terraform', 'Observability tooling'],
            skills: ['Kubernetes', 'Terraform', 'AWS', 'Go', 'Prometheus', 'CI/CD'],
            location: 'Bangalore, India (Hybrid)', salary: '₹30,00,000 - ₹45,00,000 PA',
            salaryMin: 3000000, salaryMax: 4500000, experienceMin: 7, experienceMax: 12,
            employmentType: 'Full Time', workMode: 'Hybrid', department: 'Platform',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 20, difficulty: 'Advanced', numQuestions: 12, passingScore: 80 }
        },
        {
            title: 'Engineering Manager', company: 'Meridian Solutions',
            description: 'Lead two full-stack squads delivering customer-facing products. Balance people leadership with technical direction.',
            responsibilities: 'Grow and coach engineers; own delivery outcomes; partner with product; raise engineering standards.',
            requirements: ['8+ years engineering experience', '2+ years managing engineers', 'Strong system design skills', 'Hiring experience'],
            skills: ['Leadership', 'System Design', 'React', 'Node.js', 'Agile'],
            location: 'Pune, India (Office)', salary: '₹32,00,000 - ₹48,00,000 PA',
            salaryMin: 3200000, salaryMax: 4800000, experienceMin: 8, experienceMax: 14,
            employmentType: 'Full Time', workMode: 'Office', department: 'Engineering',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 18, difficulty: 'Advanced', numQuestions: 10, passingScore: 75 }
        },
        {
            title: 'Principal Data Scientist', company: 'NeuroSight AI',
            description: 'Define the modelling strategy for computer-vision products and take research from prototype to production.',
            responsibilities: 'Lead modelling strategy; design experiments; mentor data scientists; partner with product on roadmap.',
            requirements: ['7+ years applied ML', 'Python and PyTorch', 'Deep learning in production', 'Mentoring track record'],
            skills: ['Python', 'PyTorch', 'Machine Learning', 'MLOps', 'AWS'],
            location: 'Hyderabad, India (Hybrid)', salary: '₹28,00,000 - ₹42,00,000 PA',
            salaryMin: 2800000, salaryMax: 4200000, experienceMin: 7, experienceMax: 12,
            employmentType: 'Full Time', workMode: 'Hybrid', department: 'Machine Learning',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 20, difficulty: 'Advanced', numQuestions: 12, passingScore: 80 }
        },
        {
            title: 'Senior Security Engineer', company: 'Finvault Bank',
            description: 'Own application security for regulated banking products: threat modelling, secure SDLC, and incident response.',
            responsibilities: 'Run threat modelling; drive secure coding adoption; lead incident response; own pentest remediation.',
            requirements: ['5+ years security engineering', 'OWASP and secure SDLC', 'Cloud security (AWS)', 'Scripting in Python or Go'],
            skills: ['Security', 'OWASP', 'AWS', 'Python', 'Cryptography'],
            location: 'Mumbai, India (Office)', salary: '₹24,00,000 - ₹34,00,000 PA',
            salaryMin: 2400000, salaryMax: 3400000, experienceMin: 5, experienceMax: 10,
            employmentType: 'Full Time', workMode: 'Office', department: 'Security',
            urgentHiring: true, verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 15, difficulty: 'Advanced', numQuestions: 10, passingScore: 75 }
        },
        // --- Fill remaining Work Mode x Employment Type combinations ---
        {
            title: 'Senior Site Reliability Engineer', company: 'StackBridge Inc.',
            description: '6-month contract to improve reliability of a multi-region SaaS platform. Define SLOs and reduce toil through automation.',
            responsibilities: 'Define and monitor SLOs; automate runbooks; lead incident reviews; improve deployment safety.',
            requirements: ['5+ years SRE/DevOps', 'Kubernetes and Terraform', 'Linux internals', 'Incident management experience'],
            skills: ['Kubernetes', 'Terraform', 'Linux', 'Go', 'Monitoring', 'CI/CD'],
            location: 'Remote (India)', salary: '₹22,00,000 - ₹30,00,000 PA (contract)',
            salaryMin: 2200000, salaryMax: 3000000, experienceMin: 5, experienceMax: 9,
            employmentType: 'Contract', workMode: 'Remote', department: 'Platform',
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 15, difficulty: 'Advanced', numQuestions: 10, passingScore: 75 }
        },
        {
            title: 'Contract Mobile Engineer', company: 'GoMeet Travel',
            description: '9-month contract to ship new booking flows in the React Native app on iOS and Android.',
            responsibilities: 'Build React Native features; integrate native modules; improve app performance; manage store releases.',
            requirements: ['4+ years React Native', 'iOS and Android releases', 'TypeScript', 'REST and GraphQL APIs'],
            skills: ['React Native', 'TypeScript', 'GraphQL', 'Firebase', 'CI/CD'],
            location: 'Bangalore, India (Hybrid)', salary: '₹18,00,000 - ₹26,00,000 PA (contract)',
            salaryMin: 1800000, salaryMax: 2600000, experienceMin: 4, experienceMax: 8,
            employmentType: 'Contract', workMode: 'Hybrid', department: 'Mobile',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 12, difficulty: 'Intermediate', numQuestions: 8, passingScore: 70 }
        },
        {
            title: 'Part-Time Technical Trainer', company: 'SkillCortex',
            description: 'Deliver live weekend bootcamps on React, Node.js and system design. 10-12 hours per week.',
            responsibilities: 'Deliver live sessions; prepare exercises; review capstone projects; mentor learners.',
            requirements: ['Strong React and Node.js', 'Public speaking comfort', 'Curriculum design experience', 'Teaching experience preferred'],
            skills: ['React', 'Node.js', 'TypeScript', 'Teaching', 'System Design'],
            location: 'Chennai, India (Office)', salary: '₹60,000 - ₹90,000 / month',
            salaryMin: 60000, salaryMax: 90000, experienceMin: 3, experienceMax: 10,
            employmentType: 'Part Time', workMode: 'Office', department: 'Community',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 10, difficulty: 'Intermediate', numQuestions: 6, passingScore: 65 }
        },
        {
            title: 'Part-Time Code Reviewer', company: 'StackBridge Inc.',
            description: 'Review pull requests for a distributed engineering team and raise the bar on code quality. 12 flexible hours per week.',
            responsibilities: 'Review PRs and tests; leave actionable feedback; flag architectural risks; pair with junior engineers.',
            requirements: ['Strong TypeScript and Node.js', 'Excellent written communication', 'Testing mindset', 'Prior review experience'],
            skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'Testing'],
            location: 'Bangalore, India (Hybrid)', salary: '₹50,000 - ₹80,000 / month',
            salaryMin: 50000, salaryMax: 80000, experienceMin: 3, experienceMax: 12,
            employmentType: 'Part Time', workMode: 'Hybrid', department: 'Engineering',
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 10, difficulty: 'Intermediate', numQuestions: 6, passingScore: 65 }
        },
        {
            title: 'Intern — QA Automation', company: 'TestArmour Inc.',
            description: 'Paid 6-month internship writing Playwright tests for a fintech product. Mentor-supported, on-site in Chennai.',
            responsibilities: 'Write and maintain E2E tests; log defects; help improve coverage; participate in sprint rituals.',
            requirements: ['Final-year student or fresh graduate', 'Basic JavaScript', 'Attention to detail', 'Willingness to learn testing tools'],
            skills: ['JavaScript', 'Playwright', 'API Testing', 'Git'],
            location: 'Chennai, India (Office)', salary: '₹18,000 - ₹25,000 / month',
            salaryMin: 18000, salaryMax: 25000, experienceMin: 0, experienceMax: 1,
            employmentType: 'Internship', workMode: 'Office', department: 'QA',
            urgentHiring: true, verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 8, difficulty: 'Easy', numQuestions: 5, passingScore: 60 }
        },
        {
            title: 'Intern — Frontend Development', company: 'Rivulet Tech',
            description: 'Fully remote paid internship building component-library examples and documentation. 3-month programme.',
            responsibilities: 'Build demo pages; write component docs; fix accessibility issues; ship small features.',
            requirements: ['Final-year student or fresh graduate', 'Basic React and CSS', 'Self-directed learner', 'Good communication'],
            skills: ['React', 'CSS', 'JavaScript', 'Accessibility', 'Git'],
            location: 'Remote (Global)', salary: '₹20,000 - ₹30,000 / month',
            salaryMin: 20000, salaryMax: 30000, experienceMin: 0, experienceMax: 1,
            employmentType: 'Internship', workMode: 'Remote', department: 'Engineering',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: true, durationMin: 8, difficulty: 'Easy', numQuestions: 5, passingScore: 60 }
        },
        {
            title: 'Freelance ERP Consultant', company: 'Meridian Solutions',
            description: 'Project-based engagement implementing ERP modules for enterprise clients. 2-3 days per week on-site.',
            responsibilities: 'Gather requirements; configure ERP modules; train client teams; document business processes.',
            requirements: ['4+ years ERP implementation', 'Business process mapping', 'SQL reporting', 'Client-facing communication'],
            skills: ['ERP', 'SQL', 'Business Analysis', 'Stakeholder Management'],
            location: 'Pune, India (Office)', salary: '₹60,000 - ₹1,20,000 / project',
            salaryMin: 60000, salaryMax: 120000, experienceMin: 4, experienceMax: 12,
            employmentType: 'Freelance', workMode: 'Office', department: 'Consulting',
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: false }
        },
        {
            title: 'Freelance Data Visualization Expert', company: 'DataPulse Analytics',
            description: 'Build executive dashboards from raw warehouse data for a portfolio of analytics clients. Hybrid engagement.',
            responsibilities: 'Design dashboards; model datasets; automate refresh pipelines; present insights to stakeholders.',
            requirements: ['Strong Tableau or Power BI', 'SQL proficiency', 'Data modelling skills', 'Portfolio of dashboards'],
            skills: ['Tableau', 'SQL', 'Data Visualization', 'Analytics'],
            location: 'Hyderabad, India (Hybrid)', salary: '₹70,000 - ₹1,50,000 / project',
            salaryMin: 70000, salaryMax: 150000, experienceMin: 3, experienceMax: 10,
            employmentType: 'Freelance', workMode: 'Hybrid', department: 'Data',
            verifiedEmployer: true,
            hrRef: '6754a0b5c9d8e9b8f7a6b5c4',
            interviewConfig: { enabled: false }
        },
    ];

    // Upsert on title+company: never duplicate an existing posting, but always
    // add any sample card that is missing from the collection.
    await Job.bulkWrite(
        sampleJobs.map((job) => ({
            updateOne: {
                filter: { title: job.title, company: job.company },
                update: { $setOnInsert: job },
                upsert: true
            }
        })),
        { ordered: false }
    );
}

// Get all jobs with optional filters and pagination
router.get('/', async (req, res) => {
    try {
        await ensureSampleJobs();
        
        const { q, workMode, employmentType, page, limit } = req.query;
        const filter = {};
        
        if (q) {
            const re = new RegExp(q, 'i');
            filter.$or = [{ title: re }, { company: re }, { description: re }];
        }
        if (workMode) filter.workMode = workMode;
        if (employmentType) filter.employmentType = employmentType;
        
        const pg = Math.max(1, parseInt(page) || 1);
        const lim = Math.max(1, parseInt(limit) || 20);
        const skip = (pg - 1) * lim;
        
        const [jobs, total] = await Promise.all([
            Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
            Job.countDocuments(filter),
        ]);
        
        res.json({ jobs, total, page: pg, pages: Math.ceil(total / lim) });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// HR: my jobs with application counts
router.get('/mine', auth, isHR, async (req, res) => {
    const jobs = await Job.find({ $or: [{ hrRef: req.user.userId }, { postedBy: req.user.userId }] }).sort({ createdAt: -1 });
    const withCounts = await Promise.all(jobs.map(async (j) => {
        const count = await Application.countDocuments({ jobId: j._id });
        return { ...j.toObject(), applicants: count };
    }));
    res.json(withCounts);
});

// Get candidate reviews for HR (must be before /:id)
router.get('/reviews', auth, isHR, async (req, res) => {
    try {
        const { jobId } = req.query;
        const filter = { hrId: req.user.userId };
        if (jobId) filter.jobId = jobId;
        const reviews = await CandidateReview.find(filter).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews', error);
        res.status(500).json({ message: 'Server Error fetching candidate reviews' });
    }
});

// PRD §30 / §32 — single candidate review for the HR candidate detail view.
// Declared before the generic `/:id` job route so "reviews" is never read as a job id.
router.get('/reviews/:id', auth, isHR, async (req, res) => {
    try {
        const review = await CandidateReview.findById(req.params.id)
            .populate('candidateId', 'name email mobile skills points coins')
            .populate('applicationId');
        if (!review) return res.status(404).json({ message: 'Review not found' });
        // Ownership guard: an HR may only open assessments for jobs it owns.
        if (String(review.hrId) !== String(req.user.userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Not your candidate.' });
        }
        const resume = await Resume.findOne({ candidateId: review.candidateId?._id || review.candidateId })
            .sort({ createdAt: -1 })
            .select('fileName rawText skills experienceLevel education projects matchedSkills missingSkills');
        res.json({ review, resume });
    } catch (error) {
        console.error('Error fetching review', error);
        res.status(500).json({ message: 'Server Error fetching review' });
    }
});

// PRD §30 — shortlist / reject / hold a candidate, and PRD §3.2 "Contact candidates".
// Keeps the CandidateReview audit trail and the linked Application status in sync,
// then notifies the candidate through the shared notification service.
router.patch('/reviews/:id', auth, isHR, async (req, res) => {
    try {
        const { decision, note } = req.body;
        const allowed = ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED'];
        if (!allowed.includes(decision)) {
            return res.status(400).json({ message: `Invalid decision. Allowed: ${allowed.join(', ')}` });
        }
        const review = await CandidateReview.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.hrId) !== String(req.user.userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Not your candidate.' });
        }
        review.hrDecision = decision;
        review.hrDecisionNote = note || review.hrDecisionNote || '';
        review.hrDecidedBy = req.user.userId;
        review.hrDecidedAt = new Date();
        await review.save();

        if (review.applicationId) {
            await Application.findByIdAndUpdate(review.applicationId, { status: decision });
        }
        const candidate = await User.findById(review.candidateId).select('name email');
        if (candidate) {
            await notify({
                toUserId: candidate._id,
                toEmail: candidate.email,
                type: decision,
                subject: `Update on ${review.jobTitle}`,
                body: `${review.jobTitle}: your application is now ${prettyStatus(decision)}.${note ? `\n\nRecruiter note: ${note}` : ''}`,
                data: { reviewId: String(review._id), jobId: String(review.jobId) },
            });
        }
        res.json({ message: `Candidate marked ${decision}`, review });
    } catch (error) {
        console.error('Error updating review decision', error);
        res.status(500).json({ message: 'Server Error updating review' });
    }
});

// PRD §3.2 — "Download candidate reports". Emits a self-contained JSON report
// (score breakdown, transcript, coding result, integrity events) as an attachment.
router.get('/reviews/:id/report', auth, isHR, async (req, res) => {
    try {
        const review = await CandidateReview.findById(req.params.id)
            .populate('candidateId', 'name email mobile')
            .populate('jobId', 'title company location');
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.hrId) !== String(req.user.userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Not your candidate.' });
        }
        const resume = await Resume.findOne({ candidateId: review.candidateId?._id || review.candidateId }).sort({ createdAt: -1 });
        const report = {
            generatedAt: new Date().toISOString(),
            platform: 'SkillCortex',
            job: { title: review.jobTitle, company: review.jobId?.company, location: review.jobId?.location },
            candidate: { name: review.candidateName, email: review.candidateId?.email, mobile: review.candidateId?.mobile },
            resume: resume ? { fileName: resume.fileName, skills: resume.skills, experienceLevel: resume.experienceLevel, education: resume.education, projects: resume.projects, matchedSkills: resume.matchedSkills, missingSkills: resume.missingSkills } : null,
            scoreBreakdown: {
                overall: review.aiScore100,
                technical: review.technicalScore,
                communication: review.communicationScore,
                problemSolving: review.problemSolvingScore,
                coding: review.codingResult?.score ?? null,
            },
            codingResult: review.codingResult || null,
            integritySummary: review.integritySummary || null,
            recommendation: review.recommendation,
            finalRecommendation: review.finalRecommendation,
            finalConfidence: review.finalConfidence,
            hrAction: review.hrAction,
            aiFeedback: review.aiFeedback,
            strengths: review.strengths,
            weaknesses: review.weaknesses,
            questionEvidence: review.questionEvidence?.length ? review.questionEvidence : review.questionAnalysis,
            transcript: review.transcript,
            hrDecision: { status: review.hrDecision, note: review.hrDecisionNote, decidedAt: review.hrDecidedAt },
        };
        const safeName = String(review.candidateName).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="skillcortex-report-${safeName}-${review._id}.json"`);
        res.send(JSON.stringify(report, null, 2));
    } catch (error) {
        console.error('Error building report', error);
        res.status(500).json({ message: 'Server Error building report' });
    }
});

// Post a new job (HR ONLY) — PRD §31 full interview coding config
router.post('/', auth, isHR, async (req, res) => {
    try {
        const b = req.body;
        const newJob = new Job({
            title: b.title, company: b.company, description: b.description,
            responsibilities: b.responsibilities || '',
            requirements: toArray(b.requirements), skills: toArray(b.skills?.length ? b.skills : b.requirements),
            location: b.location || '', salary: b.salary || '',
            salaryMin: b.salaryMin, salaryMax: b.salaryMax,
            experienceMin: b.experienceMin ?? 0, experienceMax: b.experienceMax ?? 5,
            employmentType: b.employmentType || '', workMode: b.workMode || '', department: b.department || '',
            urgentHiring: !!b.urgentHiring, verifiedEmployer: true,
            hrRef: req.user.userId, postedBy: req.user.userId,
            interviewConfig: {
                enabled: b.interviewConfig?.enabled ?? true,
                durationMin: b.interviewConfig?.durationMin ?? b.durationMin ?? 10,
                difficulty: b.interviewConfig?.difficulty ?? b.difficulty ?? 'Intermediate',
                numQuestions: b.interviewConfig?.numQuestions ?? 8,
                passingScore: b.interviewConfig?.passingScore ?? 70,
                integrityMonitoring: b.interviewConfig?.integrityMonitoring ?? true
            },
            codingConfig: { required: !!b.codingConfig?.required, title: b.codingConfig?.title || '' }
        });
        const savedJob = await newJob.save();
        res.json(savedJob);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Get single job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch {
        res.status(404).json({ message: 'Job not found' });
    }
});

// PATCH + DELETE (PRD)
router.patch('/:id', auth, isHR, async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, $or: [{ hrRef: req.user.userId }, { postedBy: req.user.userId }] });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const updatable = ['title', 'company', 'description', 'responsibilities', 'location', 'salary', 'experienceMin', 'experienceMax', 'employmentType', 'workMode', 'department', 'status', 'urgentHiring', 'interviewConfig', 'codingConfig'];
    for (const k of updatable) if (req.body[k] !== undefined) job[k] = req.body[k];
    if (req.body.requirements !== undefined) job.requirements = toArray(req.body.requirements);
    if (req.body.skills !== undefined) job.skills = toArray(req.body.skills);
    await job.save();
    res.json(job);
});

router.delete('/:id', auth, isHR, async (req, res) => {
    const job = await Job.findOneAndDelete({ _id: req.params.id, $or: [{ hrRef: req.user.userId }, { postedBy: req.user.userId }] });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
});

export default router;
