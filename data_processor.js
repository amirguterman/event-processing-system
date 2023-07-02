// Import required modules
const pgp = require('pg-promise')();
const fs = require('fs').promises;
const path = require('path');

// Create a new PostgreSQL connection pool
const pool = pgp({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password1!',
  port: 5432,
});

// Create a directory for processed files if it doesn't exist
const processedDir = './processed';
fs.access(processedDir)
  .catch(() => {
    console.log(`Creating a directory for processed files`);
    return fs.mkdir(processedDir);
  });

// Start processing
processFiles();

// Schedule to process the files every 5 seconds
setInterval(processFiles, 5000);

async function processFiles() {
  try {
    const files = await fs.readdir('.');
    // Filter out the event files from the list of files
    const eventFiles = files.filter(file => file.startsWith('events-') && file.endsWith('.jsonl'));

    // Sort the eventFiles by batch name
    eventFiles.sort((a, b) => {
      const batchNameA = a.replace('events-', '').replace('.jsonl', '');
      const batchNameB = b.replace('events-', '').replace('.jsonl', '');
      return batchNameA.localeCompare(batchNameB);
    });

    // Process each event file one by one
    for (const file of eventFiles) {
      try {
        await processEventFile(file);
      } catch (err) {
        console.error(`Fatal error processing file ${file}:`, err);
        // Exit current iteration of loop, continue with next iteration
        continue;
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

// Process each event file
async function processEventFile(file) {
  try {
      // Begin a new transaction
      await pool.tx(async t => {
          // Read the event file
          const data = await fs.readFile(file, 'utf8');
          const events = data.trim().split('\n').filter(line => line.length > 0).map(line => JSON.parse(line));
        
          // Calculate the revenue for each user
          const revenues = {};
          for (let event of events) {
              if (!revenues[event.userId]) {
                  revenues[event.userId] = 0;
              }

              // Add or subtract revenue based on the event name
              if (event.name === 'add_revenue') {
                  revenues[event.userId] += event.value;
              } else if (event.name === 'subtract_revenue') {
                  revenues[event.userId] -= event.value;
              }
          }

          // Insert or update the revenue for each user in the database
          for (const userId in revenues) {
              await t.none(
                  'INSERT INTO users_revenue (user_id, revenue) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET revenue = users_revenue.revenue + EXCLUDED.revenue',
                  [userId, revenues[userId]]
              );
          }

          // Mark the file as processed in the database
          await t.none(
              'INSERT INTO processed_batches (batch_name) VALUES ($1)',
              [file]
          );
      });

      // Move the processed file to the processed directory
      await fs.rename(file, path.join(processedDir, file));

  } catch (err) {
      console.error('Error processing file:', err);
  }
}
