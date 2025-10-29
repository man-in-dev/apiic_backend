const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true,
        maxlength: [100, 'Designation cannot be more than 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Company is required'],
        trim: true,
        maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    expertise: {
        type: [String],
        required: [true, 'At least one expertise area is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one expertise area is required'
        }
    },
    bio: {
        type: String,
        required: [true, 'Bio is required'],
        trim: true,
        maxlength: [1000, 'Bio cannot be more than 1000 characters']
    },
    profileImage: {
        type: String,
        default: ''
    },
    linkedinProfile: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Text index for search functionality
mentorSchema.index({
    name: 'text',
    email: 'text',
    designation: 'text',
    company: 'text',
    expertise: 'text',
    bio: 'text'
});

module.exports = mongoose.model('Mentor', mentorSchema);
