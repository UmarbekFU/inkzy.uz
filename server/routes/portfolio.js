const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Portfolio data file path
const PORTFOLIO_DATA_FILE = path.join(__dirname, '../data/portfolio.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    const dataDir = path.dirname(PORTFOLIO_DATA_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
};

// Load portfolio data
const loadPortfolioData = async () => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(PORTFOLIO_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default data if file doesn't exist
        return {
            password: 'portfolio2024',
            portfolioData: [
                {
                    id: 1,
                    title: "Book Notes",
                    description: "A personal knowledge base containing detailed notes and insights from books I've read. Features searchable content, categorization, and a clean reading interface.",
                    image: "📚",
                    tech: ["HTML", "CSS", "JavaScript", "Markdown"],
                    link: "book-notes.html",
                    status: "completed"
                },
                {
                    id: 2,
                    title: "Personal Website",
                    description: "A minimalist, Apple-inspired personal website showcasing essays, projects, and thoughts. Features responsive design, dark mode, and smooth animations.",
                    image: "🌐",
                    tech: ["HTML", "CSS", "JavaScript", "Node.js"],
                    link: "home/index.html",
                    status: "completed"
                },
                {
                    id: 3,
                    title: "Design System",
                    description: "A comprehensive design system with reusable components, design tokens, and documentation. Built for consistency and scalability across projects.",
                    image: "🎨",
                    tech: ["Figma", "Storybook", "React", "TypeScript"],
                    link: "#",
                    status: "in-progress"
                },
                {
                    id: 4,
                    title: "Minimalist Task Manager",
                    description: "A clean, distraction-free task management application focused on simplicity and efficiency. Features drag-and-drop, categories, and progress tracking.",
                    image: "📝",
                    tech: ["React", "TypeScript", "Firebase", "Tailwind CSS"],
                    link: "#",
                    status: "in-progress"
                },
                {
                    id: 5,
                    title: "Essays Collection",
                    description: "A curated collection of essays and thoughts on various topics. Features clean typography, reading progress, and a distraction-free reading experience.",
                    image: "✍️",
                    tech: ["HTML", "CSS", "JavaScript", "Node.js"],
                    link: "essays.html",
                    status: "completed"
                },
                {
                    id: 4,
                    title: "Services Platform",
                    description: "A comprehensive services showcase with detailed offerings, pricing, and contact information. Built with modern web technologies.",
                    image: "🛠️",
                    tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
                    link: "services.html",
                    status: "completed"
                },
                {
                    id: 5,
                    title: "Photo Gallery",
                    description: "An elegant photo gallery showcasing visual work and photography. Features lightbox viewing, categories, and smooth transitions.",
                    image: "📸",
                    tech: ["HTML", "CSS", "JavaScript", "Image Optimization"],
                    link: "gallery.html",
                    status: "completed"
                },
                {
                    id: 6,
                    title: "Projects Showcase",
                    description: "A detailed showcase of various projects and case studies. Features project descriptions, technologies used, and live demos.",
                    image: "🚀",
                    tech: ["HTML", "CSS", "JavaScript", "Interactive Design"],
                    link: "projects.html",
                    status: "completed"
                },
                {
                    id: 7,
                    title: "About Page",
                    description: "A personal about page with background information, skills, and professional experience. Clean and professional design.",
                    image: "👤",
                    tech: ["HTML", "CSS", "JavaScript", "Personal Branding"],
                    link: "about.html",
                    status: "completed"
                },
                {
                    id: 8,
                    title: "Lists Collection",
                    description: "A curated collection of lists, favorite things, and personal recommendations. Features clean organization and easy navigation.",
                    image: "📋",
                    tech: ["HTML", "CSS", "JavaScript", "Content Curation"],
                    link: "lists.html",
                    status: "completed"
                }
            ]
        };
    }
};

// Save portfolio data
const savePortfolioData = async (data) => {
    try {
        await ensureDataDir();
        await fs.writeFile(PORTFOLIO_DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving portfolio data:', error);
        return false;
    }
};

// Get portfolio data (public endpoint)
router.get('/data', async (req, res) => {
    try {
        const data = await loadPortfolioData();
        res.json({
            success: true,
            data: {
                portfolioData: data.portfolioData
            }
        });
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading portfolio data'
        });
    }
});

