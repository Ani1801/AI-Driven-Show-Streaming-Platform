const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();
console.log("--- DEBUGGING RAZORPAY KEYS ---");
console.log("Key ID Loaded from .env:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret Loaded from .env:", process.env.RAZORPAY_KEY_SECRET);
console.log("---------------------------------");
// --- THIS IS THE FIX: Remove the quotes and semicolon ---
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Check if keys were loaded from your .env file
if (!keyId || !keySecret) {
    console.error("CRITICAL ERROR: Razorpay API keys are not loaded. Check your .env file.");
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

// Create a subscription
router.post('/create-subscription', async (req, res) => {
    try {
        const { planId } = req.body;
        if (!planId) {
            return res.status(400).json({ message: 'planId is required' });
        }
        const options = {
            plan_id: planId,
            total_count: 12,
            customer_notify: 1,
        };
        const subscription = await razorpay.subscriptions.create(options);
        res.json({ subscription, keyId: keyId });
    } catch (err) {
        const desc = err?.error?.description || err?.message || 'Unknown error';
        console.error('Razorpay create-subscription error:', err);
        res.status(500).json({ message: 'Failed to create subscription', description: desc });
    }
});

// Verify payment signature
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
        
        const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
        
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(payload)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        
        res.json({ message: 'Payment verified successfully' });
    } catch (err) {
        const desc = err?.error?.description || err?.message || 'Unknown error';
        console.error('Razorpay verify error:', err);
        res.status(500).json({ message: 'Verification failed', description: desc });
    }
});

module.exports = router;