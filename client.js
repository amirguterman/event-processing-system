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

// Call sendEvent function to send events
const events = [
    { userId: 'abc123', name: 'add_revenue', value: 100 },
    { userId: 'abc123', name: 'subtract_revenue', value: 50 },
];

events.forEach(event => {
    sendEvent(event);
});
  
