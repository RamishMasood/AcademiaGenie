const pdf = require('pdf-parse');
console.log("Type of pdf-parse:", typeof pdf);
console.log("pdf-parse:", pdf);

const fs = require('fs');
// Create a dummy buffer
const buffer = Buffer.from('test');

pdf(buffer).then(data => {
    console.log("Parsing successful!");
}).catch(err => {
    console.error("Parsing failed:", err);
});
