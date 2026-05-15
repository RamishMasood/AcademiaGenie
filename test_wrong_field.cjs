const fs = require('fs');
async function run() {
  const formData = new FormData();
  const fileBlob = new Blob(['Not a PDF'], { type: 'application/pdf' });
  formData.append('wrong_field', fileBlob, 'test.pdf'); // Intentionally wrong field!
  
  try {
    console.log("Sending wrong field...");
    const response = await fetch('http://localhost:3000/api/analyze-cv', {
        method: 'POST',
        body: formData
    });
    const body = await response.text();
    console.log('STATUS:', response.status);
    console.log('BODY:', body.substring(0, 50));
  } catch (err) {
    console.error("Fetch threw an error:", err);
  }
}
run();
