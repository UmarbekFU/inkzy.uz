const mongoose = require('mongoose');
const { connectDatabase } = require('../server/config/database');

// Import models
const Essay = require('../server/models/Essay');
const Comment = require('../server/models/Comment');
const Subscriber = require('../server/models/Subscriber');
const Project = require('../server/models/Project');
const Book = require('../server/models/Book');

// Connect to database
async function connectDB() {
    try {
        const dbType = await connectDatabase();
        console.log(`✅ Connected to ${dbType} database`);
        return dbType;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 For development, you can:');
        console.log('   1. Install MongoDB locally: brew install mongodb-community');
        console.log('   2. Start MongoDB: brew services start mongodb-community');
        console.log('   3. Or use a cloud MongoDB service (MongoDB Atlas)');
        console.log('   4. Update MONGODB_URI in your .env file');
        console.log('');
        console.log('🔄 Proceeding with in-memory setup for development...');
        return 'memory';
    }
}

// Create indexes (only if MongoDB is available)
async function createIndexes() {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('📊 Skipping index creation (MongoDB not available)');
            return;
        }
        
        console.log('📊 Creating database indexes...');
        
        // Essay indexes
        await Essay.collection.createIndex({ slug: 1 }, { unique: true });
        await Essay.collection.createIndex({ publishedAt: -1 });
        await Essay.collection.createIndex({ category: 1 });
        await Essay.collection.createIndex({ tags: 1 });
        await Essay.collection.createIndex({ featured: 1 });
        
        // Comment indexes
        await Comment.collection.createIndex({ essayId: 1 });
        await Comment.collection.createIndex({ parentId: 1 });
        await Comment.collection.createIndex({ approved: 1 });
        await Comment.collection.createIndex({ createdAt: -1 });
        
        // Subscriber indexes
        await Subscriber.collection.createIndex({ email: 1 }, { unique: true });
        await Subscriber.collection.createIndex({ status: 1 });
        await Subscriber.collection.createIndex({ confirmationToken: 1 });
        await Subscriber.collection.createIndex({ unsubscribeToken: 1 });
        
        // Project indexes
        await Project.collection.createIndex({ slug: 1 }, { unique: true });
        await Project.collection.createIndex({ category: 1 });
        await Project.collection.createIndex({ status: 1 });
        await Project.collection.createIndex({ featured: 1 });
        
        // Book indexes
        await Book.collection.createIndex({ slug: 1 }, { unique: true });
        await Book.collection.createIndex({ category: 1 });
        await Book.collection.createIndex({ rating: -1 });
        await Book.collection.createIndex({ readDate: -1 });
        
        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.error('❌ Error creating indexes:', error.message);
        console.log('📝 Continuing without indexes...');
    }
}

// Seed sample data (only if MongoDB is available)
async function seedSampleData() {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('🌱 Skipping sample data seeding (MongoDB not available)');
            return;
        }
        
        console.log('🌱 Seeding sample data...');
        
        // Check if data already exists
        const essayCount = await Essay.countDocuments();
        if (essayCount > 0) {
            console.log('📝 Sample data already exists, skipping...');
            return;
        }
        
        // Sample essays
        const sampleEssays = [
            {
                title: 'The Art of Minimalist Design',
                slug: 'art-of-minimalist-design',
                excerpt: 'Exploring the principles of minimalist design and how they create more impactful user experiences.',
                content: `# The Art of Minimalist Design

Minimalist design is not about removing everything until nothing is left. It's about removing everything until only the essential remains.

## Core Principles

1. **Less is More**: Every element should serve a purpose
2. **White Space**: Use breathing room to create hierarchy
3. **Typography**: Choose fonts that enhance readability
4. **Color**: Use color intentionally and sparingly

## Why Minimalism Works

Minimalist design reduces cognitive load, making it easier for users to focus on what matters most. When you remove unnecessary elements, you create space for the important ones to shine.

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry

## Implementation Tips

- Start with a clear hierarchy
- Use consistent spacing
- Limit your color palette
- Test with real users

The goal is not to create something that looks minimal, but something that feels effortless to use.`,
                category: 'design',
                tags: ['design', 'minimalism', 'ux', 'ui'],
                featured: true,
                allowComments: true,
                publishedAt: new Date('2023-12-01'),
                readingTime: 5,
                votes: { upvotes: 42, downvotes: 2, voters: [] }
            },
            {
                title: 'Building for the Long Term',
                slug: 'building-for-the-long-term',
                excerpt: 'How to create digital products that stand the test of time and remain relevant for decades.',
                content: `# Building for the Long Term

In a world obsessed with rapid iteration and quick wins, building for the long term is a radical act.

## The Problem with Short-term Thinking

Most digital products are built with immediate metrics in mind:
- User acquisition
- Engagement rates
- Conversion optimization

But what happens when these metrics become the goal instead of the means?

## Principles of Long-term Design

### 1. Durability Over Novelty
Choose proven technologies over trendy ones. Your users don't care about your tech stack; they care about reliability.

### 2. Accessibility First
Build for everyone, not just the majority. Accessible design is better design.

### 3. Progressive Enhancement
Start with a solid foundation that works everywhere, then enhance for capable browsers.

### 4. Content Over Features
Focus on what you're saying, not how you're saying it.

## The Long-term Mindset

Building for the long term means:
- Prioritizing content over presentation
- Choosing simplicity over complexity
- Focusing on users over metrics
- Planning for decades, not quarters

> "The best time to plant a tree was 20 years ago. The second best time is now."

Your digital products should be like well-planted trees - they grow stronger and more valuable over time.`,
                category: 'philosophy',
                tags: ['philosophy', 'long-term', 'design', 'sustainability'],
                featured: true,
                allowComments: true,
                publishedAt: new Date('2023-11-15'),
                readingTime: 7,
                votes: { upvotes: 38, downvotes: 1, voters: [] }
            },
            {
                title: 'The Power of Antifragile Thinking',
                slug: 'power-of-antifragile-thinking',
                excerpt: 'How embracing volatility and uncertainty can make you stronger, not weaker.',
                content: `# The Power of Antifragile Thinking

Antifragile systems don't just survive chaos; they thrive on it.

## What is Antifragility?

Antifragility is the property of systems that gain from disorder. Unlike fragile systems that break under stress, or robust systems that resist it, antifragile systems actually improve when exposed to volatility.

## Examples in Nature

- **Bones**: They get stronger when stressed
- **Immune System**: Exposure to germs makes it more robust
- **Forests**: Controlled fires prevent larger disasters

## Applying Antifragile Thinking

### 1. Embrace Small Failures
Don't avoid mistakes; make them small and learn from them.

### 2. Build Redundancy
Have backup systems, not just efficient ones.

### 3. Stress Test Regularly
Expose your systems to controlled stress to make them stronger.

### 4. Learn from Volatility
Use uncertainty as a teacher, not an enemy.

## In Software Development

- Write code that fails gracefully
- Build systems that can handle unexpected load
- Design interfaces that work even when things go wrong
- Create processes that improve with feedback

## The Antifragile Mindset

Instead of trying to predict and control everything, build systems that benefit from the unpredictable.

> "The antifragile loves randomness and uncertainty, which also means—crucially—a love of errors, a certain class of errors."

This isn't about being reckless; it's about being resilient in the face of reality.`,
                category: 'philosophy',
                tags: ['philosophy', 'antifragile', 'resilience', 'uncertainty'],
                featured: false,
                allowComments: true,
                publishedAt: new Date('2023-10-20'),
                readingTime: 6,
                votes: { upvotes: 31, downvotes: 3, voters: [] }
            }
        ];

        // Sample projects
        const sampleProjects = [
            {
                title: 'Personal Website',
                slug: 'personal-website',
                description: 'A minimalist personal website built with Node.js, Express, and vanilla JavaScript. Features server-side rendering, progressive enhancement, and accessibility-first design.',
                category: 'web',
                status: 'completed',
                featured: true,
                technologies: ['Node.js', 'Express', 'JavaScript', 'CSS', 'HTML'],
                url: 'https://um.ar',
                githubUrl: 'https://github.com/UmarbekFU/personal-website',
                startDate: new Date('2023-01-01'),
                endDate: new Date('2023-12-01'),
                isOngoing: false,
                metrics: {
                    stars: 15,
                    forks: 3
                }
            },
            {
                title: 'Econify',
                slug: 'econify',
                description: 'A platform for learning economics through interactive simulations and real-world examples.',
                category: 'web',
                status: 'ongoing',
                featured: true,
                technologies: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
                startDate: new Date('2023-06-01'),
                isOngoing: true
            }
        ];

        // Sample books
        const sampleBooks = [
            {
                title: 'Antifragile',
                author: 'Nassim Nicholas Taleb',
                slug: 'antifragile',
                summary: 'A groundbreaking book about how to benefit from disorder and uncertainty.',
                category: 'philosophy',
                rating: 5,
                pages: 544,
                readDate: new Date('2023-08-15'),
                keyInsights: [
                    'Systems that gain from disorder are antifragile',
                    'Small failures prevent large catastrophes',
                    'Volatility can be beneficial when properly managed'
                ],
                quotes: [
                    'The antifragile loves randomness and uncertainty'
                ]
            },
            {
                title: 'The Design of Everyday Things',
                author: 'Don Norman',
                slug: 'design-of-everyday-things',
                summary: 'The ultimate guide to human-centered design principles.',
                category: 'design',
                rating: 5,
                pages: 368,
                readDate: new Date('2023-05-20'),
                keyInsights: [
                    'Good design is invisible',
                    'Affordances guide user behavior',
                    'Error prevention is better than error correction'
                ],
                quotes: [
                    'Design is really an act of communication'
                ]
            }
        ];

        // Insert sample data
        await Essay.insertMany(sampleEssays);
        await Project.insertMany(sampleProjects);
        await Book.insertMany(sampleBooks);

        console.log('✅ Sample data seeded successfully');
        console.log(`   - ${sampleEssays.length} essays created`);
        console.log(`   - ${sampleProjects.length} projects created`);
        console.log(`   - ${sampleBooks.length} books created`);
        
    } catch (error) {
        console.error('❌ Error seeding sample data:', error.message);
        console.log('📝 Continuing without sample data...');
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting database migration...');
        
        // Connect to database
        const dbType = await connectDB();
        
        // Create indexes
        await createIndexes();
        
        // Seed sample data
        await seedSampleData();
        
        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('🎉 Your website is ready to run!');
        console.log('   Run "npm run dev" to start the development server');
        console.log('   Visit http://localhost:3000 to see your website');
        
        if (dbType === 'memory') {
            console.log('');
            console.log('⚠️  Note: Running in memory mode');
            console.log('   To use a real database, install MongoDB and update your .env file');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        // Disconnect from database
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

// Run migration
if (require.main === module) {
    main();
} 
