const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    link: {
        type: String,
        required: [true, 'Link is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid URL'
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: null
    },
    expiresAt: {
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
}, {
    timestamps: true
});

// Index for better query performance
announcementSchema.index({ status: 1, isActive: 1, publishedAt: 1 });
announcementSchema.index({ createdAt: -1 });

// Static method to get stats
announcementSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                published: {
                    $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                },
                draft: {
                    $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                },
                archived: {
                    $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
                },
                active: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        active: 0
    };
};

// Static method to get recent announcements
announcementSchema.statics.getRecent = async function (limit = 5) {
    return this.find({ status: 'published', isActive: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean();
};

module.exports = mongoose.model('Announcement', announcementSchema);
