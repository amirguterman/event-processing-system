const http = require('http');
const fs = require('fs').promises; // Use promises API

// Function to send event to the server
async function sendEvent(event) {
    // HTTP request options
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/liveEvent',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'secret'
        }
    };

    // Create HTTP request
    const req = http.request(options, res => {
        console.debug(`statusCode: ${res.statusCode}`);
        res.on('data', d => {
            process.stdout.write(d);
        });
    });

    // Log any request errors
    req.on('error', error => {
        console.error(error);
    });

    // Write event data to request body and end request
    req.write(JSON.stringify(event));
    req.end();
}

// Function to process events
async function processEvents() {
    try {
        const data = await fs.readFile('events.jsonl', 'utf8');
        if (data.trim().length === 0) {
            console.log('events.jsonl is empty, no events to process.');
            return;
        }
        const events = data.trim().split('\n').map(line => JSON.parse(line));
        events.forEach(event => {
            sendEvent(event);
        });
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

// Start the processing loop
processEvents().catch(console.error);
