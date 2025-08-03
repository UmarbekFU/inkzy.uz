const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    content: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    githubUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: ['web', 'design', 'mobile', 'open-source', 'consulting'],
        index: true
    },
    technologies: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    isOngoing: {
        type: Boolean,
        default: false
    },
    metrics: {
        stars: {
            type: Number,
            default: 0
        },
        forks: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        }
    },
    github: {
        repoName: String,
        description: String,
        language: String,
        lastUpdated: Date,
        openIssues: Number,
        closedIssues: Number,
        pullRequests: Number
    },
    relatedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    meta: {
        title: String,
        description: String,
        keywords: [String]
    }
}, {
    timestamps: true
});

// Indexes
projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ tags: 1 });

// Virtuals
projectSchema.virtual('duration').get(function() {
    if (!this.startDate) return null;
    
    const end = this.endDate || new Date();
    const diffTime = Math.abs(end - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} days`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''}`;
    }
});

projectSchema.virtual('isActive').get(function() {
    return this.isOngoing || (this.endDate && this.endDate > new Date());
});

// Instance methods
projectSchema.methods.incrementViews = function() {
    this.metrics.views += 1;
    return this.save();
};

projectSchema.methods.like = function() {
    this.metrics.stars += 1;
    return this.save();
};

projectSchema.methods.share = function() {
    this.metrics.shares += 1;
    return this.save();
};

projectSchema.methods.updateGitHubData = async function(githubData) {
    this.github = {
        ...this.github,
        ...githubData
    };
    this.metrics.stars = githubData.stargazers_count || this.metrics.stars;
    this.metrics.forks = githubData.forks_count || this.metrics.forks;
    return this.save();
};

// Static methods
projectSchema.statics.findPublished = function() {
    return this.find({ status: 'published' })
        .sort({ featured: -1, startDate: -1 })
        .exec();
};

projectSchema.statics.findByCategory = function(category) {
    return this.find({ 
        status: 'published',
        category 
    })
    .sort({ featured: -1, startDate: -1 })
    .exec();
};

projectSchema.statics.findFeatured = function() {
    return this.find({ 
        status: 'published',
        featured: true 
    })
    .sort({ startDate: -1 })
    .exec();
};

projectSchema.statics.findOngoing = function() {
    return this.find({ 
        status: 'published',
        isOngoing: true 
    })
    .sort({ startDate: -1 })
    .exec();
};

projectSchema.statics.findByTechnology = function(technology) {
    return this.find({ 
        status: 'published',
        technologies: technology 
    })
    .sort({ featured: -1, startDate: -1 })
    .exec();
};

// Pre-save middleware
projectSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Set isOngoing based on endDate
    if (this.endDate) {
        this.isOngoing = this.endDate > new Date();
    }
    
    next();
});

module.exports = mongoose.model('Project', projectSchema); 