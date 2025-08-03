const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// Rate limiting for newsletter subscriptions
const subscriptionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 subscription attempts per windowMs
    message: 'Too many subscription attempts from this IP, please try again later.'
});

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Subscribe to newsletter
router.post('/subscribe', subscriptionLimiter, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email, name } = req.body;
        const ip = req.ip;
        const userAgent = req.get('User-Agent');

        // Check if subscriber already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            if (existingSubscriber.status === 'active') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'You are already subscribed to the newsletter' 
                });
            } else if (existingSubscriber.status === 'pending') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Please check your email to confirm your subscription' 
                });
            }
        }

        // Create new subscriber
        const subscriber = new Subscriber({
            email,
            name,
            status: 'pending',
            source: 'website',
            ip,
            userAgent
        });

        await subscriber.save();

        // Send confirmation email
        const confirmationUrl = `${req.protocol}://${req.get('host')}/api/newsletter/confirm/${subscriber.confirmationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Confirm your newsletter subscription',
            html: `
                <h2>Welcome to Umarbek's Newsletter!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for subscribing to my newsletter. To complete your subscription, please click the link below:</p>
                <p><a href="${confirmationUrl}">Confirm Subscription</a></p>
                <p>If you didn't request this subscription, you can safely ignore this email.</p>
                <p>Best regards,<br>Umarbek</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Please check your email to confirm your subscription' 
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to subscribe to newsletter' });
    }
});

// Confirm subscription
router.get('/confirm/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const subscriber = await Subscriber.findOne({ confirmationToken: token });

        if (!subscriber) {
            return res.status(404).json({ success: false, error: 'Invalid confirmation token' });
        }

        if (subscriber.status === 'active') {
            return res.status(400).json({ success: false, error: 'Subscription already confirmed' });
        }

        await subscriber.confirm();

        res.json({ 
            success: true, 
            message: 'Your subscription has been confirmed! Welcome to the newsletter.' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to confirm subscription' });
    }
});

// Unsubscribe
router.get('/unsubscribe/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

        if (!subscriber) {
            return res.status(404).json({ success: false, error: 'Invalid unsubscribe token' });
        }

        await subscriber.unsubscribe();

        res.json({ 
            success: true, 
            message: 'You have been successfully unsubscribed from the newsletter.' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
    }
});

// Update preferences
router.put('/preferences/:token', [
    body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { token } = req.params;
        const { preferences } = req.body;

        const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
        if (!subscriber) {
            return res.status(404).json({ success: false, error: 'Invalid token' });
        }

        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        await subscriber.save();

        res.json({ 
            success: true, 
            message: 'Preferences updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update preferences' });
    }
});

// Admin routes

// Send newsletter
router.post('/send', [
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be less than 200 characters'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { subject, content, testMode = false } = req.body;

        // Get active subscribers
        const subscribers = testMode 
            ? await Subscriber.find({ status: 'active' }).limit(1) // Send to one subscriber in test mode
            : await Subscriber.find({ status: 'active' });

        if (subscribers.length === 0) {
            return res.status(400).json({ success: false, error: 'No active subscribers found' });
        }

        let sentCount = 0;
        let failedCount = 0;

        for (const subscriber of subscribers) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_FROM,
                    to: subscriber.email,
                    subject: subject,
                    html: content,
                    headers: {
                        'List-Unsubscribe': `<${req.protocol}://${req.get('host')}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}>`
                    }
                };

                await transporter.sendMail(mailOptions);
                await subscriber.incrementEmailCount();
                sentCount++;
            } catch (error) {
                console.error(`Failed to send email to ${subscriber.email}:`, error);
                failedCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Newsletter sent successfully. Sent: ${sentCount}, Failed: ${failedCount}` 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to send newsletter' });
    }
});

// Get subscriber statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Subscriber.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch subscriber statistics' });
    }
});

// Export subscribers (CSV)
router.get('/export', async (req, res) => {
    try {
        const subscribers = await Subscriber.find({ status: 'active' })
            .select('email name status createdAt lastEmailSent emailCount')
            .sort({ createdAt: -1 });

        const csv = [
            'Email,Name,Status,Created At,Last Email Sent,Email Count',
            ...subscribers.map(sub => 
                `"${sub.email}","${sub.name}","${sub.status}","${sub.createdAt}","${sub.lastEmailSent || ''}","${sub.emailCount}"`
            )
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to export subscribers' });
    }
});

module.exports = router; 