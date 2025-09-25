const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

// The keys should be loaded from process.env by app.js
// For a quick fix, we are hardcoding the keys here.
// In a production environment, always use process.env to secure your keys.
const keyId = 'rzp_test_RLOdBiPXEx84Ld'; // <--- PASTE YOUR KEY ID HERE
const keySecret = '6Gp55f25Xnd4VFz8GQtTE'; // <--- PASTE YOUR KEY SECRET HERE

// Check if keys were loaded successfully
if (!keyId || !keySecret) {
    console.error("Critical Error: Razorpay API keys are not loaded.");
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

// Create a subscription (test mode)
router.post('/create-subscription', async (req, res) => {
  try {
    const { planId } = req.body;
    const options = {
      plan_id: planId,
      total_count: 12,
      customer_notify: 1,
    };
    const subscription = await razorpay.subscriptions.create(options);
    res.json({ subscription, keyId: keyId }); // Pass keyId to the frontend
  } catch (err) {
    const desc = err?.error?.description || err?.message || 'Unknown error';
    console.error('Razorpay create-subscription error:', err?.error || err);
    res.status(500).json({ message: 'Failed to create subscription', description: desc });
  }
});

// Verify payment signature after Checkout success
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    const payload = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');
    const isAuth = expectedSignature === razorpay_signature;
    if (!isAuth) {
        console.error('Signature verification failed.');
        return res.status(400).json({ message: 'Invalid signature' });
    }
    res.json({ message: 'Payment verified' });
  } catch (err) {
    const desc = err?.error?.description || err?.message || 'Unknown error';
    console.error('Razorpay verify error:', err?.error || err);
    res.status(500).json({ message: 'Verification failed', description: desc });
  }
});

module.exports = router;
