const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    mediaUrl: {
        type: String,
        required: true,
        trim: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    position: {
        x: {
            type: Number,
            default: () => Math.random() * 100
        },
        y: {
            type: Number,
            default: () => Math.random() * 100
        }
    },
    size: {
        width: {
            type: Number,
            default: () => 200 + Math.random() * 300
        },
        height: {
            type: Number,
            default: () => 200 + Math.random() * 300
        }
    },
    fallSpeed: {
        type: Number,
        default: () => 0.5 + Math.random() * 2
    },
    rotation: {
        type: Number,
        default: () => Math.random() * 360
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
gallerySchema.index({ isActive: 1, order: 1 });
gallerySchema.index({ tags: 1 });
gallerySchema.index({ createdAt: -1 });

// Virtual for formatted date
gallerySchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Method to get random position
gallerySchema.methods.getRandomPosition = function() {
    this.position.x = Math.random() * 100;
    this.position.y = Math.random() * 100;
    this.rotation = Math.random() * 360;
    this.fallSpeed = 0.5 + Math.random() * 2;
    return this;
};

// Static method to get active gallery items
gallerySchema.statics.getActiveItems = function() {
    return this.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 });
};

// Static method to get items by tag
gallerySchema.statics.getByTag = function(tag) {
    return this.find({ 
        isActive: true, 
        tags: { $in: [tag] } 
    }).sort({ order: 1, createdAt: -1 });
};

module.exports = mongoose.model('Gallery', gallerySchema); 