const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const linkRoutes = require('./routes/linkRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// CORS — Vercel URL allow karo
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://linkvault-frontend-flax.vercel.app',
  ],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 LinkVault API is running!' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });