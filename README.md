# Umarbek's Personal Website

A dynamic personal website built with Node.js/Express, featuring server-side rendering, rich interactive features, and a focus on user-centric design.

## 🚀 Features

### Core Functionality
- **Server-side rendering** for fast loading and SEO
- **Dynamic content management** with admin panel
- **Markdown support** with syntax highlighting
- **Comments system** with moderation and spam prevention
- **Voting system** for essay popularity tracking
- **Newsletter system** with double opt-in and unsubscribe
- **Contact form** with spam protection
- **Analytics and visitor tracking**
- **Search functionality** across all content
- **Tag/category filtering**

### Content Management
- **Essays section** with voting, comments, and reading progress
- **Projects showcase** with GitHub integration
- **Book notes** with detailed insights and quotes
- **Dynamic "Now" page** for current work
- **3D Timeline** with Three.js (planned)
- **Lists section** for personal collections
- **Services page** for offerings

### Technical Features
- **Security-first** with input sanitization, CSRF protection, rate limiting
- **Performance optimized** with compression, caching, and minimal JS
- **Mobile responsive** with desktop-first design
- **Accessibility focused** with semantic HTML and ARIA labels
- **SEO optimized** with proper meta tags, sitemap, and RSS feeds

## 🏗️ Architecture

### Backend
- **Node.js/Express** server with middleware architecture
- **MongoDB** for data persistence with Mongoose ODM
- **JWT authentication** for admin access
- **Email integration** with Nodemailer
- **Rate limiting** and security middleware

### Frontend
- **EJS templating** for server-side rendering
- **Vanilla JavaScript** for minimal payload
- **CSS custom properties** for theming
- **Progressive enhancement** approach
- **Three.js** for 3D timeline (planned)

### Database Models
- **Essay**: Content with voting, comments, views tracking
- **Comment**: Threaded comments with moderation
- **Subscriber**: Newsletter management with preferences
- **Project**: Portfolio items with GitHub integration
- **Book**: Reading notes with insights and quotes
- **User**: Admin authentication and permissions

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- SMTP email service (Gmail recommended)

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd umarbek-personal-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   - Database connection
   - Email settings
   - JWT secrets
   - GitHub API tokens

4. **Database setup**
   ```bash
   npm run migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables
```bash
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/umarbek_website

# Authentication
JWT_SECRET=your-super-secret-jwt-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# GitHub API
GITHUB_TOKEN=your-github-token
GITHUB_USERNAME=UmarbekFU

# Security
SESSION_SECRET=your-session-secret
CORS_ORIGIN=http://localhost:3000
```

### Database Schema
The application uses MongoDB with the following collections:
- `essays`: Blog posts with voting and comments
- `comments`: Threaded comments with moderation
- `subscribers`: Newsletter subscribers with preferences
- `projects`: Portfolio items with GitHub data
- `books`: Reading notes and insights
- `users`: Admin users and permissions

## 🎨 Design Philosophy

### User-Centric Approach
- **Clarity over complexity**: Clean, readable typography
- **Intuitive navigation**: Logical information architecture
- **Progressive disclosure**: Information revealed as needed
- **Feedback loops**: Clear responses to user actions

### Performance Goals
- **<1MB page weight** for text pages
- **Server-side rendering** for fast initial load
- **Minimal JavaScript** payload
- **Progressive enhancement** for core functionality
- **Cache headers** for static assets

### Accessibility
- **Semantic HTML5** structure
- **ARIA labels** and roles
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** compliance

## 📝 Content Management

### Admin Panel
Access at `/admin` with JWT authentication:
- **Essay management**: Create, edit, publish content
- **Comment moderation**: Approve, reject, mark as spam
- **Newsletter management**: Send emails, manage subscribers
- **Analytics dashboard**: View performance metrics
- **User management**: Admin accounts and permissions

### Content Workflow
1. **Draft creation** in admin panel
2. **Markdown editing** with preview
3. **Publishing** with SEO optimization
4. **Social sharing** and promotion
5. **Analytics tracking** and optimization

### SEO Features
- **Meta tags** optimization
- **Structured data** markup
- **Sitemap generation** (`/sitemap.xml`)
- **RSS feeds** (`/rss`)
- **Clean URLs** with slugs
- **Open Graph** tags

## 🔒 Security Features

### Input Validation
- **Sanitization** of all user inputs
- **XSS prevention** with content filtering
- **CSRF protection** on all forms
- **Rate limiting** on sensitive endpoints

### Authentication
- **JWT tokens** for admin access
- **Password hashing** with bcrypt
- **Session management** with secure cookies
- **Two-factor authentication** (planned)

### Spam Prevention
- **Honeypot fields** in forms
- **Pattern detection** for suspicious content
- **Rate limiting** on submissions
- **IP-based blocking** for repeated violations

## 📊 Analytics & Tracking

### Visitor Analytics
- **Page view tracking** with privacy focus
- **Engagement metrics** (time on page, bounce rate)
- **Traffic sources** and referrer analysis
- **Geographic data** (country/city level)

### Content Performance
- **Essay popularity** through voting
- **Reading time** analysis
- **Comment engagement** metrics
- **Newsletter performance** tracking

### Real-time Features
- **Live visitor count** (planned)
- **Recent activity** feed
- **Popular content** highlighting
- **Trending topics** detection

## 🚀 Deployment

### Production Setup
1. **Environment configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your-production-db
   ```

2. **Build process**
   ```bash
   npm run build
   ```

3. **Process management**
   ```bash
   npm start
   ```

### Recommended Hosting
- **Vercel** for static assets
- **Railway** for Node.js backend
- **MongoDB Atlas** for database
- **Cloudflare** for CDN and security

### Performance Optimization
- **Gzip compression** enabled
- **Static asset caching** with headers
- **Database indexing** for queries
- **CDN integration** for global delivery

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes with tests
4. **Submit** pull request
5. **Code review** and merge

### Code Standards
- **ESLint** configuration for consistency
- **Prettier** formatting
- **Jest** testing framework
- **Conventional commits** for history

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inter font** for typography
- **GSAP** for animations
- **Marked** for markdown processing
- **Highlight.js** for code syntax highlighting
- **Three.js** for 3D timeline (planned)

## 📞 Contact

- **Email**: [your-email@domain.com]
- **Website**: [https://umarbek.com]
- **GitHub**: [https://github.com/UmarbekFU]

---

Built with ❤️ by Umarbek - A minimalist designer focused on creating impactful digital experiences. 