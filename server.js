const express = require('express');
const app = express();
app.use(express.json());

app.post('/liveEvent', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader !== 'secret') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // TODO: Save event data to a file
  
  res.status(200).json({ message: 'Event received' });
});


app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
