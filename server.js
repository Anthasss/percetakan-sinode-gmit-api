const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from localhost:5173
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Example API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is configured for localhost:5173' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
