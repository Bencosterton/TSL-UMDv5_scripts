//Usgae:
// ndoe SAM_Kahuna_tally.js -h IP-ADDRESS -p PORT

#!/usr/bin/env node
const net = require('net');

// Config
const args = process.argv.slice(2);
let host = null;
let port = null;

// List of sources to ignore
const IGNORED_SOURCES = new Set([
    'PGM',
    'PVW',
    'ME2 PGM',
    'ME3 PGM',
    'STOR 1',
    'STOR 5'
]);

// Process arguments
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-h':
            host = args[++i];
            break;
        case '-p':
            port = parseInt(args[++i]);
            break;
        case '--debug':
            process.env.DEBUG = 'true';
            break;
        case '--help':
            console.log('Usage: node script.js [-h host] [-p port] [--debug]');
            process.exit(0);
    }
}

// cleanup the output from Kahnuna
function cleanSourceName(text) { 
    return text
        .replace(/^\x00+/, '')     
        .replace(/\x00+$/, '')     
        .trim();                  
}

function interpretTallyStatus(controlByte, sourceName) {
    // Cleanup the source names
    const cleanName = cleanSourceName(sourceName);

    if (process.env.DEBUG) {
        console.log(`Raw source: "${sourceName}"`);
        console.log(`Cleaned source: "${cleanName}"`);
        console.log(`In ignore list: ${IGNORED_SOURCES.has(cleanName)}`);
    }

    // Check if source is in ignore list
    if (IGNORED_SOURCES.has(cleanName)) {
        return null;
    }

    switch (controlByte) {
        case 0x90:
        case 0xA0:
            return `PGM - ${cleanName}`;
        default:
            return null;
    }
}

function parseKahunaTally(data) {
    const messages = [];
    const chunkSize = 24;

    for (let offset = 0; offset < data.length; offset += chunkSize) {
        if (offset + chunkSize <= data.length) {
            const chunk = data.slice(offset, offset + chunkSize);
            const controlByte = chunk[8];
            const text = chunk.slice(10, 24).toString('ascii');

            const status = interpretTallyStatus(controlByte, text);
            if (status) {
                messages.push(status);
            }
        }
    }
    return messages;
}

const client = new net.Socket();

client.connect(port, host);

client.on('data', (data) => {
    const messages = parseKahunaTally(data);
    messages.forEach(msg => console.log(msg));
});

client.on('error', (err) => {
    console.error('Connection error:', err);
});

// Close conneciton
process.on('SIGINT', () => {
    client.destroy();
    process.exit(0);
});
