const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    duration: {
        type: String,
        trim: true,
        maxlength: [100, 'Duration cannot exceed 100 characters']
    },
    bullets: {
        type: [String],
        validate: v => Array.isArray(v) && v.length > 0,
        required: [true, 'At least one bullet is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

programSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Program', programSchema);


