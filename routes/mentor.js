const express = require('express');
const Mentor = require('../models/Mentor');
const { auth: authenticateToken, adminAuth: requireAdmin } = require('../middleware/auth');
const { validateCreateMentor, validateUpdateMentor } = require('../validation/mentorValidation');

const router = express.Router();

// Create new mentor
router.post('/', authenticateToken, requireAdmin, validateCreateMentor, async (req, res) => {
    try {
        const mentorData = {
            ...req.body,
            createdBy: req.user._id
        };

        const mentor = new Mentor(mentorData);
        await mentor.save();

        res.status(201).json({
            success: true,
            message: 'Mentor created successfully',
            data: mentor
        });
    } catch (error) {
        console.error('Create mentor error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Mentor with this email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create mentor',
            error: error.message
        });
    }
});

// Get all mentors with pagination and search
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', isActive } = req.query;
        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {};

        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { expertise: { $in: [new RegExp(search, 'i')] } }
                ]
            };
        }

        if (isActive !== undefined) {
            searchQuery.isActive = isActive === 'true';
        }

        // Get mentors with pagination
        const mentors = await Mentor.find(searchQuery)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Mentor.countDocuments(searchQuery);

        res.json({
            success: true,
            data: {
                mentors,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get mentors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mentors',
            error: error.message
        });
    }
});



// Get single mentor
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        res.json({
            success: true,
            data: mentor
        });
    } catch (error) {
        console.error('Get mentor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mentor',
            error: error.message
        });
    }
});

// Update mentor
router.put('/:id', authenticateToken, requireAdmin, validateUpdateMentor, async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id
        };

        const mentor = await Mentor.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        res.json({
            success: true,
            message: 'Mentor updated successfully',
            data: mentor
        });
    } catch (error) {
        console.error('Update mentor error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Mentor with this email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update mentor',
            error: error.message
        });
    }
});

// Delete mentor
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndDelete(req.params.id);

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        res.json({
            success: true,
            message: 'Mentor deleted successfully'
        });
    } catch (error) {
        console.error('Delete mentor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete mentor',
            error: error.message
        });
    }
});

// Toggle mentor status
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;

        const mentor = await Mentor.findByIdAndUpdate(
            req.params.id,
            { isActive, updatedBy: req.user._id },
            { new: true }
        ).populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        res.json({
            success: true,
            message: `Mentor ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: mentor
        });
    } catch (error) {
        console.error('Toggle mentor status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update mentor status',
            error: error.message
        });
    }
});

// Public endpoint to get active mentors
router.get('/public/list', async (req, res) => {
    try {
        const { limit = 10, search = '' } = req.query;

        let searchQuery = { isActive: true };

        if (search) {
            searchQuery = {
                ...searchQuery,
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { expertise: { $in: [new RegExp(search, 'i')] } }
                ]
            };
        }

        const mentors = await Mentor.find(searchQuery)
            .select('-email -phone -createdBy -updatedBy -__v')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: mentors
        });
    } catch (error) {
        console.error('Get public mentors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mentors',
            error: error.message
        });
    }
});

module.exports = router;
