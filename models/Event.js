const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    type: {
        type: String,
        required: [true, 'Event type is required'],
        enum: [
            'workshop',
            'seminar',
            'webinar',
            'outreach',
            'collaboration',
            'hackathon',
            'capacity-building',
            'calendar-event',
            'past-event'
        ]
    },
    venue: {
        type: String,
        trim: true,
        maxlength: [200, 'Venue cannot exceed 200 characters']
    },
    speaker: {
        type: String,
        trim: true,
        maxlength: [200, 'Speaker name cannot exceed 200 characters']
    },
    mode: {
        type: String,
        enum: ['In-person', 'Online', 'Hybrid'],
        default: 'In-person'
    },
    audience: {
        type: String,
        trim: true,
        maxlength: [200, 'Audience cannot exceed 200 characters']
    },
    participants: {
        type: String,
        trim: true,
        maxlength: [100, 'Participants cannot exceed 100 characters']
    },
    focus: {
        type: String,
        trim: true,
        maxlength: [500, 'Focus cannot exceed 500 characters']
    },
    partners: {
        type: String,
        trim: true,
        maxlength: [500, 'Partners cannot exceed 500 characters']
    },
    objective: {
        type: String,
        trim: true,
        maxlength: [1000, 'Objective cannot exceed 1000 characters']
    },
    theme: {
        type: String,
        trim: true,
        maxlength: [200, 'Theme cannot exceed 200 characters']
    },
    prizes: {
        type: String,
        trim: true,
        maxlength: [200, 'Prizes cannot exceed 200 characters']
    },
    teams: {
        type: String,
        trim: true,
        maxlength: [100, 'Teams cannot exceed 100 characters']
    },
    duration: {
        type: String,
        trim: true,
        maxlength: [100, 'Duration cannot exceed 100 characters']
    },
    sessions: {
        type: String,
        trim: true,
        maxlength: [100, 'Sessions cannot exceed 100 characters']
    },
    certification: {
        type: String,
        trim: true,
        maxlength: [200, 'Certification cannot exceed 200 characters']
    },
    eligibility: {
        type: String,
        trim: true,
        maxlength: [500, 'Eligibility cannot exceed 500 characters']
    },
    modules: {
        type: String,
        trim: true,
        maxlength: [1000, 'Modules cannot exceed 1000 characters']
    },
    highlight: {
        type: String,
        trim: true,
        maxlength: [500, 'Highlight cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
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

// Index for better query performance
eventSchema.index({ status: 1, isActive: 1, date: 1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ title: 'text', description: 'text' });

// Static method to get stats
eventSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                upcoming: {
                    $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] }
                },
                ongoing: {
                    $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
                },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                },
                active: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        active: 0
    };
};

// Static method to get event type distribution
eventSchema.statics.getTypeDistribution = async function () {
    return this.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

// Static method to get recent events
eventSchema.statics.getRecent = async function (limit = 5) {
    return this.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean();
};

// Static method to get upcoming events
eventSchema.statics.getUpcoming = async function (limit = 10) {
    return this.find({
        status: 'upcoming',
        isActive: true,
        date: { $gte: new Date() }
    })
        .sort({ date: 1 })
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean();
};

module.exports = mongoose.model('Event', eventSchema);
