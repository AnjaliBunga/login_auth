const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const dbconnect = require('./database/dbconnect');

const app = express();

// Connect DB
dbconnect();

// Middleware
app.use(
  cors({
    origin: ["https://login-auth-tawny.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);app.use(express.json());

// Health
app.get('/health', (req, res) => {
    res.json({ ok: true });
});

// Routes
app.use('/api/auth', require('./routes/auth'));

// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`server is running in the ${port}`);
});
