const mongoose = require('mongoose');
const crypto = require('crypto');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'unsubscribed', 'bounced'],
        default: 'pending',
        index: true
    },
    confirmationToken: {
        type: String,
        unique: true,
        index: true
    },
    unsubscribeToken: {
        type: String,
        unique: true,
        index: true
    },
    preferences: {
        weekly: {
            type: Boolean,
            default: true
        },
        essays: {
            type: Boolean,
            default: true
        },
        projects: {
            type: Boolean,
            default: true
        },
        announcements: {
            type: Boolean,
            default: false
        }
    },
    source: {
        type: String,
        enum: ['website', 'admin', 'api'],
        default: 'website'
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    lastEmailSent: {
        type: Date
    },
    emailCount: {
        type: Number,
        default: 0
    },
    bounces: {
        type: Number,
        default: 0
    },
    lastBounce: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
subscriberSchema.index({ email: 1 }, { unique: true });
subscriberSchema.index({ status: 1 });
subscriberSchema.index({ confirmationToken: 1 }, { unique: true });
subscriberSchema.index({ unsubscribeToken: 1 }, { unique: true });

// Pre-save middleware to generate tokens
subscriberSchema.pre('save', function(next) {
    if (this.isNew) {
        this.confirmationToken = crypto.randomBytes(32).toString('hex');
        this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// Instance methods
subscriberSchema.methods.confirm = function() {
    this.status = 'active';
    this.confirmationToken = undefined;
    return this.save();
};

subscriberSchema.methods.unsubscribe = function() {
    this.status = 'unsubscribed';
    return this.save();
};

subscriberSchema.methods.resubscribe = function() {
    this.status = 'active';
    this.bounces = 0;
    this.lastBounce = undefined;
    return this.save();
};

subscriberSchema.methods.incrementEmailCount = function() {
    this.emailCount += 1;
    this.lastEmailSent = new Date();
    return this.save();
};

subscriberSchema.methods.recordBounce = function() {
    this.bounces += 1;
    this.lastBounce = new Date();
    
    if (this.bounces >= 3) {
        this.status = 'bounced';
    }
    
    return this.save();
};

// Static methods
subscriberSchema.statics.findActive = function() {
    return this.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .exec();
};

subscriberSchema.statics.findByPreference = function(preference) {
    return this.find({ 
        status: 'active',
        [`preferences.${preference}`]: true 
    })
    .sort({ createdAt: -1 })
    .exec();
};

subscriberSchema.statics.findPending = function() {
    return this.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .exec();
};

subscriberSchema.statics.findBounced = function() {
    return this.find({ status: 'bounced' })
        .sort({ lastBounce: -1 })
        .exec();
};

subscriberSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgEmailCount: { $avg: '$emailCount' }
            }
        }
    ]);
    
    const totalSubscribers = await this.countDocuments();
    const activeSubscribers = await this.countDocuments({ status: 'active' });
    const pendingSubscribers = await this.countDocuments({ status: 'pending' });
    const unsubscribedSubscribers = await this.countDocuments({ status: 'unsubscribed' });
    const bouncedSubscribers = await this.countDocuments({ status: 'bounced' });
    
    return {
        total: totalSubscribers,
        active: activeSubscribers,
        pending: pendingSubscribers,
        unsubscribed: unsubscribedSubscribers,
        bounced: bouncedSubscribers,
        breakdown: stats
    };
};

module.exports = mongoose.model('Subscriber', subscriberSchema); 