const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const { createBlogValidation, updateBlogValidation, blogQueryValidation } = require('../validation/blogValidation');

// Create blog
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        const { error, value } = createBlogValidation.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map(d => d.message) });
        value.createdBy = req.user.id;
        if (value.status === 'published') value.publishedAt = new Date();
        const blog = await Blog.create(value);
        await blog.populate('createdBy', 'name email');
        res.status(201).json({ success: true, message: 'Blog created', data: { blog } });
    } catch (e) {
        console.error('Create blog error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// List blogs (admin)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        const { error, value } = blogQueryValidation.validate(req.query);
        if (error) return res.status(400).json({ success: false, message: 'Invalid query parameters', errors: error.details.map(d => d.message) });
        const { page, limit, search, status, isActive, sortBy, sortOrder } = value;
        const filter = {};
        if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
        if (status) filter.status = status;
        if (typeof isActive === 'boolean') filter.isActive = isActive;
        const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const [blogs, total] = await Promise.all([
            Blog.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email').populate('updatedBy', 'name email').lean(),
            Blog.countDocuments(filter)
        ]);
        res.json({ success: true, data: { blogs, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: limit, hasNextPage: page * limit < total, hasPrevPage: page > 1 } } });
    } catch (e) {
        console.error('List blog error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get by id
router.get('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        const blog = await Blog.findById(req.params.id).populate('createdBy', 'name email').populate('updatedBy', 'name email');
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, data: { blog } });
    } catch (e) {
        console.error('Get blog error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        const { error, value } = updateBlogValidation.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map(d => d.message) });
        value.updatedBy = req.user.id;
        if (value.status === 'published') {
            const existing = await Blog.findById(req.params.id);
            if (existing && existing.status !== 'published') value.publishedAt = new Date();
        }
        const blog = await Blog.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true }).populate('createdBy', 'name email').populate('updatedBy', 'name email');
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, message: 'Blog updated', data: { blog } });
    } catch (e) {
        console.error('Update blog error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, message: 'Blog deleted' });
    } catch (e) {
        console.error('Delete blog error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Public list
router.get('/public/list', async (req, res) => {
    try {
        const { limit = 10, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;
        const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const blogs = await Blog.find({ status: 'published', isActive: true }).sort(sort).limit(parseInt(limit)).lean();
        res.json({ success: true, data: { blogs } });
    } catch (e) {
        console.error('Public list blog error:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;


