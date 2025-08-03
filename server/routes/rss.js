const express = require('express');
const router = express.Router();
const RSS = require('rss');
const Essay = require('../models/Essay');
const Project = require('../models/Project');
const Book = require('../models/Book');

// Generate RSS feed for essays
router.get('/essays', async (req, res) => {
    try {
        const essays = await Essay.find({ published: true })
            .sort({ publishedAt: -1 })
            .limit(20)
            .select('title slug excerpt content publishedAt tags');

        const feed = new RSS({
            title: 'Umarbek - Essays',
            description: 'Essays about design, technology, philosophy, and life',
            feed_url: `${req.protocol}://${req.get('host')}/api/rss/essays`,
            site_url: `${req.protocol}://${req.get('host')}`,
            image_url: `${req.protocol}://${req.get('host')}/images/avatar.jpg`,
            managingEditor: 'Umarbek',
            webMaster: 'Umarbek',
            copyright: `${new Date().getFullYear()} Umarbek`,
            language: 'en',
            pubDate: new Date().toUTCString(),
            ttl: '60'
        });

        essays.forEach(essay => {
            feed.item({
                title: essay.title,
                description: essay.excerpt || essay.content.substring(0, 300) + '...',
                url: `${req.protocol}://${req.get('host')}/essays/${essay.slug}`,
                guid: essay.slug,
                categories: essay.tags,
                author: 'Umarbek',
                date: essay.publishedAt,
                enclosure: {
                    url: `${req.protocol}://${req.get('host')}/images/essay-cover.jpg`,
                    type: 'image/jpeg'
                }
            });
        });

        res.set('Content-Type', 'application/rss+xml');
        res.send(feed.xml({ indent: true }));

    } catch (error) {
        console.error('RSS generation error:', error);
        res.status(500).send('RSS feed generation failed');
    }
});

// Generate RSS feed for all content
router.get('/all', async (req, res) => {
    try {
        const [essays, projects, books] = await Promise.all([
            Essay.find({ published: true }).sort({ publishedAt: -1 }).limit(10),
            Project.find({ published: true }).sort({ publishedAt: -1 }).limit(10),
            Book.find({ published: true }).sort({ readingDate: -1 }).limit(10)
        ]);

        const feed = new RSS({
            title: 'Umarbek - All Content',
            description: 'Essays, projects, and book notes from Umarbek',
            feed_url: `${req.protocol}://${req.get('host')}/api/rss/all`,
            site_url: `${req.protocol}://${req.get('host')}`,
            image_url: `${req.protocol}://${req.get('host')}/images/avatar.jpg`,
            managingEditor: 'Umarbek',
            webMaster: 'Umarbek',
            copyright: `${new Date().getFullYear()} Umarbek`,
            language: 'en',
            pubDate: new Date().toUTCString(),
            ttl: '60'
        });

        // Add essays
        essays.forEach(essay => {
            feed.item({
                title: `[Essay] ${essay.title}`,
                description: essay.excerpt || essay.content.substring(0, 300) + '...',
                url: `${req.protocol}://${req.get('host')}/essays/${essay.slug}`,
                guid: `essay-${essay.slug}`,
                categories: essay.tags,
                author: 'Umarbek',
                date: essay.publishedAt
            });
        });

        // Add projects
        projects.forEach(project => {
            feed.item({
                title: `[Project] ${project.title}`,
                description: project.description,
                url: `${req.protocol}://${req.get('host')}/projects/${project.slug}`,
                guid: `project-${project.slug}`,
                categories: project.technologies,
                author: 'Umarbek',
                date: project.publishedAt
            });
        });

        // Add book notes
        books.forEach(book => {
            feed.item({
                title: `[Book] ${book.title} by ${book.author}`,
                description: book.summary,
                url: `${req.protocol}://${req.get('host')}/books/${book.slug}`,
                guid: `book-${book.slug}`,
                categories: book.tags,
                author: 'Umarbek',
                date: book.readingDate
            });
        });

        res.set('Content-Type', 'application/rss+xml');
        res.send(feed.xml({ indent: true }));

    } catch (error) {
        console.error('RSS generation error:', error);
        res.status(500).send('RSS feed generation failed');
    }
});

// Generate sitemap
router.get('/sitemap', async (req, res) => {
    try {
        const [essays, projects, books] = await Promise.all([
            Essay.find({ published: true }).select('slug updatedAt'),
            Project.find({ published: true }).select('slug updatedAt'),
            Book.find({ published: true }).select('slug updatedAt')
        ]);

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${req.protocol}://${req.get('host')}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/essays</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/projects</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/books</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/now</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
    ${essays.map(essay => `
    <url>
        <loc>${req.protocol}://${req.get('host')}/essays/${essay.slug}</loc>
        <lastmod>${essay.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}
    ${projects.map(project => `
    <url>
        <loc>${req.protocol}://${req.get('host')}/projects/${project.slug}</loc>
        <lastmod>${project.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`).join('')}
    ${books.map(book => `
    <url>
        <loc>${req.protocol}://${req.get('host')}/books/${book.slug}</loc>
        <lastmod>${book.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>`).join('')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.send(sitemap);

    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Sitemap generation failed');
    }
});

module.exports = router; 