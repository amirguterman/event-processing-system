const fs = require('fs');
const express = require('express');
const cron = require('node-cron');
const app = express();

app.use(express.json());

const pool = new pg.Pool({
    // TODO: ... add postgresSql configuration here also ..
});

app.post('/liveEvent', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader !== 'secret') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    fs.appendFile('events.jsonl', JSON.stringify(req.body) + '\n', err => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
    
    res.status(200).json({ message: 'Event received' });
});

// Schedule task to run every minute
cron.schedule('* * * * *', () => {
  const date = new Date();
  const timestamp = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}`;

  fs.access('events.jsonl', fs.constants.F_OK, (err) => {
    if (err) {
      console.error('events.jsonl does not exist');
      return;
    }
    fs.rename('events.jsonl', `events-${timestamp}.jsonl`, err => {
      if (err) {
        console.error('Error renaming file:', err);
      }
    });
  });
});

app.get('/userEvents/:userId', (req, res) => {
    const userId = req.params.userId;

    pool.query('SELECT * FROM users_revenue WHERE user_id = $1', [userId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json(result.rows);
    });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