// Verify portfolio password
router.post('/verify', async (req, res) => {
    try {
        const { password } = req.body;
        const data = await loadPortfolioData();
        
        if (password === data.password) {
            res.json({
                success: true,
                message: 'Password verified successfully'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying password'
        });
    }
});

// Admin endpoints (require authentication)
const requireAuth = (req, res, next) => {
    // In a real implementation, you would check for admin authentication
    // For now, we'll use a simple check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};

// Get all portfolio data (admin)
router.get('/admin/data', requireAuth, async (req, res) => {
    try {
        const data = await loadPortfolioData();
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading portfolio data'
        });
    }
});

// Update portfolio password (admin)
router.put('/admin/password', requireAuth, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password || password.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 3 characters long'
            });
        }
        
        const data = await loadPortfolioData();
        data.password = password.trim();
        
        const saved = await savePortfolioData(data);
        
        if (saved) {
            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error saving password'
            });
        }
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password'
        });
    }
});

// Update portfolio data (admin)
router.put('/admin/data', requireAuth, async (req, res) => {
    try {
        const { portfolioData } = req.body;
        
        if (!Array.isArray(portfolioData)) {
            return res.status(400).json({
                success: false,
                message: 'Portfolio data must be an array'
            });
        }
        
        const data = await loadPortfolioData();
        data.portfolioData = portfolioData;
        
        const saved = await savePortfolioData(data);
        
        if (saved) {
            res.json({
                success: true,
                message: 'Portfolio data updated successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error saving portfolio data'
            });
        }
    } catch (error) {
        console.error('Error updating portfolio data:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating portfolio data'
        });
    }
});

// Add new portfolio item (admin)
router.post('/admin/items', requireAuth, async (req, res) => {
    try {
        const { title, description, image, tech, link, status } = req.body;
        
        if (!title || !description || !image) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and image are required'
            });
        }
        
        const data = await loadPortfolioData();
        const newItem = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            image: image.trim(),
            tech: Array.isArray(tech) ? tech : tech.split(',').map(t => t.trim()),
            link: link ? link.trim() : '#',
            status: status || 'in-progress'
        };
        
        data.portfolioData.push(newItem);
        
        const saved = await savePortfolioData(data);
        
        if (saved) {
            res.json({
                success: true,
                message: 'Portfolio item added successfully',
                data: newItem
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error saving portfolio item'
            });
        }
    } catch (error) {
        console.error('Error adding portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding portfolio item'
        });
    }
});

// Update portfolio item (admin)
router.put('/admin/items/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image, tech, link, status } = req.body;
        
        const data = await loadPortfolioData();
        const itemIndex = data.portfolioData.findIndex(item => item.id === parseInt(id));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio item not found'
            });
        }
        
        data.portfolioData[itemIndex] = {
            ...data.portfolioData[itemIndex],
            title: title ? title.trim() : data.portfolioData[itemIndex].title,
            description: description ? description.trim() : data.portfolioData[itemIndex].description,
            image: image ? image.trim() : data.portfolioData[itemIndex].image,
            tech: tech ? (Array.isArray(tech) ? tech : tech.split(',').map(t => t.trim())) : data.portfolioData[itemIndex].tech,
            link: link ? link.trim() : data.portfolioData[itemIndex].link,
            status: status || data.portfolioData[itemIndex].status
        };
        
        const saved = await savePortfolioData(data);
        
        if (saved) {
            res.json({
                success: true,
                message: 'Portfolio item updated successfully',
                data: data.portfolioData[itemIndex]
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error saving portfolio item'
            });
        }
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating portfolio item'
        });
    }
});

// Delete portfolio item (admin)
router.delete('/admin/items/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const data = await loadPortfolioData();
        const itemIndex = data.portfolioData.findIndex(item => item.id === parseInt(id));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio item not found'
            });
        }
        
        data.portfolioData.splice(itemIndex, 1);
        
        const saved = await savePortfolioData(data);
        
        if (saved) {
            res.json({
                success: true,
                message: 'Portfolio item deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting portfolio item'
            });
        }
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting portfolio item'
        });
    }
});

module.exports = router; 