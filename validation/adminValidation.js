const Joi = require('joi');

const addAdminSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 100 characters'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address'
        }),
    password: Joi.string()
        .min(8)
        // .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
    role: Joi.string()
        .valid('admin', 'super_admin')
        .default('admin')
        .messages({
            'any.only': 'Role must be either admin or super_admin'
        })
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Current password is required'
        }),
    newPassword: Joi.string()
        .min(8)
        // .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'New password is required',
            'string.min': 'New password must be at least 8 characters long',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        })
});

const updateAdminStatusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isActive must be a boolean value'
        })
});

const validateAddAdmin = (req, res, next) => {
    const { error } = addAdminSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateChangePassword = (req, res, next) => {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateUpdateAdminStatus = (req, res, next) => {
    const { error } = updateAdminStatusSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

module.exports = {
    validateAddAdmin,
    validateChangePassword,
    validateUpdateAdminStatus
};
