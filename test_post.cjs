const fs = require('fs');
async function run() {
  const data = new FormData();
  const fileParams = {
    method: 'POST',
    body: new URLSearchParams({ test: 'true' }) // Just to see if it even responds
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze-cv', fileParams);
    const body = await response.text();
    console.log('STATUS:', response.status);
    console.log('BODY:', body);
  } catch (err) {
    console.error(err);
  }
}
run();
