const fs = require('fs');
const http = require('http');

// Function to send event to the server
function sendEvent(event) {
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
    console.log(`statusCode: ${res.statusCode}`);
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

// Read events from events.jsonl file
fs.readFile('events.jsonl', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Parse events from file
  const events = data.trim().split('\n').map(line => JSON.parse(line));

  // Send each event to the server
  events.forEach(event => {
    sendEvent(event);
  });
});
