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

/**
 * Fetches the current admin's profile data and populates the form.
 */
async function loadAdminProfile(token, userId) {
    try {
        // ASSUMPTION: You have a backend route like GET /api/users/profile/:id or /api/users/me
        const response = await fetch(`/api/users/profile/${userId}`, { // Adjust endpoint if needed
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
        // Typically, email is read-only as it's often the login identifier

    } catch (error) {
        console.error('Error loading admin profile:', error);
        // Display an error message to the user if needed
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
            // ASSUMPTION: You have a backend route like PUT /api/users/profile/:id
            const response = await fetch(`/api/users/profile/${userId}`, { // Adjust endpoint if needed
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fullName }) // Only send fields that can be updated
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            alert('Profile updated successfully!');
            // Optionally update the name displayed in the sidebar/header

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

        // Basic validation
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (!currentPassword || !newPassword) {
            alert('Please fill in all password fields.');
            return;
        }

        button.textContent = 'Updating...';
        button.disabled = true;

        try {
            // ASSUMPTION: You have a backend route like POST /api/users/change-password/:id
            const response = await fetch(`/api/users/change-password/${userId}`, { // Adjust endpoint
                method: 'POST', // Or PUT, depending on your backend design
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
            passwordForm.reset(); // Clear the form fields

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
 * Sets up the logout button functionality (if needed specifically on this page).
 */
function setupLogout() {
    // Assuming your logout button has id="signOutBtn" like in previous examples
    const signOutBtn = document.getElementById('signOutBtn'); // Ensure this ID exists in your sidebar HTML
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id'); // Clear all user-related data
            window.location.href = '/views/login.html';
        });
    }
}