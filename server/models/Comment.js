const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    essayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Essay',
        required: true,
        index: true
    },
    author: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
        index: true
    },
    approved: {
        type: Boolean,
        default: false,
        index: true
    },
    spam: {
        type: Boolean,
        default: false,
        index: true
    },
    votes: {
        upvotes: {
            type: Number,
            default: 0
        },
        downvotes: {
            type: Number,
            default: 0
        },
        voters: [{
            ip: String,
            voteType: {
                type: String,
                enum: ['up', 'down']
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    moderatedBy: {
        type: String,
        trim: true
    },
    moderatedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
commentSchema.index({ essayId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ approved: 1 });
commentSchema.index({ spam: 1 });

// Virtual for vote ratio
commentSchema.virtual('voteRatio').get(function() {
    const total = this.votes.upvotes + this.votes.downvotes;
    if (total === 0) return 0;
    return this.votes.upvotes - this.votes.downvotes;
});

// Instance methods
commentSchema.methods.approve = function() {
    this.approved = true;
    this.spam = false;
    this.moderatedAt = new Date();
    return this.save();
};

commentSchema.methods.reject = function() {
    this.approved = false;
    this.moderatedAt = new Date();
    return this.save();
};

commentSchema.methods.markAsSpam = function() {
    this.approved = false;
    this.spam = true;
    this.moderatedAt = new Date();
    return this.save();
};

commentSchema.methods.vote = async function(voteType, ip) {
    // Check if user has already voted
    const existingVote = this.votes.voters.find(v => v.ip === ip);
    
    if (existingVote) {
        if (existingVote.voteType === voteType) {
            // Remove vote if clicking same button
            this.votes.voters = this.votes.voters.filter(v => v.ip !== ip);
            if (voteType === 'up') {
                this.votes.upvotes = Math.max(0, this.votes.upvotes - 1);
            } else {
                this.votes.downvotes = Math.max(0, this.votes.downvotes - 1);
            }
        } else {
            // Change vote
            existingVote.voteType = voteType;
            existingVote.votedAt = new Date();
            if (voteType === 'up') {
                this.votes.upvotes += 1;
                this.votes.downvotes = Math.max(0, this.votes.downvotes - 1);
            } else {
                this.votes.downvotes += 1;
                this.votes.upvotes = Math.max(0, this.votes.upvotes - 1);
            }
        }
    } else {
        // Add new vote
        this.votes.voters.push({
            ip,
            voteType,
            votedAt: new Date()
        });
        if (voteType === 'up') {
            this.votes.upvotes += 1;
        } else {
            this.votes.downvotes += 1;
        }
    }
    
    await this.save();
    return {
        upvotes: this.votes.upvotes,
        downvotes: this.votes.downvotes,
        ratio: this.voteRatio
    };
};

// Static methods
commentSchema.statics.findByEssay = function(essayId) {
    return this.find({ 
        essayId, 
        approved: true,
        spam: false 
    })
    .sort({ createdAt: 1 })
    .populate('parentId', 'author content createdAt')
    .exec();
};

commentSchema.statics.findPending = function() {
    return this.find({ 
        approved: false,
        spam: false 
    })
    .sort({ createdAt: -1 })
    .populate('essayId', 'title slug')
    .exec();
};

commentSchema.statics.findSpam = function() {
    return this.find({ spam: true })
        .sort({ createdAt: -1 })
        .populate('essayId', 'title slug')
        .exec();
};

// Pre-save middleware
commentSchema.pre('save', function(next) {
    // Sanitize content
    if (this.content) {
        this.content = this.content.trim();
    }
    
    // Sanitize author name
    if (this.author) {
        this.author = this.author.trim();
    }
    
    next();
});

module.exports = mongoose.model('Comment', commentSchema); 