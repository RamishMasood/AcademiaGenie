const fs = require('fs');
async function run() {
  const formData = new FormData();
  // We need to send a multipart request using fetch. We can use a trick with blob
  const fileBlob = new Blob(['Not a PDF really, just random data'], { type: 'application/pdf' });
  formData.append('files', fileBlob, 'test.pdf');
  
  try {
    console.log("Sending invalid PDF...");
    const response = await fetch('http://localhost:3000/api/analyze-cv', {
        method: 'POST',
        body: formData
    });
    const body = await response.text();
    console.log('STATUS:', response.status);
    console.log('BODY:', body);
  } catch (err) {
    console.error("Fetch threw an error:", err);
  }
}
run();
