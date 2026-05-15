import http from 'http';
import fs from 'fs';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/analyze-cv',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', data));
});
req.on('error', (e) => console.error(e));
req.end();
