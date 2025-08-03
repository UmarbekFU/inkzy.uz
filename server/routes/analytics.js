const express = require('express');
const router = express.Router();
const Essay = require('../models/Essay');
const Comment = require('../models/Comment');
const Subscriber = require('../models/Subscriber');

// Track page view
router.post('/track', async (req, res) => {
    try {
        const { page, title, referrer } = req.body;
        const ip = req.ip;
        const userAgent = req.get('User-Agent');
        
        // Log page view (in production, you'd store this in a database)
        console.log('Page view:', {
            page,
            title,
            ip,
            userAgent: userAgent?.substring(0, 100),
            referrer,
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, message: 'Page view tracked' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to track page view' });
    }
});

// Get content performance metrics
router.get('/content/performance', async (req, res) => {
    try {
        const essays = await Essay.find({ status: 'published' })
            .select('title slug views votes publishedAt readingTime')
            .sort({ views: -1 })
            .limit(10);
        
        const totalViews = essays.reduce((sum, essay) => sum + essay.views, 0);
        const totalVotes = essays.reduce((sum, essay) => sum + essay.votes.upvotes + essay.votes.downvotes, 0);
        
        res.json({
            success: true,
            metrics: {
                totalViews,
                totalVotes,
                topEssays: essays,
                averageViews: totalViews / essays.length || 0,
                averageVotes: totalVotes / essays.length || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch content performance' });
    }
});

// Get visitor statistics
router.get('/visitors', async (req, res) => {
    try {
        // Mock visitor data (in production, you'd get this from a proper analytics service)
        const visitorData = {
            totalVisitors: 1250,
            uniqueVisitors: 890,
            returningVisitors: 360,
            averageSessionDuration: '2m 34s',
            bounceRate: '45%',
            topCountries: [
                { country: 'United States', visitors: 450 },
                { country: 'Uzbekistan', visitors: 320 },
                { country: 'United Kingdom', visitors: 180 },
                { country: 'Germany', visitors: 95 },
                { country: 'Canada', visitors: 75 }
            ],
            topReferrers: [
                { source: 'Direct', visitors: 520 },
                { source: 'Google', visitors: 380 },
                { source: 'Twitter', visitors: 150 },
                { source: 'GitHub', visitors: 120 },
                { source: 'LinkedIn', visitors: 80 }
            ]
        };
        
        res.json({ success: true, visitors: visitorData });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch visitor statistics' });
    }
});

// Get engagement metrics
router.get('/engagement', async (req, res) => {
    try {
        const [commentCount, subscriberCount, totalVotes] = await Promise.all([
            Comment.countDocuments({ approved: true }),
            Subscriber.countDocuments({ status: 'active' }),
            Essay.aggregate([
                { $group: { _id: null, totalVotes: { $sum: { $add: ['$votes.upvotes', '$votes.downvotes'] } } } }
            ])
        ]);
        
        const engagementData = {
            totalComments: commentCount,
            activeSubscribers: subscriberCount,
            totalVotes: totalVotes[0]?.totalVotes || 0,
            averageCommentsPerEssay: commentCount / 3, // Assuming 3 essays
            engagementRate: ((commentCount + subscriberCount + (totalVotes[0]?.totalVotes || 0)) / 1250 * 100).toFixed(1) + '%'
        };
        
        res.json({ success: true, engagement: engagementData });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch engagement metrics' });
    }
});

// Get content insights
router.get('/insights', async (req, res) => {
    try {
        const essays = await Essay.find({ status: 'published' });
        
        // Popular tags
        const tagCount = {};
        essays.forEach(essay => {
            essay.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        
        const popularTags = Object.entries(tagCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
        
        // Reading time distribution
        const readingTimes = essays.map(essay => essay.readingTime);
        const avgReadingTime = readingTimes.reduce((sum, time) => sum + time, 0) / readingTimes.length;
        
        // Publishing frequency
        const publishDates = essays.map(essay => essay.publishedAt);
        const daysBetweenPublishes = [];
        for (let i = 1; i < publishDates.length; i++) {
            const daysDiff = (publishDates[i] - publishDates[i-1]) / (1000 * 60 * 60 * 24);
            daysBetweenPublishes.push(daysDiff);
        }
        const avgDaysBetweenPublishes = daysBetweenPublishes.length > 0 
            ? daysBetweenPublishes.reduce((sum, days) => sum + days, 0) / daysBetweenPublishes.length 
            : 0;
        
        const insights = {
            popularTags,
            averageReadingTime: Math.round(avgReadingTime),
            averageDaysBetweenPublishes: Math.round(avgDaysBetweenPublishes),
            totalEssays: essays.length,
            mostViewedEssay: essays.sort((a, b) => b.views - a.views)[0]?.title || 'None',
            mostVotedEssay: essays.sort((a, b) => (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes))[0]?.title || 'None'
        };
        
        res.json({ success: true, insights });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch content insights' });
    }
});

// Get real-time data
router.get('/realtime', async (req, res) => {
    try {
        // Mock real-time data (in production, you'd get this from a real-time analytics service)
        const realtimeData = {
            currentVisitors: Math.floor(Math.random() * 10) + 5,
            activePages: [
                { page: '/', visitors: 3 },
                { page: '/essays', visitors: 2 },
                { page: '/projects', visitors: 1 }
            ],
            recentActivity: [
                { action: 'Page view', page: '/essays/art-of-minimalist-design', time: '2 minutes ago' },
                { action: 'Comment', page: '/essays/building-for-the-long-term', time: '5 minutes ago' },
                { action: 'Newsletter signup', email: 'user@example.com', time: '8 minutes ago' }
            ]
        };
        
        res.json({ success: true, realtime: realtimeData });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch real-time data' });
    }
});

module.exports = router; 
