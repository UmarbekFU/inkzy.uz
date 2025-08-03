const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    author: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    isbn: {
        type: String,
        trim: true,
        uppercase: true
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    content: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['philosophy', 'design', 'technology', 'business', 'fiction', 'non-fiction', 'biography', 'science'],
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        index: true
    },
    readDate: {
        type: Date,
        required: true,
        index: true
    },
    pages: {
        type: Number,
        min: 1
    },
    language: {
        type: String,
        default: 'English'
    },
    format: {
        type: String,
        enum: ['physical', 'digital', 'audio'],
        default: 'physical'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    keyInsights: [{
        type: String,
        trim: true,
        maxlength: 500
    }],
    quotes: [{
        quote: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        page: Number,
        context: String
    }],
    relatedEssays: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Essay'
    }],
    relatedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    coverImage: {
        type: String,
        trim: true
    },
    goodreadsUrl: {
        type: String,
        trim: true
    },
    amazonUrl: {
        type: String,
        trim: true
    },
    meta: {
        title: String,
        description: String,
        keywords: [String]
    }
}, {
    timestamps: true
});

// Indexes
bookSchema.index({ slug: 1 }, { unique: true });
bookSchema.index({ category: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ readDate: -1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ status: 1 });

// Virtuals
bookSchema.virtual('readingTime').get(function() {
    if (!this.pages) return null;
    const avgWordsPerPage = 250;
    const totalWords = this.pages * avgWordsPerPage;
    const wordsPerMinute = 200;
    return Math.ceil(totalWords / wordsPerMinute);
});

bookSchema.virtual('ratingStars').get(function() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

bookSchema.virtual('yearRead').get(function() {
    return this.readDate.getFullYear();
});

// Instance methods
bookSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

bookSchema.methods.share = function() {
    this.shares += 1;
    return this.save();
};

bookSchema.methods.addInsight = function(insight) {
    this.keyInsights.push(insight);
    return this.save();
};

bookSchema.methods.addQuote = function(quote, page, context) {
    this.quotes.push({
        quote,
        page,
        context
    });
    return this.save();
};

// Static methods
bookSchema.statics.findByRating = function(minRating = 4) {
    return this.find({ 
        status: 'published',
        rating: { $gte: minRating } 
    })
    .sort({ rating: -1, readDate: -1 })
    .exec();
};

bookSchema.statics.findByCategory = function(category) {
    return this.find({ 
        status: 'published',
        category 
    })
    .sort({ rating: -1, readDate: -1 })
    .exec();
};

bookSchema.statics.findByYear = function(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return this.find({ 
        status: 'published',
        readDate: { $gte: startDate, $lte: endDate } 
    })
    .sort({ rating: -1, readDate: -1 })
    .exec();
};

bookSchema.statics.findByTag = function(tag) {
    return this.find({ 
        status: 'published',
        tags: tag 
    })
    .sort({ rating: -1, readDate: -1 })
    .exec();
};

bookSchema.statics.getReadingStats = async function() {
    const stats = await this.aggregate([
        { $match: { status: 'published' } },
        {
            $group: {
                _id: null,
                totalBooks: { $sum: 1 },
                totalPages: { $sum: '$pages' },
                avgRating: { $avg: '$rating' },
                avgPages: { $avg: '$pages' }
            }
        }
    ]);
    
    const categoryStats = await this.aggregate([
        { $match: { status: 'published' } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        },
        { $sort: { count: -1 } }
    ]);
    
    return {
        overall: stats[0] || {
            totalBooks: 0,
            totalPages: 0,
            avgRating: 0,
            avgPages: 0
        },
        byCategory: categoryStats
    };
};

bookSchema.statics.getYearlyStats = async function() {
    return this.aggregate([
        { $match: { status: 'published' } },
        {
            $group: {
                _id: { $year: '$readDate' },
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                totalPages: { $sum: '$pages' }
            }
        },
        { $sort: { _id: -1 } }
    ]);
};

// Pre-save middleware
bookSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Ensure progress is 100 if status is published
    if (this.status === 'published') {
        this.progress = 100;
    }
    
    next();
});

module.exports = mongoose.model('Book', bookSchema); 
