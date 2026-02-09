
const https = require('https');

const url = 'https://minio-v0cs0k0c4o8kg00wowgkggso.72.61.238.188.sslip.io/uploads/products/1769888137838-5i9yy-1000830176.png';

console.log(`Testing connectivity to: ${url}`);
const start = Date.now();

const req = https.get(url, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    let size = 0;
    res.on('data', (d) => {
        size += d.length;
    });

    res.on('end', () => {
        const duration = Date.now() - start;
        console.log(`Response ended. Total size: ${size} bytes. Duration: ${duration}ms`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});

req.end();
