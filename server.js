const express = require('express');
const fs = require('fs');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint to receive live events
app.post('/liveEvent', (req, res) => {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    // If authorization header is not correct, return 401 Unauthorized
    if (authHeader !== 'secret') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Append event data to server-events.jsonl file
    fs.appendFile('server-events.jsonl', JSON.stringify(req.body) + '\n', err => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
    
    // Respond with success message
    res.status(200).json({ message: 'Event received' });
});

// GET endpoint to fetch user events
app.get('/userEvents/:userId', (req, res) => {
    // Implement your logic here to fetch user events from the database
});

// Start server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
