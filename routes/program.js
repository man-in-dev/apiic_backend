const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const { auth } = require('../middleware/auth');
const { createProgramValidation, updateProgramValidation, programQueryValidation } = require('../validation/programValidation');

// Create
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }
        const { error, value } = createProgramValidation.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map(d => d.message) });
        value.createdBy = req.user.id;
        const program = await Program.create(value);
        await program.populate('createdBy', 'name email');
        res.status(201).json({ success: true, message: 'Program created', data: { program } });
    } catch (e) {
        console.error('Create program error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// List
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }
        const { error, value } = programQueryValidation.validate(req.query);
        if (error) return res.status(400).json({ success: false, message: 'Invalid query parameters', errors: error.details.map(d => d.message) });

        const { page, limit, search, isActive, sortBy, sortOrder } = value;
        const filter = {};
        if (typeof isActive === 'boolean') filter.isActive = isActive;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;

        const [programs, total] = await Promise.all([
            Program.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Program.countDocuments(filter)
        ]);

        res.json({
            success: true, data: {
                programs, pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1,
                }
            }
        });
    } catch (e) {
        console.error('List program error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get by id
router.get('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
        res.json({ success: true, data: { program } });
    } catch (e) {
        console.error('Get program error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }
        const { error, value } = updateProgramValidation.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map(d => d.message) });
        value.updatedBy = req.user.id;
        const program = await Program.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
        if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
        res.json({ success: true, message: 'Program updated', data: { program } });
    } catch (e) {
        console.error('Update program error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }
        const program = await Program.findByIdAndDelete(req.params.id);
        if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
        res.json({ success: true, message: 'Program deleted' });
    } catch (e) {
        console.error('Delete program error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Public: list active programs
router.get('/public/list', async (req, res) => {
    try {
        const programs = await Program.find({ isActive: true }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: { programs } });
    } catch (e) {
        console.error('Public programs error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;


