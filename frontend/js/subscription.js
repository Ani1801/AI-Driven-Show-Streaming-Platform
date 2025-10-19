document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');

    renderAuthButton(token);
    updateGreeting(token);

    document.querySelectorAll(".plan-button").forEach(button => {
        button.addEventListener("click", () => {
            if (!token) {
                alert("Please sign in to subscribe.");
                window.location.href = 'login.html'; // Assuming login is in the same folder
                return;
            }
            const planId = button.dataset.planId;
            handlePayment(planId, token); // Pass token to handlePayment
        });
    });
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

/**
 * Renders the correct auth button (Sign In/Sign Out).
 */
function renderAuthButton(token) {
    const authContainer = document.querySelector('.auth-buttons'); // Adjust selector if needed
    if (!authContainer) return;
    if (token) {
        authContainer.innerHTML = '<button id="signOutBtn">Sign Out</button>';
        document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
    } else {
        authContainer.innerHTML = '<a href="login.html"><button>Sign In</button></a>';
    }
}

/**
 * Handles the sign-out process.
 */
function handleSignOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_full_name');
    window.location.href = 'login.html';
}

/**
 * Updates the greeting message if the user is logged in.
 */
function updateGreeting(token) {
    const greetingEl = document.getElementById('greeting'); // Ensure this element exists
    if (!greetingEl) return;
    const fullName = localStorage.getItem('user_full_name');
    if (token && fullName) {
        greetingEl.textContent = `Hello, ${fullName.split(' ')[0]}`;
    } else {
        greetingEl.textContent = ''; // Clear greeting if not logged in
    }
}

/**
 * Handles the payment process using Razorpay.
 */
async function handlePayment(planId, token) { // Added token parameter
    try {
        // --- Step 1: Create Subscription on Backend ---
        // === UPDATE URL HERE ===
        const subRes = await fetch(`${API_BASE_URL}/payments/create-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Send token to create subscription
            },
            body: JSON.stringify({ planId: planId })
        });
        const subData = await subRes.json();
        if (!subRes.ok) throw new Error(subData.message || subData.description || 'Failed to create subscription');

        // --- Step 2: Configure and Open Razorpay Checkout ---
        const options = {
            key: subData.keyId, // Razorpay Key ID sent from backend
            subscription_id: subData.subscription.id, // Subscription ID from backend response
            name: 'PrimeVision Subscription',
            description: `Payment for ${planId} plan`, // Example description
            image: 'path/to/your/logo.png', // Optional: Add your logo URL
            handler: async function (response) {
                // --- Step 3: Verify Payment on Backend ---
                try {
                    // === UPDATE URL HERE ===
                    const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` // Send token for verification
                        },
                        // Send all necessary IDs from Razorpay response and original subData
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            // Optionally send planId or other details if needed for verification
                            planId: planId
                        })
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok) {
                        alert(verifyData.message || 'Payment successful! Subscription activated.');
                        // Optionally redirect user or update UI to show active subscription
                        window.location.reload(); // Simple way to refresh state
                    } else {
                        throw new Error(verifyData.message || 'Payment verification failed.');
                    }
                } catch (verifyError) {
                    console.error("Payment Verification Error:", verifyError);
                    alert(`Payment Verification Failed: ${verifyError.message}`);
                }
            },
            prefill: { // Optional: Prefill user details if available
                name: localStorage.getItem('user_full_name') || "",
                email: localStorage.getItem('user_email') || "",
                contact: localStorage.getItem('user_phone') || ""
            },
            theme: {
                color: '#33E0B2' // Match your accent color
            }
        };
        const rzp = new Razorpay(options);

        // Handle payment failure
        rzp.on('payment.failed', function (response){
                alert(`Payment Failed: ${response.error.description}`);
                console.error('Razorpay Payment Failed:', response.error);
        });

        rzp.open(); // Open the Razorpay checkout modal

    } catch (err) {
        console.error("Subscription/Payment Error:", err);
        alert(`Error: ${err.message}`);
    }
}