const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const essaysRoutes = require('./routes/essays');
const commentsRoutes = require('./routes/comments');
const votesRoutes = require('./routes/votes');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const searchRoutes = require('./routes/search');
const rssRoutes = require('./routes/rss');
const galleryRoutes = require('./routes/gallery');
const portfolioRoutes = require('./routes/portfolio');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { sanitizeInput } = require('./utils/sanitizer');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://inkzy.uz'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/home', express.static(path.join(__dirname, '../home')));

// Serve static files from root for compatibility
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../')));

// Input sanitization middleware
app.use((req, res, next) => {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }
    if (req.query) {
        req.query = sanitizeInput(req.query);
    }
    next();
});

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Global variables for templates
app.use((req, res, next) => {
    res.locals.currentPage = req.path.split('/')[1] || 'home';
    res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
    res.locals.gaId = process.env.GOOGLE_ANALYTICS_ID;
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/essays', essaysRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/rss', rssRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Main page routes
app.get('/', async (req, res) => {
    try {
        res.render('index', {
            title: 'Umarbek Fazliddinovich - Personal Website',
            description: 'Minimalist designer focused on creating impactful digital experiences. Currently based in Samarkand, working remotely and contributing to various projects globally.',
            currentPage: 'home'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/essays', async (req, res, next) => {
    try {
        const Essay = require('./models/Essay');
        const essays = await Essay.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(12);
        
        res.render('essays', {
            essays,
            currentPage: 'essays',
            hasMore: essays.length === 12
        });
    } catch (error) {
        next(error);
    }
});

app.get('/essays/:slug/view', async (req, res, next) => {
    try {
        const Essay = require('./models/Essay');
        const essay = await Essay.findOne({ slug: req.params.slug, status: 'published' });
        
        if (!essay) {
            return res.status(404).render('404', {
                title: 'Essay Not Found',
                currentPage: 'essays'
            });
        }
        
        // Increment view count
        await essay.incrementViews();
        
        res.render('essay-detail', {
            essay,
            currentPage: 'essays'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/projects', async (req, res, next) => {
    try {
        const Project = require('./models/Project');
        const Book = require('./models/Book');
        
        const projects = await Project.find({ status: 'published' })
            .sort({ featured: -1, startDate: -1 });
        
        const bookNotes = await Book.find({ status: 'published' })
            .sort({ readDate: -1 })
            .limit(6);
        
        res.render('projects', {
            projects,
            bookNotes,
            currentPage: 'projects'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/now', (req, res) => {
    res.render('now', {
        title: 'Now - Umarbek Fazliddinovich',
        description: 'What I\'m currently working on and thinking about.',
        currentPage: 'now'
    });
});

app.get('/search', (req, res) => {
    res.render('search', {
        title: 'Search - Umarbek',
        description: 'Search across essays, projects, and book notes.',
        currentPage: 'search'
    });
});

app.get('/timeline', (req, res) => {
    res.render('timeline', {
        title: 'Timeline - Umarbek',
        description: 'A 3D journey through moments in time.',
        currentPage: 'timeline'
    });
});

app.get('/lists', (req, res) => {
    res.render('lists', {
        title: 'Lists - Umarbek',
        description: 'Personal collections, favorite aphorisms, and things I own.',
        currentPage: 'lists'
    });
});

app.get('/services', (req, res) => {
    res.render('services', {
        title: 'Services - Umarbek',
        description: 'Website development, writing courses, and consulting services.',
        currentPage: 'services'
    });
});

// RSS Feed
app.get('/rss.xml', async (req, res) => {
    try {
        const RSS = require('rss');
        const Essay = require('./models/Essay');
        
        const feed = new RSS({
            title: 'Umarbek Fazliddinovich',
            description: 'Essays on design, technology, and philosophy',
            feed_url: 'https://um.ar/rss.xml',
            site_url: 'https://um.ar',
            image_url: 'https://um.ar/images/og-image.jpg',
            managingEditor: 'Umarbek Fazliddinovich',
            webMaster: 'Umarbek Fazliddinovich',
            copyright: '2023 Umarbek Fazliddinovich',
            language: 'en',
            pubDate: new Date().toString(),
            ttl: '60'
        });
        
        const essays = await Essay.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(20);
        
        essays.forEach(essay => {
            feed.item({
                title: essay.title,
                description: essay.excerpt,
                url: `https://um.ar/essays/${essay.slug}`,
                guid: essay.slug,
                categories: essay.tags,
                author: 'Umarbek Fazliddinovich',
                date: essay.publishedAt
            });
        });
        
        res.set('Content-Type', 'text/xml');
        res.send(feed.xml({ indent: true }));
    } catch (error) {
        next(error);
    }
});

// Sitemap
app.get('/sitemap.xml', async (req, res) => {
    try {
        const sitemap = require('sitemap');
        const Essay = require('./models/Essay');
        const Project = require('./models/Project');
        
        const essays = await Essay.find({ status: 'published' });
        const projects = await Project.find({ status: 'published' });
        
        const urls = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/essays', changefreq: 'weekly', priority: 0.8 },
            { url: '/projects', changefreq: 'weekly', priority: 0.8 },
            { url: '/now', changefreq: 'monthly', priority: 0.6 },
            { url: '/timeline', changefreq: 'monthly', priority: 0.6 },
            { url: '/lists', changefreq: 'monthly', priority: 0.5 },
            { url: '/services', changefreq: 'monthly', priority: 0.5 }
        ];
        
        essays.forEach(essay => {
            urls.push({
                url: `/essays/${essay.slug}`,
                changefreq: 'monthly',
                priority: 0.7,
                lastmod: essay.updatedAt
            });
        });
        
        projects.forEach(project => {
            urls.push({
                url: `/projects/${project.slug}`,
                changefreq: 'monthly',
                priority: 0.6,
                lastmod: project.updatedAt
            });
        });
        
        const sm = sitemap.createSitemap({
            hostname: 'https://um.ar',
            urls
        });
        
        res.set('Content-Type', 'application/xml');
        res.send(sm.toString());
    } catch (error) {
        next(error);
    }
});

// 404 handler
app.use((req, res) => {
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            error: 'API endpoint not found',
            path: req.path 
        });
    }
    
    // For regular pages, render 404 template
    res.status(404).render('404', {
        title: 'Page Not Found',
        currentPage: '404'
    });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
async function initializeApp() {
    try {
        const dbType = await connectDatabase();
        console.log(`✅ Connected to ${dbType} database`);
        
        const port = process.env.PORT || 3000;
        const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
        
        const server = app.listen(port, host, () => {
            console.log(`🚀 Server running on http://${host}:${port}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: ${dbType}`);
        });
        
        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error.message);
        process.exit(1);
    }
}

// Initialize the application
if (require.main === module) {
    initializeApp();
}

module.exports = app; 