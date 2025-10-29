const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    },
    coverImage: {
        type: String,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: null
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
}, { timestamps: true });

blogSchema.index({ status: 1, isActive: 1, publishedAt: -1, createdAt: -1 });
// Text index across title, content and tags (tags is an array of strings)
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);


