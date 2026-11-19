const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import API routes
const adventureRoutes = require('./routes/adventureRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const loveNoteRoutes = require('./routes/loveNoteRoutes');

// Main route
app.get('/', (req, res) => {
    res.json({
        message: 'Our Little Adventures backend is running! ❤️'
    });
});

// Connect API routes
app.use('/api/adventures', adventureRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/love-notes', loveNoteRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully! ❤️');
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});