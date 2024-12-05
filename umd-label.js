#!/usr/bin/env node

// Useage;
// node umd-label.js -h IP-ADDRESS -p PORT -w PIP-NUMBER -l "LABEL"
//
// NOTE: IP3 Multview is index 0, so PIP-1 = Window 0.
// This indexing is taken case of in the scritp, so use PIP number, not window number.

const TSL5 = require('tsl-umd-v5');

// Parse command line arguments
const args = process.argv.slice(2);
let host = null;
let displayAddress = null;
let label = null;
let port = null;

// Process arguments
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-h':
            host = args[++i];
            break;
        case '-p':
            port = parseInt(args[++i]);
            if (isNaN(port) || port < 1 || port > 65535) {
                console.error('Port must be between 1 and 65535');
                process.exit(1);
            }
            break;
        case '-w':
            displayAddress = parseInt(args[++i]);
            if (isNaN(displayAddress) || displayAddress < 1 || displayAddress > 1024) {
                console.error('Display address must be between 1 and 1024');
                process.exit(1);
            }
            break;
        case '-l':
            label = args[++i];
            break;
        default:
            console.error('Unknown option:', args[i]);
            console.error('Usage: node script.js [-h host] [-w display_address] [-l label] [-p port]');
            process.exit(1);
    }
}

if (!label) {
    console.error('Label is required. Use -l to specify a label');
    console.error('Usage: node script.js [-h host] [-w display_address] [-l label] [-p port]');
    process.exit(1);
}

// Initialize TSL UMD instance
const umd = new TSL5();

// Create a tally object
const tally = {
    screen: 0,
    index: displayAddress - 1,  // Convert from 1-based to 0-based indexing
    display: {
        rh_tally: 0,
        text_tally: 0,
        lh_tally: 0,
        brightness: 3,
        text: label
    }
};

console.log(`Setting UMD label for display ${displayAddress} (index ${displayAddress - 1}) on ${host}:${port} to "${label}"`);

// Send both TCP and UDP
Promise.all([
    new Promise((resolve) => {
        try {
            umd.sendTallyTCP(host, port, tally);
            console.log('TCP message sent successfully');
            resolve();
        } catch (err) {
            console.error('TCP Error:', err);
            resolve();
        }
    }),
    new Promise((resolve) => {
        try {
            umd.sendTallyUDP(host, port, tally);
            console.log('UDP message sent successfully');
            resolve();
        } catch (err) {
            console.error('UDP Error:', err);
            resolve();
        }
    })
]).then(() => {
    // Give time for messages to be sent before exiting
    setTimeout(() => {
        console.log('Done.');
        process.exit(0);
    }, 200);
});
