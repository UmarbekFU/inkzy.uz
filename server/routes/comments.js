const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for comments
const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 comments per windowMs
    message: 'Too many comments from this IP, please try again later.'
});

// Get comments for an essay
router.get('/:essayId', async (req, res) => {
    try {
        const comments = await Comment.findByEssay(req.params.essayId);
        res.json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch comments' });
    }
});

// Add a new comment
router.post('/', commentLimiter, [
    body('essayId').isMongoId().withMessage('Invalid essay ID'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters'),
    body('parentId').optional().isMongoId().withMessage('Invalid parent comment ID')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { essayId, name, email, content, parentId } = req.body;

        // Basic spam detection
        const spamScore = calculateSpamScore(content, name, email);
        const isSpam = spamScore > 0.7;

        const comment = new Comment({
            essayId,
            author: name,
            email,
            content,
            parentId,
            approved: !isSpam, // Auto-approve if not spam
            spam: isSpam,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        await comment.save();

        res.json({ 
            success: true, 
            comment,
            message: isSpam ? 'Comment submitted for moderation' : 'Comment posted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to post comment' });
    }
});

// Vote on a comment
router.post('/:commentId/vote', [
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

        const { commentId } = req.params;
        const { voteType } = req.body;
        const ip = req.ip;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        const result = await comment.vote(voteType, ip);
        res.json({ success: true, votes: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to vote on comment' });
    }
});

// Admin routes for moderation
router.get('/admin/pending', async (req, res) => {
    try {
        const comments = await Comment.findPending();
        res.json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch pending comments' });
    }
});

router.get('/admin/spam', async (req, res) => {
    try {
        const comments = await Comment.findSpam();
        res.json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch spam comments' });
    }
});

router.post('/admin/:commentId/approve', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        await comment.approve();
        res.json({ success: true, message: 'Comment approved' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to approve comment' });
    }
});

router.post('/admin/:commentId/reject', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        await comment.reject();
        res.json({ success: true, message: 'Comment rejected' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reject comment' });
    }
});

router.post('/admin/:commentId/spam', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        await comment.markAsSpam();
        res.json({ success: true, message: 'Comment marked as spam' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to mark comment as spam' });
    }
});

// Helper function to calculate spam score
function calculateSpamScore(content, name, email) {
    let score = 0;
    
    // Check for common spam indicators
    const spamWords = ['buy', 'cheap', 'discount', 'free', 'money', 'earn', 'cash', 'loan', 'viagra', 'casino'];
    const contentLower = content.toLowerCase();
    
    spamWords.forEach(word => {
        if (contentLower.includes(word)) {
            score += 0.1;
        }
    });
    
    // Check for excessive links
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 2) {
        score += 0.3;
    }
    
    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3) {
        score += 0.2;
    }
    
    // Check for suspicious email patterns
    if (email.includes('temp') || email.includes('spam')) {
        score += 0.4;
    }
    
    return Math.min(score, 1.0);
}

module.exports = router; 