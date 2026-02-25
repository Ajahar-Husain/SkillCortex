async function testInterviewRoute() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'api_test@user.com', password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Logged in successfully. Sending interview req...");

        const interviewRes = await fetch('http://localhost:3001/api/interview/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                resume: "Test resume",
                jobRole: "Test role",
                jobRequirements: ["Req 1", "Req 2"],
                previousMessages: []
            })
        });

        const data = await interviewRes.json();
        console.log("Status:", interviewRes.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Failed:", err);
    }
}

testInterviewRoute();
