const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { announcementValidation, announcementUpdateValidation, announcementQueryValidation } = require('../validation/announcementValidation');
const { auth } = require('../middleware/auth');

// @route   POST /api/announcement
// @desc    Create a new announcement
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
        const { error, value } = announcementValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Add createdBy field
        value.createdBy = req.user.id;

        // If status is published, set publishedAt
        if (value.status === 'published') {
            value.publishedAt = new Date();
        }

        // Create new announcement
        const announcement = new Announcement(value);
        await announcement.save();

        // Populate createdBy field
        await announcement.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: { announcement }
        });

    } catch (error) {
        console.error('Announcement creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/announcement/public/list
// @desc    Public list of published and active announcements
// @access  Public
router.get('/public/list', async (req, res) => {
    try {
        const { limit = 50, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;
        const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const announcements = await Announcement.find({ status: 'published', isActive: true })
            .sort(sort)
            .limit(parseInt(limit))
            .lean();

        res.json({ success: true, data: { announcements } });
    } catch (error) {
        console.error('Public announcement list error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/announcement
// @desc    Get all announcements with filtering and pagination
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
        const { error, value } = announcementQueryValidation.validate(req.query);
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
            status,
            priority,
            isActive,
            sortBy,
            sortOrder
        } = value;

        // Build filter object
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (isActive !== undefined) filter.isActive = isActive;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [announcements, total] = await Promise.all([
            Announcement.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email')
                .lean(),
            Announcement.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: {
                announcements,
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
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/announcement/:id
// @desc    Get announcement by ID
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

        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            data: { announcement }
        });

    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   PUT /api/announcement/:id
// @desc    Update announcement
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
        const { error, value } = announcementUpdateValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Add updatedBy field
        value.updatedBy = req.user.id;

        // If status is being changed to published, set publishedAt
        if (value.status === 'published') {
            const existingAnnouncement = await Announcement.findById(req.params.id);
            if (existingAnnouncement && existingAnnouncement.status !== 'published') {
                value.publishedAt = new Date();
            }
        }

        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: { announcement }
        });

    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   DELETE /api/announcement/:id
// @desc    Delete announcement
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

        const announcement = await Announcement.findByIdAndDelete(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });

    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/announcement/stats/overview
// @desc    Get announcement statistics
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

        const stats = await Announcement.getStats();

        // Get recent announcements
        const recentAnnouncements = await Announcement.getRecent(5);

        // Get status distribution
        const statusDistribution = await Announcement.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get priority distribution
        const priorityDistribution = await Announcement.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                ...stats,
                recentAnnouncements,
                statusDistribution,
                priorityDistribution
            }
        });

    } catch (error) {
        console.error('Get announcement stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
