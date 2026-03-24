const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = require('./db');
const professorRoutes = require('./routes/professors');

const app = express();
const port = Number(process.env.PORT || 5000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: clientOrigin,
    credentials: false,
  })
);
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, message: 'API and database are connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ ok: false, message: 'Database connection failed' });
  }
});

app.use('/api/professors', professorRoutes);

app.listen(port, () => {
  console.log(`ACM API listening at http://localhost:${port}`);
});
