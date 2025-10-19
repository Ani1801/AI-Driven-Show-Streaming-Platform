document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id'); // Assuming user ID is stored after login

    // Basic authentication check
    if (!token || !userId) {
        window.location.href = '/views/login.html';
        return;
    }

    // Load initial profile data
    loadAdminProfile(token, userId);

    // Add event listeners to the forms
    setupFormListeners(token, userId);

    // Setup logout (if your sidebar code isn't shared)
    setupLogout();
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

/**
 * Fetches the current admin's profile data and populates the form.
 */
async function loadAdminProfile(token, userId) {
    try {
        // ASSUMPTION: Backend route is GET /api/users/profile/:id (adjust if it's /me)
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/views/login.html';
            return;
        }
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const userData = await response.json();

        // Populate the profile form fields
        document.getElementById('admin-full-name').value = userData.fullName || '';
        document.getElementById('admin-email').value = userData.email || '';

    } catch (error) {
        console.error('Error loading admin profile:', error);
    }
}

/**
 * Sets up the event listeners for both the profile and password forms.
 */
function setupFormListeners(token, userId) {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    // --- Profile Form Submission ---
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('admin-full-name').value;
        const button = profileForm.querySelector('button[type="submit"]');
        button.textContent = 'Saving...';
        button.disabled = true;

        try {
            // ASSUMPTION: Backend route is PUT /api/users/profile/:id (adjust if it's /me)
            // === UPDATE URL HERE ===
            const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fullName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            alert('Profile updated successfully!');
            // Optionally update the name displayed elsewhere

        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Error: ${error.message}`);
        } finally {
            button.textContent = 'Save Profile Changes';
            button.disabled = false;
        }
    });

    // --- Password Form Submission ---
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const button = passwordForm.querySelector('button[type="submit"]');

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!'); return;
        }
        if (!currentPassword || !newPassword) {
            alert('Please fill in all password fields.'); return;
        }

        button.textContent = 'Updating...';
        button.disabled = true;

        try {
            // ASSUMPTION: Backend route is POST /api/users/change-password/:id
            // === UPDATE URL HERE ===
            const response = await fetch(`${API_BASE_URL}/users/change-password/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password. Check current password.');
            }

            alert('Password updated successfully!');
            passwordForm.reset();

        } catch (error) {
            console.error('Error updating password:', error);
            alert(`Error: ${error.message}`);
        } finally {
            button.textContent = 'Update Password';
            button.disabled = false;
        }
    });
}

/**
 * Sets up the logout button functionality.
 */
function setupLogout() {
    const signOutBtn = document.getElementById('signOutBtn'); // Ensure this ID exists in your sidebar HTML
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            window.location.href = '/views/login.html';
        });
    }
}