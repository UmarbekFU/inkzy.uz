const express = require('express');
const router = express.Router();
const Essay = require('../models/Essay');
const auth = require('../middleware/auth');
const slugify = require('slugify');

// Get all published essays
router.get('/', async (req, res) => {
    try {
        const essays = await Essay.find({ status: 'published' })
            .select('title excerpt publishDate readingTime tags slug')
            .sort('-publishDate');
        res.json(essays);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all essays (including drafts) for admin
router.get('/all', auth, async (req, res) => {
    try {
        const essays = await Essay.find()
            .select('title excerpt publishDate readingTime tags status slug')
            .sort('-publishDate');
        res.json(essays);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single essay by slug
router.get('/:slug', async (req, res) => {
    try {
        const essay = await Essay.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });
        
        if (!essay) {
            return res.status(404).json({ error: 'Essay not found' });
        }

        // Increment view count
        await essay.incrementViews();

        res.json(essay);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Render essay detail page
router.get('/:slug/view', async (req, res) => {
    try {
        const essay = await Essay.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });
        
        if (!essay) {
            return res.status(404).render('404');
        }

        // Increment view count
        await essay.incrementViews();

        res.render('essay-detail', { essay });
    } catch (err) {
        res.status(500).render('404');
    }
});

// Protected routes below
router.use(auth);

// Create new essay
router.post('/', async (req, res) => {
    try {
        const { title, content, excerpt, tags, status } = req.body;
        
        // Validate required fields
        if (!title || !content || !excerpt) {
            return res.status(400).json({ 
                error: 'Title, content, and excerpt are required' 
            });
        }
        
        // Create slug from title
        const slug = slugify(title, { 
            lower: true,
            strict: true
        });
        
        // Calculate reading time
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / wordsPerMinute);

        // Create new essay
        const essay = new Essay({
            title,
            slug,
            content,
            excerpt,
            tags: tags || [],
            status: status || 'draft',
            readingTime
        });

        await essay.save();
        res.status(201).json(essay);
    } catch (err) {
        // Handle duplicate slug error
        if (err.code === 11000) {
            return res.status(400).json({ 
                error: 'An essay with this title already exists' 
            });
        }
        res.status(400).json({ error: err.message });
    }
});

// Update essay
router.put('/:id', async (req, res) => {
    try {
        const { title, content, excerpt, tags, status } = req.body;
        
        // If title is being updated, create new slug
        let update = { ...req.body };
        if (title) {
            update.slug = slugify(title, { lower: true, strict: true });
        }
        
        // If content is being updated, recalculate reading time
        if (content) {
            const wordsPerMinute = 200;
            const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
            update.readingTime = Math.ceil(words / wordsPerMinute);
        }

        const essay = await Essay.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );

        if (!essay) {
            return res.status(404).json({ error: 'Essay not found' });
        }

        res.json(essay);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete essay
router.delete('/:id', async (req, res) => {
    try {
        const essay = await Essay.findByIdAndDelete(req.params.id);
        
        if (!essay) {
            return res.status(404).json({ error: 'Essay not found' });
        }

        res.json({ message: 'Essay deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 