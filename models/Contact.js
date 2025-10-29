const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    organization: {
        type: String,
        trim: true,
        maxlength: [100, 'Organization name cannot exceed 100 characters']
    },

    // Message Details
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },

    // Preferences
    subscribeNewsletter: {
        type: Boolean,
        default: false
    },

    // Status and Management
    status: {
        type: String,
        enum: ['new', 'in-progress', 'responded', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    // Response tracking
    response: {
        type: String,
        trim: true,
        maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    respondedAt: {
        type: Date
    },

    // Source tracking
    source: {
        type: String,
        enum: ['website', 'email', 'phone', 'referral', 'other'],
        default: 'website'
    },
    referrer: {
        type: String,
        trim: true
    },

    // Timestamps
    submittedAt: {
        type: Date,
        default: Date.now
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ submittedAt: -1 });
contactSchema.index({ priority: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for time since submission
contactSchema.virtual('timeSinceSubmission').get(function () {
    const now = new Date();
    const diffInHours = Math.floor((now - this.submittedAt) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
});

// Pre-save middleware to update lastActivityAt
contactSchema.pre('save', function (next) {
    this.lastActivityAt = new Date();
    next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                responded: { $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] } },
                closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
                newsletterSubscribers: { $sum: { $cond: ['$subscribeNewsletter', 1, 0] } }
            }
        }
    ]);

    return stats[0] || {
        total: 0,
        new: 0,
        inProgress: 0,
        responded: 0,
        closed: 0,
        newsletterSubscribers: 0
    };
};

module.exports = mongoose.model('Contact', contactSchema);
