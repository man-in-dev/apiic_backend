const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth: authenticateToken, adminAuth: requireAdmin } = require('../middleware/auth');
const { validateAddAdmin, validateChangePassword } = require('../validation/adminValidation');

const router = express.Router();

// Add new admin user
router.post('/add-admin', authenticateToken, requireAdmin, validateAddAdmin, async (req, res) => {
    try {
        const { name, email, password, role = 'admin' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new admin user (password will be hashed by pre-save hook)
        const newAdmin = new User({
            name,
            email,
            password,
            role,
            isActive: true,
            createdBy: req.user._id
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                isActive: newAdmin.isActive,
                createdAt: newAdmin.createdAt
            }
        });
    } catch (error) {
        console.error('Add admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin user',
            error: error.message
        });
    }
});

// Change password
router.put('/change-password', authenticateToken, validateChangePassword, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const currentUserId = req.user._id;
        // Get user
        const user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.updatedBy = currentUserId;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
});

// Get all admin users
router.get('/admins', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ],
                role: { $in: ['admin', 'super_admin'] }
            }
            : { role: { $in: ['admin', 'super_admin'] } };

        // Get admins with pagination
        const admins = await User.find(searchQuery)
            .select('-password')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await User.countDocuments(searchQuery);

        res.json({
            success: true,
            data: {
                admins,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin users',
            error: error.message
        });
    }
});

// Update admin status
router.put('/admin/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Prevent deactivating self
        if (id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const admin = await User.findByIdAndUpdate(
            id,
            { isActive, updatedBy: req.user._id },
            { new: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        res.json({
            success: true,
            message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: admin
        });
    } catch (error) {
        console.error('Update admin status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update admin status',
            error: error.message
        });
    }
});

module.exports = router;
