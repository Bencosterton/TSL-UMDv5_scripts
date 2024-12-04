#!/usr/bin/env node

const TSL5 = require('tsl-umd-v5');

// Parse command line arguments
const args = process.argv.slice(2);
let host = '10.10.116.58';
let window = 14;
let label = '';
const PORT = 4003;

// Process arguments
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-h':
            host = args[++i];
            break;
        case '-w':
            window = parseInt(args[++i]);
            if (isNaN(window) || window < 0 || window > 1024) {
                console.error('Window must be a number between 0 and 1024');
                process.exit(1);
            }
            break;
        case '-l':
            label = args[++i];
            break;
        default:
            console.error('Unknown option:', args[i]);
            console.error('Usage: node script.js [-h host] [-w window] [-l label]');
            process.exit(1);
    }
}

if (!label) {
    console.error('Label is required. Use -l to specify a label');
    console.error('Usage: node script.js [-h host] [-w window] [-l label]');
    process.exit(1);
}

// Initialize TSL UMD instance
const umd = new TSL5();

// Create a tally object
const tally = {
    screen: 0, // Adjust this based on your setup
    index: window,
    display: {
        rh_tally: 0,
        text_tally: 0,
        lh_tally: 0,
        brightness: 3,
        text: label
    }
};

console.log(`Setting UMD label for window ${window} on ${host}:${PORT} to "${label}"`);

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
