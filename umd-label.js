#!/usr/bin/env node

// Useage;
// node umd-label.js -h IP-ADDRESS -w PIP-NUMBER -l "LABEL"
//
// NOTE: IP3 Multview is index 0, so PIP-1 = Window 0.
// This indexing is taken case of in the scritp, so use PIP number, not window number.

const TSL5 = require('tsl-umd-v5');

// Parse command line arguments
const args = process.argv.slice(2);
let host = null;
let window = null;
let label = null;
const PORT = 4003;

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-h':
            host = args[++i];
            break;
        case '-w':
            window = parseInt(args[++i]);
            if (isNaN(window) || window < 1 || window > 1024) {
                console.error('Window must be a number between 1 and 1024 (one-based)');
                process.exit(1);
            }
            break;
        case '-l':
            label = args[++i];
            break;
        default:
            console.error('Unknown option:', args[i]);
            console.error('Usage: node script.js -h <host> -w <window> -l <label>');
            process.exit(1);
    }
}

if (!host || !window || !label) {
    console.error('Error: Missing required arguments.');
    console.error('Usage: node script.js -h <host> -w <window> -l <label>');
    process.exit(1);
}

// Convert 0 index of IP3 to 1 base index for PIP
const adjustedIndex = window - 1;

// Initialize TSL UMD 
const umd = new TSL5();

// Create tally
const tally = {
    screen: 0, 
    index: adjustedIndex,
    display: {
        rh_tally: 0,
        text_tally: 0,
        lh_tally: 0,
        brightness: 3,
        text: label
    }
};

console.log(`Setting UMD label for PIP ${window} (index ${adjustedIndex}) on ${host}:${PORT} to "${label}"`);

// Send TCP tally
try {
    umd.sendTallyTCP(host, PORT, tally);
    console.log('TCP tally sent successfully.');
} catch (err) {
    console.error('Error sending TCP tally:', err);
}

// Send UDP tally
try {
    umd.sendTallyUDP(host, PORT, tally);
    console.log('UDP tally sent successfully.');
} catch (err) {
    console.error('Error sending UDP tally:', err);
}
