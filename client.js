const fs = require('fs');

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
