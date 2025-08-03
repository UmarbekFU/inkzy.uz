const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const sanitizer = require('../utils/sanitizer');

// GET /api/gallery - Get all active gallery items
router.get('/', async (req, res) => {
    try {
        const { tag, limit = 50 } = req.query;
        
        let query = { isActive: true };
        if (tag) {
            query.tags = { $in: [tag] };
        }
        
        const galleryItems = await Gallery.find(query)
            .sort({ order: 1, createdAt: -1 })
            .limit(parseInt(limit));
            
        res.json({
            success: true,
            data: galleryItems,
            count: galleryItems.length
        });
    } catch (error) {
        console.error('Gallery fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery items'
        });
    }
});

// GET /api/gallery/:id - Get specific gallery item
router.get('/:id', async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }
        
        res.json({
            success: true,
            data: galleryItem
        });
    } catch (error) {
        console.error('Gallery item fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery item'
        });
    }
});

// POST /api/gallery - Create new gallery item (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            description,
            mediaUrl,
            mediaType,
            thumbnailUrl,
            tags,
            position,
            size,
            fallSpeed,
            rotation,
            order
        } = req.body;

        // Validate required fields
        if (!title || !mediaUrl || !mediaType) {
            return res.status(400).json({
                success: false,
                message: 'Title, media URL, and media type are required'
            });
        }

        // Validate media type
        if (!['image', 'video'].includes(mediaType)) {
            return res.status(400).json({
                success: false,
                message: 'Media type must be either "image" or "video"'
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            title: sanitizer.sanitizeText(title),
            description: description ? sanitizer.sanitizeText(description) : '',
            mediaUrl: sanitizer.sanitizeUrl(mediaUrl),
            mediaType,
            thumbnailUrl: thumbnailUrl ? sanitizer.sanitizeUrl(thumbnailUrl) : '',
            tags: tags ? tags.map(tag => sanitizer.sanitizeText(tag)).filter(Boolean) : [],
            position: position || { x: Math.random() * 100, y: Math.random() * 100 },
            size: size || { width: 200 + Math.random() * 300, height: 200 + Math.random() * 300 },
            fallSpeed: fallSpeed || 0.5 + Math.random() * 2,
            rotation: rotation || Math.random() * 360,
            order: order || 0
        };

        const galleryItem = new Gallery(sanitizedData);
        await galleryItem.save();

        res.status(201).json({
            success: true,
            data: galleryItem,
            message: 'Gallery item created successfully'
        });
    } catch (error) {
        console.error('Gallery creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create gallery item'
        });
    }
});

// PUT /api/gallery/:id - Update gallery item (Admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            title,
            description,
            mediaUrl,
            mediaType,
            thumbnailUrl,
            tags,
            position,
            size,
            fallSpeed,
            rotation,
            order,
            isActive
        } = req.body;

        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        // Sanitize inputs
        const updateData = {};
        if (title !== undefined) updateData.title = sanitizer.sanitizeText(title);
        if (description !== undefined) updateData.description = sanitizer.sanitizeText(description);
        if (mediaUrl !== undefined) updateData.mediaUrl = sanitizer.sanitizeUrl(mediaUrl);
        if (mediaType !== undefined) updateData.mediaType = mediaType;
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = sanitizer.sanitizeUrl(thumbnailUrl);
        if (tags !== undefined) updateData.tags = tags.map(tag => sanitizer.sanitizeText(tag)).filter(Boolean);
        if (position !== undefined) updateData.position = position;
        if (size !== undefined) updateData.size = size;
        if (fallSpeed !== undefined) updateData.fallSpeed = fallSpeed;
        if (rotation !== undefined) updateData.rotation = rotation;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedItem = await Gallery.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedItem,
            message: 'Gallery item updated successfully'
        });
    } catch (error) {
        console.error('Gallery update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update gallery item'
        });
    }
});

// DELETE /api/gallery/:id - Delete gallery item (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        await Gallery.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Gallery item deleted successfully'
        });
    } catch (error) {
        console.error('Gallery deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete gallery item'
        });
    }
});

// POST /api/gallery/:id/randomize - Randomize item position (Admin only)
router.post('/:id/randomize', auth, async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        galleryItem.getRandomPosition();
        await galleryItem.save();

        res.json({
            success: true,
            data: galleryItem,
            message: 'Gallery item position randomized'
        });
    } catch (error) {
        console.error('Gallery randomization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to randomize gallery item'
        });
    }
});

// GET /api/gallery/tags - Get all unique tags
router.get('/tags/all', async (req, res) => {
    try {
        const tags = await Gallery.distinct('tags', { isActive: true });
        res.json({
            success: true,
            data: tags
        });
    } catch (error) {
        console.error('Tags fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tags'
        });
    }
});

module.exports = router; 