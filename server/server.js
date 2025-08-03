const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Subscriber Schema
const subscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    subscribeDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
    subject: String,
    content: String,
    sentDate: {
        type: Date,
        default: Date.now
    },
    recipients: Number
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Import routes
const essaysRoutes = require('./routes/essays');

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.use('/api/essays', essaysRoutes);

app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = new Subscriber({ email });
        await subscriber.save();

        // Send welcome email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to My Newsletter',
            html: `
                <h2>Welcome to My Weekly Newsletter!</h2>
                <p>Thank you for subscribing. You'll receive weekly updates about minimalism, design, and antifragile thinking.</p>
                <p>Best regards,<br>Umarbek</p>
            `
        });

        res.status(200).json({ message: 'Subscribed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Send Newsletter
app.post('/api/send-newsletter', async (req, res) => {
    try {
        const { subject, content } = req.body;
        const subscribers = await Subscriber.find({ isActive: true });

        // Send to all active subscribers
        for (const subscriber of subscribers) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: subscriber.email,
                subject: subject,
                html: content
            });
        }

        // Save newsletter record
        const newsletter = new Newsletter({
            subject,
            content,
            recipients: subscribers.length
        });
        await newsletter.save();

        res.status(200).json({ message: 'Newsletter sent successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add new route to get submissions
app.get('/api/submissions', async (req, res) => {
    try {
        const submissions = await Subscriber.find()
            .sort({ subscribeDate: -1 }) // Most recent first
            .select('name email subscribeDate');
        res.status(200).json(submissions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 