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

// TODO: Use sendEvent function to send events
