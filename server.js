const fs = require('fs');
const express = require('express');
const cron = require('node-cron');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// PostgreSQL pool configuration
const pool = new pg.Pool({
    // TODO: ... add postgresSql configuration here also ..
});

// POST endpoint to receive live events
app.post('/liveEvent', (req, res) => {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    // If authorization header is not correct, return 401 Unauthorized
    if (authHeader !== 'secret') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Append event data to events.jsonl file
    fs.appendFile('events.jsonl', JSON.stringify(req.body) + '\n', err => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
    
    // Respond with success message
    res.status(200).json({ message: 'Event received' });
});

// Schedule task to run every minute
cron.schedule('* * * * *', () => {
  const date = new Date();
  // Format timestamp
  const timestamp = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}`;

  // Check if events.jsonl file exists
  fs.access('events.jsonl', fs.constants.F_OK, (err) => {
    if (err) {
      console.error('events.jsonl does not exist');
      return;
    }
    // Rename events.jsonl file with timestamp
    fs.rename('events.jsonl', `events-${timestamp}.jsonl`, err => {
      if (err) {
        console.error('Error renaming file:', err);
      }
    });
  });
});

// GET endpoint to fetch user events
app.get('/userEvents/:userId', (req, res) => {
    const userId = req.params.userId;

    // Query to fetch user revenue from database
    pool.query('SELECT * FROM users_revenue WHERE user_id = $1', [userId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Respond with query results
        res.status(200).json(result.rows);
    });
});

// Start server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
