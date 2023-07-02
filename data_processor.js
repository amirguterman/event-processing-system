constpg = require('pg');
const fs = require('fs');

const pool = new pg.Pool({
  // TODO: put some PostgreSQL configuration here ......
});

fs.readFile('events.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const events = JSON.parse(data);

  events.forEach(event => {
    pool.query(
      'INSERT INTO events (userId, eventName, value) VALUES ($1, $2, $3)',
      [event.userId, event.eventName, event.value],
      (err, res) => {
        if (err) {
          console.error('Error inserting data:', err);
        }
      }
    );
  });
});
