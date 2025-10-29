const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const preIncubationRoutes = require('./routes/preIncubation');
const incubationRoutes = require('./routes/incubation');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const announcementRoutes = require('./routes/announcement');
const programRoutes = require('./routes/program');
const eventRoutes = require('./routes/event');
const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');
const mentorRoutes = require('./routes/mentor');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//     message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apiic', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'APIIC Backend Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/apiic_api/auth', authRoutes);
app.use('/apiic_api/pre-incubation', preIncubationRoutes);
app.use('/apiic_api/incubation', incubationRoutes);
app.use('/apiic_api/contact', contactRoutes);
app.use('/apiic_api/announcement', announcementRoutes);
app.use('/apiic_api/program', programRoutes);
app.use('/apiic_api/event', eventRoutes);
app.use('/apiic_api/blog', blogRoutes);
app.use('/apiic_api/admin', adminRoutes);
app.use('/apiic_api/mentor', mentorRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to APIIC (AIIMS Patna Incubation Center) Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            preIncubation: '/api/pre-incubation',
            incubation: '/api/incubation',
            contact: '/api/contact',
            announcement: '/api/announcement',
            event: '/api/event',
            program: '/api/program',
            blog: '/api/blog',
            admin: '/api/admin',
            mentor: '/api/mentor'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 APIIC Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
