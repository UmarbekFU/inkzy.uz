const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');

const essaySchema = new mongoose.Schema({
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
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  readingTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
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
      vote: {
        type: String,
        enum: ['up', 'down']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  featured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  meta: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Add text search index
essaySchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text' 
});

// Pre-save middleware
essaySchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = slugify(this.title, { 
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  // Calculate reading time
  if (this.content) {
    const wordsPerMinute = 200;
    const words = this.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    this.readingTime = Math.ceil(words / wordsPerMinute);
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, '').trim();
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  
  next();
});

// Virtual for vote ratio
essaySchema.virtual('voteRatio').get(function() {
  const total = this.votes.upvotes + this.votes.downvotes;
  return total > 0 ? (this.votes.upvotes / total) * 100 : 0;
});

// Virtual for formatted content
essaySchema.virtual('formattedContent').get(function() {
  if (!this.content) return '';
  return marked(this.content, {
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
      const hljs = require('highlight.js');
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {}
      }
      return hljs.highlightAuto(code).value;
    }
  });
});

// Instance methods
essaySchema.methods.vote = function(ip, voteType) {
  const existingVote = this.votes.voters.find(v => v.ip === ip);
  
  if (existingVote) {
    // Remove existing vote
    if (existingVote.vote === 'up') {
      this.votes.upvotes--;
    } else {
      this.votes.downvotes--;
    }
    
    // Update vote
    existingVote.vote = voteType;
    existingVote.votedAt = new Date();
  } else {
    // Add new vote
    this.votes.voters.push({
      ip,
      vote: voteType,
      votedAt: new Date()
    });
  }
  
  // Update vote counts
  this.votes.upvotes = this.votes.voters.filter(v => v.vote === 'up').length;
  this.votes.downvotes = this.votes.voters.filter(v => v.vote === 'down').length;
  
  return this.save();
};

essaySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static methods
essaySchema.statics.findPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'votes.upvotes': -1, views: -1 })
    .limit(limit);
};

essaySchema.statics.findByTag = function(tag) {
  return this.find({ 
    tags: { $in: [tag] },
    status: 'published'
  }).sort('-publishDate');
};

essaySchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  }).sort({ score: { $meta: 'textScore' } });
};

// Ensure virtuals are included in JSON
essaySchema.set('toJSON', { virtuals: true });
essaySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Essay', essaySchema); 