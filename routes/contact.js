const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { contactValidation, contactUpdateValidation, contactQueryValidation } = require('../validation/contactValidation');
const { auth } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Create a new contact form submission
// @access  Public
router.post('/', async (req, res) => {
    try {
        // Validate request data
        const { error, value } = contactValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Create new contact submission
        const contact = new Contact(value);
        await contact.save();

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: {
                id: contact._id,
                submittedAt: contact.submittedAt,
                status: contact.status
            }
        });

    } catch (error) {
        console.error('Contact creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/contact
// @desc    Get all contact submissions with filtering and pagination
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
        // const { error, value } = contactQueryValidation.validate(req.query);
        // if (error) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid query parameters',
        //         errors: error.details.map(detail => detail.message)
        //     });
        // }

        // const {
        //     page,
        //     limit,
        //     search,
        //     status,
        //     priority,
        //     source,
        //     dateFrom,
        //     dateTo,
        //     sortBy,
        //     sortOrder
        // } = value;

        // Build filter object

        const {
            page,
            limit,
            search,
            status,
            priority,
            source,
            dateFrom,
            dateTo,
            sortBy,
            sortOrder
        } = {
            page: "",
            limit: "",
            search: "",
            status: "new",
            priority: "",
            source: "",
            dateFrom: "",
            dateTo: "",
            sortBy: "asc",
            sortOrder: ""
        };

        const filter = {};

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (source) filter.source = source;

        if (dateFrom || dateTo) {
            filter.submittedAt = {};
            if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom);
            if (dateTo) filter.submittedAt.$lte = new Date(dateTo);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [contacts, total] = await Promise.all([
            Contact.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Contact.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: {
                contacts,
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
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Private (Admin only)
router.get('/stats', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const stats = await Contact.getStats();

        // Get additional stats
        const recentContacts = await Contact.find()
            .sort({ submittedAt: -1 })
            .limit(5)
            .select('firstName lastName email subject status submittedAt')
            .lean();

        const statusDistribution = await Contact.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const priorityDistribution = await Contact.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                ...stats,
                recentContacts,
                statusDistribution,
                priorityDistribution
            }
        });

    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/contact/:id
// @desc    Get a specific contact submission
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

        const contact = await Contact.findById(req.params.id)
            .populate('respondedBy', 'name email')
            .lean();

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   PUT /api/contact/:id
// @desc    Update a contact submission
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
        const { error, value } = contactUpdateValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Add response tracking if response is provided
        if (value.response) {
            value.respondedBy = req.user.id;
            value.respondedAt = new Date();
            if (!value.status) {
                value.status = 'responded';
            }
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true, runValidators: true }
        ).populate('respondedBy', 'name email');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact submission updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact submission
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

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact submission deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
