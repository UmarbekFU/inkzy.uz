const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// Rate limiting for contact form
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 contact form submissions per windowMs
    message: 'Too many contact form submissions from this IP, please try again later.'
});

// Email transporter setup
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Submit contact form
router.post('/', contactLimiter, [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be less than 200 characters'),
    body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
    body('honeypot').optional().isEmpty().withMessage('Honeypot field should be empty')
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

        const { name, email, subject, message, honeypot } = req.body;
        const ip = req.ip;
        const userAgent = req.get('User-Agent');

        // Honeypot check
        if (honeypot) {
            return res.status(400).json({ success: false, error: 'Invalid submission' });
        }

        // Spam detection
        const spamScore = calculateSpamScore(name, email, subject, message);
        const isSpam = spamScore > 0.7;

        if (isSpam) {
            return res.status(400).json({ success: false, error: 'Message appears to be spam' });
        }

        // Send notification email to admin
        const adminMailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>IP: ${ip}<br>User Agent: ${userAgent}</small></p>
            `
        };

        // Send confirmation email to user
        const userMailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Thank you for your message',
            html: `
                <h2>Thank you for reaching out!</h2>
                <p>Hi ${name},</p>
                <p>I've received your message and will get back to you as soon as possible.</p>
                <p><strong>Your message:</strong></p>
                <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>
                <p>Best regards,<br>Umarbek</p>
            `
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        res.json({ 
            success: true, 
            message: 'Your message has been sent successfully. You will receive a confirmation email shortly.' 
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// Get contact information
router.get('/info', (req, res) => {
    res.json({
        success: true,
        contact: {
            email: process.env.EMAIL_USER,
            location: 'Samarkand, Uzbekistan',
            availability: 'Available for remote work and collaborations',
            responseTime: 'Usually within 24 hours'
        }
    });
});

// Helper function to calculate spam score
function calculateSpamScore(name, email, subject, message) {
    let score = 0;
    
    // Check for suspicious patterns in name
    if (name.length < 2 || name.length > 50) score += 0.2;
    if (/[0-9]{3,}/.test(name)) score += 0.3;
    
    // Check for suspicious email patterns
    if (email.includes('temp') || email.includes('spam') || email.includes('test')) score += 0.4;
    if (email.split('@')[0].length < 3) score += 0.2;
    
    // Check for suspicious subject patterns
    const spamSubjects = ['buy', 'cheap', 'discount', 'free', 'money', 'earn', 'cash', 'loan', 'viagra', 'casino'];
    spamSubjects.forEach(word => {
        if (subject.toLowerCase().includes(word)) score += 0.2;
    });
    
    // Check for excessive links in message
    const linkCount = (message.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 2) score += 0.3;
    
    // Check for excessive caps
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.3) score += 0.2;
    
    // Check for repetitive words
    const words = message.toLowerCase().split(/\s+/);
    const wordCount = {};
    words.forEach(word => {
        if (word.length > 3) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    });
    
    const maxRepetition = Math.max(...Object.values(wordCount));
    if (maxRepetition > 5) score += 0.2;
    
    return Math.min(score, 1.0);
}

module.exports = router; 