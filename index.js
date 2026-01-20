const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Calgary Home Pro API is running...');
});

// Import Routes
const blogRoutes = require('./routes/blogs');
const quoteRoutes = require('./routes/quotes');
const authRoutes = require('./routes/auth');

app.use('/api/blogs', blogRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------------`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://0.0.0.0:${PORT}`);
    console.log(`-----------------------------------------------`);
});
