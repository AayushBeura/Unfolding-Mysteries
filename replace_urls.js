const fs = require('fs');
let res = fs.readFileSync('script.js', 'utf8');

// The replacement code: we need to use backticks where fetch uses string literals
res = res.replace(/'http:\/\/localhost:3000(.*?)'/g, '`\\${BACKEND_URL}$1`');
res = res.replace(/"http:\/\/localhost:3000(.*?)"/g, '`\\${BACKEND_URL}$1`');
res = res.replace(/'ws:\/\/localhost:3000(.*?)'/g, '`\\${WS_URL}$1`');
res = res.replace(/"ws:\/\/localhost:3000(.*?)"/g, '`\\${WS_URL}$1`');

const prependedCode = `const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unfolding-mysteries-backend-production.up.railway.app';
const WS_URL = IS_LOCAL ? 'ws://localhost:3000' : 'wss://unfolding-mysteries-backend-production.up.railway.app';\n\n`;

if (!res.includes('BACKEND_URL')) {
    fs.writeFileSync('script.js', prependedCode + res);
} else {
    fs.writeFileSync('script.js', res);
}
console.log("Replaced successfully!");
