const fs = require('fs');
const http = require('http');

function sendEvent(event) {
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

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
      process.stdout.write(d);
    });
  });

  req.on('error', error => {
    console.error(error);
  });

  req.write(JSON.stringify(event));
  req.end();
}

fs.readFile('events.jsonl', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const events = data.trim().split('\n').map(line => JSON.parse(line));

  events.forEach(event => {
    sendEvent(event);
  });
});
