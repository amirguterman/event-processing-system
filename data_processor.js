const pg = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new pg.Pool({
  // TODO: Add some PostgreSQL configuration here ......
});

fs.readdir('.', (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const eventFiles = files.filter(file => file.startsWith('events-') && file.endsWith('.jsonl'));

  eventFiles.forEach(file => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      const events = data.trim().split('\n').map(line => JSON.parse(line));
      const revenues = {};

      events.forEach(event => {
        if (!revenues[event.userId]) {
          revenues[event.userId] = 0;
        }

        if (event.name === 'add_revenue') {
          revenues[event.userId] += event.value;
        } else if (event.name === 'subtract_revenue') {
          revenues[event.userId] -= event.value;
        }
      });

      for (const userId in revenues) {
        pool.query(
          'INSERT INTO users_revenue (user_id, revenue) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET revenue = users_revenue.revenue + EXCLUDED.revenue',
          [userId, revenues[userId]],
          (err, res) => {
            if (err) {
              console.error('Error inserting data:', err);
            }
          }
        );
      }
    });
  });
});
