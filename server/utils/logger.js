const fs = require('fs');
const path = require('path');

const logError = (msg) => {
    try {
        const logPath = path.join(__dirname, '../match.log'); // Using match.log or debug.log? Original was debug.log but I deleted it. Use debug.log
        fs.appendFileSync(path.join(__dirname, '../debug.log'), `[ERROR] ${new Date().toISOString()} ${msg}\n`);
    } catch (e) {
        console.error('Logging failed:', e);
    }
};

module.exports = { logError };
