import fs from 'fs';
fetch('http://localhost:3000/api/analyze-cv', {
    method: 'POST',
    body: (() => {
        const formData = new FormData();
        const blob = new Blob(['test pdf content'], { type: 'application/pdf' });
        formData.append('files', blob, 'test.pdf');
        return formData;
    })()
}).then(async r => {
    console.log("STATUS:", r.status);
    console.log("BODY:", await r.text());
}).catch(e => console.error(e));
