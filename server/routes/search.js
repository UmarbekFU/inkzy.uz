const express = require('express');
const router = express.Router();
const Essay = require('../models/Essay');
const Project = require('../models/Project');
const Book = require('../models/Book');
const { sanitizeInput } = require('../utils/sanitizer');

// Search across all content types
router.get('/', async (req, res) => {
    try {
        const { q: query, type, tag, sort = 'relevance' } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.json({
                success: true,
                results: [],
                total: 0,
                query: query || ''
            });
        }

        const sanitizedQuery = sanitizeInput(query.trim());
        const searchRegex = new RegExp(sanitizedQuery, 'i');
        
        let results = [];
        const searchPromises = [];

        // Search essays
        if (!type || type === 'essays' || type === 'all') {
            searchPromises.push(
                Essay.find({
                    $or: [
                        { title: searchRegex },
                        { content: searchRegex },
                        { tags: { $in: [searchRegex] } }
                    ],
                    published: true
                }).select('title slug excerpt tags publishedAt views votes')
            );
        }

        // Search projects
        if (!type || type === 'projects' || type === 'all') {
            searchPromises.push(
                Project.find({
                    $or: [
                        { title: searchRegex },
                        { description: searchRegex },
                        { technologies: { $in: [searchRegex] } }
                    ],
                    published: true
                }).select('title slug description technologies publishedAt')
            );
        }

        // Search book notes
        if (!type || type === 'books' || type === 'all') {
            searchPromises.push(
                Book.find({
                    $or: [
                        { title: searchRegex },
                        { author: searchRegex },
                        { summary: searchRegex },
                        { notes: searchRegex },
                        { tags: { $in: [searchRegex] } }
                    ],
                    published: true
                }).select('title author summary tags readingDate isbn')
            );
        }

        const [essays, projects, books] = await Promise.all(searchPromises);

        // Combine and format results
        const essayResults = essays.map(essay => ({
            type: 'essay',
            id: essay._id,
            title: essay.title,
            slug: essay.slug,
            excerpt: essay.excerpt,
            tags: essay.tags,
            publishedAt: essay.publishedAt,
            views: essay.views,
            votes: essay.votes,
            url: `/essays/${essay.slug}`
        }));

        const projectResults = projects.map(project => ({
            type: 'project',
            id: project._id,
            title: project.title,
            slug: project.slug,
            description: project.description,
            technologies: project.technologies,
            publishedAt: project.publishedAt,
            url: `/projects/${project.slug}`
        }));

        const bookResults = books.map(book => ({
            type: 'book',
            id: book._id,
            title: book.title,
            author: book.author,
            summary: book.summary,
            tags: book.tags,
            readingDate: book.readingDate,
            isbn: book.isbn,
            url: `/books/${book.slug}`
        }));

        results = [...essayResults, ...projectResults, ...bookResults];

        // Apply tag filtering
        if (tag) {
            const tagRegex = new RegExp(tag, 'i');
            results = results.filter(item => 
                item.tags && item.tags.some(t => tagRegex.test(t))
            );
        }

        // Apply sorting
        switch (sort) {
            case 'date':
                results.sort((a, b) => new Date(b.publishedAt || b.readingDate) - new Date(a.publishedAt || a.readingDate));
                break;
            case 'views':
                results.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'votes':
                results.sort((a, b) => (b.votes || 0) - (a.votes || 0));
                break;
            case 'relevance':
            default:
                // Relevance scoring based on title matches, content matches, etc.
                results.sort((a, b) => {
                    const aScore = getRelevanceScore(a, sanitizedQuery);
                    const bScore = getRelevanceScore(b, sanitizedQuery);
                    return bScore - aScore;
                });
                break;
        }

        res.json({
            success: true,
            results,
            total: results.length,
            query: sanitizedQuery,
            filters: { type, tag, sort }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.json({ suggestions: [] });
        }

        const sanitizedQuery = sanitizeInput(query.trim());
        const searchRegex = new RegExp(sanitizedQuery, 'i');

        const [essayTitles, projectTitles, bookTitles] = await Promise.all([
            Essay.find({ title: searchRegex, published: true }).select('title').limit(5),
            Project.find({ title: searchRegex, published: true }).select('title').limit(5),
            Book.find({ title: searchRegex, published: true }).select('title').limit(5)
        ]);

        const suggestions = [
            ...essayTitles.map(e => ({ text: e.title, type: 'essay' })),
            ...projectTitles.map(p => ({ text: p.title, type: 'project' })),
            ...bookTitles.map(b => ({ text: b.title, type: 'book' }))
        ];

        res.json({ suggestions: suggestions.slice(0, 10) });

    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({ suggestions: [] });
    }
});

// Get popular tags
router.get('/tags', async (req, res) => {
    try {
        const [essayTags, projectTags, bookTags] = await Promise.all([
            Essay.aggregate([
                { $match: { published: true } },
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),
            Project.aggregate([
                { $match: { published: true } },
                { $unwind: '$technologies' },
                { $group: { _id: '$technologies', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),
            Book.aggregate([
                { $match: { published: true } },
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ])
        ]);

        const allTags = [...essayTags, ...projectTags, ...bookTags];
        const tagCounts = {};

        allTags.forEach(tag => {
            if (tagCounts[tag._id]) {
                tagCounts[tag._id] += tag.count;
            } else {
                tagCounts[tag._id] = tag.count;
            }
        });

        const popularTags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30);

        res.json({ tags: popularTags });

    } catch (error) {
        console.error('Tags error:', error);
        res.status(500).json({ tags: [] });
    }
});

function getRelevanceScore(item, query) {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title matches get highest score
    if (item.title && item.title.toLowerCase().includes(queryLower)) {
        score += 10;
    }
    
    // Exact title match gets bonus
    if (item.title && item.title.toLowerCase() === queryLower) {
        score += 5;
    }
    
    // Content matches
    if (item.excerpt && item.excerpt.toLowerCase().includes(queryLower)) {
        score += 3;
    }
    
    if (item.description && item.description.toLowerCase().includes(queryLower)) {
        score += 3;
    }
    
    if (item.summary && item.summary.toLowerCase().includes(queryLower)) {
        score += 3;
    }
    
    // Tag matches
    if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 2;
    }
    
    // Author matches (for books)
    if (item.author && item.author.toLowerCase().includes(queryLower)) {
        score += 2;
    }
    
    // Technology matches (for projects)
    if (item.technologies && item.technologies.some(tech => tech.toLowerCase().includes(queryLower))) {
        score += 2;
    }
    
    // Recency bonus
    if (item.publishedAt) {
        const daysSincePublished = (Date.now() - new Date(item.publishedAt)) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 30) score += 1;
        if (daysSincePublished < 7) score += 1;
    }
    
    // Popularity bonus
    if (item.views) score += Math.min(item.views / 100, 2);
    if (item.votes) score += Math.min(item.votes, 3);
    
    return score;
}

module.exports = router; 