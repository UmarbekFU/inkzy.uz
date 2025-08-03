const sanitizeHtml = require('sanitize-html');
const xss = require('xss');

// HTML sanitization options
const sanitizeOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    allowedAttributes: {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'code': ['class'],
        'pre': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedClasses: {
        'code': ['language-*', 'hljs', 'javascript', 'python', 'css', 'html']
    }
};

// Sanitize HTML content
function sanitizeHtmlContent(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }
    
    // First pass: XSS prevention
    let sanitized = xss(html);
    
    // Second pass: HTML sanitization
    sanitized = sanitizeHtml(sanitized, sanitizeOptions);
    
    return sanitized.trim();
}

// Sanitize plain text
function sanitizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    return text
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

// Sanitize email
function sanitizeEmail(email) {
    if (!email || typeof email !== 'string') {
        return '';
    }
    
    return email
        .toLowerCase()
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/\s+/g, ''); // Remove whitespace
}

// Sanitize URL
function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') {
        return '';
    }
    
    const sanitized = url.trim();
    
    // Only allow http, https, and mailto protocols
    if (!/^(https?:\/\/|mailto:)/i.test(sanitized)) {
        return '';
    }
    
    return sanitized;
}

// Sanitize slug
function sanitizeSlug(slug) {
    if (!slug || typeof slug !== 'string') {
        return '';
    }
    
    return slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-') // Only allow letters, numbers, and hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Sanitize tags array
function sanitizeTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    
    return tags
        .filter(tag => tag && typeof tag === 'string')
        .map(tag => sanitizeText(tag).toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 50)
        .slice(0, 10); // Limit to 10 tags
}

// Recursive sanitization for objects and arrays
function sanitizeInput(input) {
    if (typeof input === 'string') {
        return sanitizeText(input);
    }
    
    if (Array.isArray(input)) {
        return input.map(item => sanitizeInput(item));
    }
    
    if (input && typeof input === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    
    return input;
}

// Validate form data against schema
function validateFormData(data, schema) {
    const errors = [];
    const sanitizedData = {};
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        
        // Check if required field is missing
        if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            errors.push(`${field} is required`);
            continue;
        }
        
        // Skip validation if field is not required and empty
        if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            continue;
        }
        
        // Type validation
        if (rules.type === 'email') {
            const email = sanitizeEmail(value);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push(`${field} must be a valid email address`);
                continue;
            }
            sanitizedData[field] = email;
        } else if (rules.type === 'url') {
            const url = sanitizeUrl(value);
            if (!url) {
                errors.push(`${field} must be a valid URL`);
                continue;
            }
            sanitizedData[field] = url;
        } else if (rules.type === 'text') {
            const text = sanitizeText(value);
            
            // Length validation
            if (rules.minLength && text.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
                continue;
            }
            
            if (rules.maxLength && text.length > rules.maxLength) {
                errors.push(`${field} must be no more than ${rules.maxLength} characters`);
                continue;
            }
            
            sanitizedData[field] = text;
        } else if (rules.type === 'object') {
            if (typeof value !== 'object' || value === null) {
                errors.push(`${field} must be an object`);
                continue;
            }
            sanitizedData[field] = sanitizeInput(value);
        } else {
            sanitizedData[field] = sanitizeInput(value);
        }
    }
    
    return {
        data: sanitizedData,
        errors
    };
}

module.exports = {
    sanitizeHtmlContent,
    sanitizeText,
    sanitizeEmail,
    sanitizeUrl,
    sanitizeSlug,
    sanitizeTags,
    sanitizeInput,
    validateFormData
}; 