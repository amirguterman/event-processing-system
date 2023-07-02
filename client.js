const fs = require('fs').promises;
const http = require('http');
const util = require('util');

const amount = 3;
const period = 7;
const listUserEventsPeriod = 30;


// Function to list user events
async function listUserEvents(userId) {
    return new Promise((resolve, reject) => {
      // HTTP request options
      const options = {
        hostname: 'localhost',
        port: 8000,
        path: `/userEvents/${userId}`,
        method: 'GET'
      };
  
      // Create HTTP request
      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          console.log(`User ${userId} events:`, JSON.parse(data));
          resolve();
        });
      });
  
      // Log any request errors
      req.on('error', error => {
        console.error(`Error fetching user ${userId} events:`, error);
        reject(error);
      });
  
      // End request
      req.end();
    });
  }
  

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


// Function to generate test events
async function generateTestEvents(amount) {
    const events = [];
    for (let i = 0; i < amount; i++) {
        const userId = `user${Math.floor(Math.random() * 5) + 1}`; // Random user ID between user1 and user5
        const name = Math.random() > 0.5 ? 'add_revenue' : 'subtract_revenue'; // Random event name
        const value = Math.floor(Math.random() * 100); // Random value between 0 and 99
        events.push({ userId, name, value });
    }
    await fs.appendFile('events.jsonl', events.map(event => JSON.stringify(event)).join('\n') + '\n');
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
        if (err.code === 'ENOENT') {
            console.debug('events.jsonl does not exist, creating file...');
            await fs.writeFile('events.jsonl', '');
            console.debug('events.jsonl was created successfully');
        } else {
            console.error('Error reading file:', err);
        }
    }
}


// Function to periodically list user events
async function repeatListUserEvents() {
    while (true) {
        for (let i = 1; i <= 5; i++) {
            await listUserEvents(`user${i}`);
        }
        await new Promise(resolve => setTimeout(resolve, listUserEventsPeriod * 1000));
    }
}

async function processAndGenerate() {
    await processEvents();
    await generateTestEvents(amount);
}

// Repeat processAndGenerate periodically, and call the callback when done
async function repeatProcessAndGenerate(callback) {
    while (true) {
        await processAndGenerate();
        await new Promise(resolve => setTimeout(resolve, period * 1000));
    }

    callback(null);
}

// Create a promisified version of repeatProcessAndGenerate
const main = util.promisify(() => Promise.all([
    repeatProcessAndGenerate(),
    repeatListUserEvents()
]));

// Start the processing and generating loop
main().catch(console.error);

