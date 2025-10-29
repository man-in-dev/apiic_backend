const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { createEventValidation, updateEventValidation, eventQueryValidation } = require('../validation/eventValidation');
const { auth } = require('../middleware/auth');

// @route   POST /api/event
// @desc    Create a new event
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        // Validate request data
        const { error, value } = createEventValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Add createdBy field
        value.createdBy = req.user.id;

        // Create new event
        const event = new Event(value);
        await event.save();

        // Populate createdBy field
        await event.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: { event }
        });

    } catch (error) {
        console.error('Event creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/event
// @desc    Get all events with filtering and pagination
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        // Validate query parameters
        const { error, value } = eventQueryValidation.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: error.details.map(detail => detail.message)
            });
        }

        const {
            page,
            limit,
            search,
            type,
            status,
            isActive,
            sortBy,
            sortOrder,
            startDate,
            endDate
        } = value;

        // Build filter object
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) filter.type = type;
        if (status) filter.status = status;
        if (isActive !== undefined) filter.isActive = isActive;

        // Date range filter
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [events, total] = await Promise.all([
            Event.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email')
                .lean(),
            Event.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/event/:id
// @desc    Get event by ID
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: { event }
        });

    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   PUT /api/event/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        // Validate request data
        const { error, value } = updateEventValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Add updatedBy field
        value.updatedBy = req.user.id;

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: { event }
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   DELETE /api/event/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/event/stats/overview
// @desc    Get event statistics
// @access  Private (Admin only)
router.get('/stats/overview', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const stats = await Event.getStats();
        const typeDistribution = await Event.getTypeDistribution();
        const recentEvents = await Event.getRecent(5);
        const upcomingEvents = await Event.getUpcoming(5);

        res.json({
            success: true,
            data: {
                ...stats,
                typeDistribution,
                recentEvents,
                upcomingEvents
            }
        });

    } catch (error) {
        console.error('Get event stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/event/public/upcoming
// @desc    Get upcoming events (public access)
// @access  Public
router.get('/public/upcoming', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const events = await Event.getUpcoming(parseInt(limit));

        res.json({
            success: true,
            data: { events }
        });

    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/event/public/list
// @desc    Public events list with optional filters
// @access  Public
router.get('/public/list', async (req, res) => {
    try {
        const {
            type,
            status,
            limit = 50,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const filter = { isActive: true };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const events = await Event.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .lean();

        res.json({ success: true, data: { events } });
    } catch (error) {
        console.error('Public list events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
