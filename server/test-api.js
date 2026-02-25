async function test() {
    try {
        const res = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Bob', email: 'bob@test.com', password: 'password', role: 'candidate' })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch (err) {
        console.error(err);
    }
}
test();
