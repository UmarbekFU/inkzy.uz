const express = require('express');
const router = express.Router();
const Essay = require('../models/Essay');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for votes
const voteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 votes per hour
    message: 'Too many votes from this IP, please try again later.'
});

// Vote on an essay
router.post('/:essayId', voteLimiter, [
    body('voteType').isIn(['up', 'down']).withMessage('Invalid vote type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { essayId } = req.params;
        const { voteType } = req.body;
        const ip = req.ip;

        const essay = await Essay.findById(essayId);
        if (!essay) {
            return res.status(404).json({ success: false, error: 'Essay not found' });
        }

        const result = await essay.vote(voteType, ip);
        res.json({ success: true, votes: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to record vote' });
    }
});

// Get vote statistics for an essay
router.get('/:essayId', async (req, res) => {
    try {
        const { essayId } = req.params;
        const essay = await Essay.findById(essayId);
        
        if (!essay) {
            return res.status(404).json({ success: false, error: 'Essay not found' });
        }

        res.json({ 
            success: true, 
            votes: {
                upvotes: essay.votes.upvotes,
                downvotes: essay.votes.downvotes,
                ratio: essay.voteRatio
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch vote statistics' });
    }
});

// Get popular essays
router.get('/popular/essays', async (req, res) => {
    try {
        const essays = await Essay.findPopular(10);
        res.json({ success: true, essays });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch popular essays' });
    }
});

// Get trending essays
router.get('/trending/essays', async (req, res) => {
    try {
        const essays = await Essay.find({ status: 'published' })
            .sort({ 'votes.upvotes': -1, views: -1 })
            .limit(10)
            .select('title slug excerpt votes views publishedAt');
        
        res.json({ success: true, essays });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch trending essays' });
    }
});

// Admin routes for vote management
router.get('/admin/analytics', async (req, res) => {
    try {
        const totalVotes = await Essay.aggregate([
            { $group: { _id: null, totalUpvotes: { $sum: '$votes.upvotes' }, totalDownvotes: { $sum: '$votes.downvotes' } } }
        ]);

        const mostVotedEssays = await Essay.find({ status: 'published' })
            .sort({ 'votes.upvotes': -1 })
            .limit(10)
            .select('title slug votes views');

        res.json({ 
            success: true, 
            analytics: {
                totalVotes: totalVotes[0] || { totalUpvotes: 0, totalDownvotes: 0 },
                mostVotedEssays
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch vote analytics' });
    }
});

// Reset votes for an essay (admin only)
router.delete('/admin/:essayId', async (req, res) => {
    try {
        const { essayId } = req.params;
        const essay = await Essay.findById(essayId);
        
        if (!essay) {
            return res.status(404).json({ success: false, error: 'Essay not found' });
        }

        essay.votes = { upvotes: 0, downvotes: 0, voters: [] };
        await essay.save();

        res.json({ success: true, message: 'Votes reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reset votes' });
    }
});

module.exports = router; 