
const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/liveEvent', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader !== 'secret') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    fs.appendFile('events.json', JSON.stringify(req.body) + '\n', err => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
    
    res.status(200).json({ message: 'Event received' });
  });
  

app.get('/userEvents/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // TODO: Fetch events from database and return as JSON
  
  res.status(200).json({ message: `Events for user ${userId}` });
});


app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
