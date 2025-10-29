const express = require('express');
const PreIncubationApplication = require('../models/PreIncubationApplication');
const { auth, adminAuth } = require('../middleware/auth');
const { preIncubationApplicationSchema, updatePreIncubationApplicationSchema, queryParamsSchema } = require('../validation/preIncubationValidation');

const router = express.Router();

// @route   POST /api/pre-incubation
// @desc    Create a new pre-incubation application
// @access  Private
router.post('/', async (req, res) => {
    try {
        // const { error, value } = preIncubationApplicationSchema.validate(req.body);
        // if (error) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Validation error',
        //         errors: error.details.map(detail => detail.message)
        //     });
        // }

        const application = new PreIncubationApplication({
            ...req.body,
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Pre-incubation application submitted successfully',
            data: { application }
        });
    } catch (error) {
        console.error('Create pre-incubation application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during application submission'
        });
    }
});

// @route   GET /api/pre-incubation
// @desc    Get all pre-incubation applications with filtering and pagination
// @access  Private (Admin/Reviewer)
router.get('/', auth, async (req, res) => {
    try {
        const { error, value } = queryParamsSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { page, limit, search, applicationStatus, currentStage, status, sortBy, sortOrder } = value;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        if (applicationStatus) filter.applicationStatus = applicationStatus;
        if (currentStage) filter.currentStage = currentStage;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { applicantName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { productServiceDetails: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const applications = await PreIncubationApplication.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await PreIncubationApplication.countDocuments(filter);

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });
    } catch (error) {
        console.error('Get pre-incubation applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applications'
        });
    }
});

// @route   GET /api/pre-incubation/:id
// @desc    Get a single pre-incubation application
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const application = await PreIncubationApplication.findById(req.params.id)

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Pre-incubation application not found'
            });
        }

        // Check if user can access this application
        if (req.user.role === 'applicant') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { application }
        });
    } catch (error) {
        console.error('Get pre-incubation application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching application'
        });
    }
});

// @route   PUT /api/pre-incubation/:id
// @desc    Update a pre-incubation application
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { error, value } = updatePreIncubationApplicationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        const application = await PreIncubationApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Pre-incubation application not found'
            });
        }

        // Check if user can update this application
        if (req.user.role === 'applicant' && application.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow status updates for admin/reviewer
        if (req.user.role === 'applicant' && (value.applicationStatus || value.currentStage || value.status)) {
            return res.status(403).json({
                success: false,
                message: 'You cannot update application status'
            });
        }

        const updatedApplication = await PreIncubationApplication.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true, runValidators: true }
        ).populate('submittedBy', 'name email');

        res.json({
            success: true,
            message: 'Pre-incubation application updated successfully',
            data: { application: updatedApplication }
        });
    } catch (error) {
        console.error('Update pre-incubation application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during application update'
        });
    }
});

// @route   DELETE /api/pre-incubation/:id
// @desc    Delete a pre-incubation application
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const application = await PreIncubationApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Pre-incubation application not found'
            });
        }

        await PreIncubationApplication.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Pre-incubation application deleted successfully'
        });
    } catch (error) {
        console.error('Delete pre-incubation application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during application deletion'
        });
    }
});

// @route   GET /api/pre-incubation/stats/overview
// @desc    Get pre-incubation application statistics
// @access  Private (Admin/Reviewer)
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const stats = await PreIncubationApplication.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    submitted: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'submitted'] }, 1, 0] } },
                    underReview: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'under-review'] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'approved'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'rejected'] }, 1, 0] } },
                    incubated: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'incubated'] }, 1, 0] } },
                    graduated: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'graduated'] }, 1, 0] } },
                    exited: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'exited'] }, 1, 0] } }
                }
            }
        ]);

        const result = stats[0] || {
            total: 0,
            submitted: 0,
            underReview: 0,
            approved: 0,
            rejected: 0,
            incubated: 0,
            graduated: 0,
            exited: 0
        };

        res.json({
            success: true,
            data: { stats: result }
        });
    } catch (error) {
        console.error('Get pre-incubation stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
});

module.exports = router;
