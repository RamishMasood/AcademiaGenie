const fs = require('fs');
async function run() {
  try {
    const response = await fetch('http://localhost:3000/api/suggest-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: 'Software Engineer with 5 years experience.' })
    });
    
    const body = await response.text();
    console.log('STATUS:', response.status);
    console.log('BODY:', body);
  } catch (err) {
    console.error("Fetch threw an error:", err);
  }
}
run();
