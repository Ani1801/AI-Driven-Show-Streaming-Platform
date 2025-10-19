   
        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('auth_token');
            const userId = localStorage.getItem('user_id');

            renderAuthButton(token);
            updateGreeting(token);

            document.querySelectorAll(".plan-button").forEach(button => {
                button.addEventListener("click", () => {
                    if (!token) {
                        alert("Please sign in to subscribe.");
                        window.location.href = 'login.html';
                        return;
                    }
                    const planId = button.dataset.planId;
                    handlePayment(planId);
                });
            });
        });

        function renderAuthButton(token) {
            const authContainer = document.querySelector('.auth-buttons');
            if (!authContainer) return;
            if (token) {
                authContainer.innerHTML = '<button id="signOutBtn">Sign Out</button>';
                document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
            } else {
                authContainer.innerHTML = '<a href="login.html"><button>Sign In</button></a>';
            }
        }

        function handleSignOut() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_full_name');
            window.location.href = 'login.html';
        }

        function updateGreeting(token) {
            const greetingEl = document.getElementById('greeting');
            if (!greetingEl) return;
            const fullName = localStorage.getItem('user_full_name');
            if (token && fullName) {
                greetingEl.textContent = `Hello, ${fullName.split(' ')[0]}`;
            }
        }

        async function handlePayment(planId) {
            try {
                // --- FIX #1: CORRECT API URL ---
                const subRes = await fetch('http://localhost:5000/api/payments/create-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId: planId})
                });
                const subData = await subRes.json();
                if (!subRes.ok) throw new Error(subData.description || 'Failed to create subscription');
                
                const options = {
                    key: subData.keyId,
                    subscription_id: subData.subscription.id,
                    name: 'PrimeVision Subscription',
                    handler: async function (response) {
                        // --- FIX #1: CORRECT API URL ---
                        const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response)
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            alert(verifyData.message || 'Payment successful!');
                        } else {
                            throw new Error(verifyData.message || 'Payment verification failed.');
                        }
                    }
                };
                const rzp = new Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error("Payment Error:", err);
                alert(err.message);
            }
        }
    