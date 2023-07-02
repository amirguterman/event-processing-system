// Import required modules
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Create a new PostgreSQL connection pool
const pool = new pg.Pool({
  // TODO: Add some PostgreSQL configuration here ......
});

// Create a directory for processed files if it doesn't exist
const processedDir = './processed';
if (!fs.existsSync(processedDir)){
    fs.mkdirSync(processedDir);
}

// Read the current directory
fs.readdir('.', (err, files) => {
  // If there's an error reading the directory, log it and return
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter out the event files from the list of files
  const eventFiles = files.filter(file => file.startsWith('events-') && file.endsWith('.jsonl'));

  // Process each event file
  eventFiles.forEach(file => {
    // Start a transaction
    pool.query('BEGIN', (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return;
      }

      // Read the event file
      fs.readFile(file, 'utf8', (err, data) => {
        // If there's an error reading the file, log it and return
        if (err) {
          console.error(`Error reading file ${file}:`, err);
          return;
        }

        // Parse the events from the file
        const events = data.trim().split('\n').map(line => JSON.parse(line));
        const revenues = {};

        // Calculate the revenue for each user
        events.forEach(event => {
          if (!revenues[event.userId]) {
            revenues[event.userId] = 0;
          }

          // Add or subtract revenue based on the event name
          if (event.name === 'add_revenue') {
            revenues[event.userId] += event.value;
          } else if (event.name === 'subtract_revenue') {
            revenues[event.userId] -= event.value;
          }
        });

        // Insert or update the revenue for each user in the database
        for (const userId in revenues) {
          pool.query(
            'INSERT INTO users_revenue (user_id, revenue) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET revenue = users_revenue.revenue + EXCLUDED.revenue',
            [userId, revenues[userId]],
            (err, res) => {
              // If there's an error inserting the data, log it
              if (err) {
                console.error('Error inserting data:', err);
              }
            }
          );
        }

        // Mark the file as processed in the database
        pool.query(
          'INSERT INTO processed_files (file_name) VALUES ($1)',
          [file],
          (err, res) => {
            // If there's an error inserting the data, log it
            if (err) {
              console.error('Error marking file as processed:', err);
            }
          }
        );

        // Commit the transaction
        pool.query('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            return;
          }

          // Move the processed file to the processed directory
          fs.rename(file, path.join(processedDir, file), err => {
            if (err) {
              console.error(`Error moving file ${file}:`, err);
            }
          });
        });
      });
    });
  });
});
