const fs = require('fs').promises;
const pg = require('pg');

// PostgreSQL connection pool
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password1!',
    port: 5432,
});

async function processEventFile(file) {
    try {
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
            await pool.query(
                'INSERT INTO users_revenue (user_id, revenue) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET revenue = users_revenue.revenue + EXCLUDED.revenue',
                [userId, revenues[userId]]
            );
        }
    } catch (err) {
        console.error('Error processing file:', err);
    }
}

// Start processing
processEventFile('server-events.jsonl');
