# Deployment Guide for Render

## Pre-Deployment Checklist

### ✅ Code Fixes Applied
- [x] Fixed nodemailer.createTransporter → createTransport
- [x] Added robust email configuration with fallbacks
- [x] Added proper host binding for production (0.0.0.0)
- [x] Added graceful shutdown handling
- [x] Added health check endpoint (/health)
- [x] Fixed CORS configuration
- [x] Added error handling for missing routes
- [x] Added static file serving improvements
- [x] Created render.yaml configuration

### 🔧 Environment Variables Required

**Essential (Required for basic functionality):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/umarbek_website
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
```

**Email Configuration (Optional - features will be disabled if not set):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Umarbek <your-email@gmail.com>
```

**Optional:**
```
CORS_ORIGIN=https://inkzy.uz
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Steps

### 1. Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add it to `MONGODB_URI` environment variable

### 2. Configure Render
1. Connect your GitHub repository
2. Set environment variables in Render Dashboard
3. Deploy will happen automatically

### 3. Test Deployment
1. Check health endpoint: `https://your-app.onrender.com/health`
2. Test main pages
3. Test admin panel (if configured)

## Troubleshooting

### Common Issues
- **Email not working**: Check email environment variables
- **Database connection failed**: Verify MongoDB URI
- **Admin panel not working**: Set JWT_SECRET and admin credentials
- **Static files not loading**: Check file paths and static serving

### Logs to Check
- Render deployment logs
- Application logs in Render Dashboard
- Database connection logs
- Email configuration logs

## Features Status

- ✅ **Basic Website**: Always works
- ✅ **Database**: Works with MongoDB Atlas
- ✅ **Admin Panel**: Works with proper credentials
- ⚠️ **Email Features**: Works if email configured, gracefully disabled if not
- ✅ **Static Files**: Served from multiple locations for compatibility
- ✅ **Health Checks**: Available at /health
- ✅ **Error Handling**: Robust error handling throughout

## Security Notes

- JWT_SECRET should be a long, random string
- Admin password should be strong
- MongoDB connection should use SSL
- Rate limiting is enabled by default
- CORS is configured for your domain 