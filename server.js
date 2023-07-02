
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


const pool = new pg.Pool({
    // TODO: ... add postgresSql configuration here also ..
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
