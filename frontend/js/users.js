document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');

    // Basic authentication check
    if (!token) {
        window.location.href = '/views/login.html'; // Adjust path if needed
        return;
    }
    // You might want a stronger admin check here depending on your middleware setup
    // adminAuthCheck(token); // Assuming you have this function defined or imported

    fetchAllUsers(token);
    setupEventListeners(token);
    setupLogout(); // Assuming you have this function defined elsewhere or below
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

/**
 * Sets up event listeners for modal, forms, and table actions.
 */
function setupEventListeners(token) {
    const userModal = document.getElementById('userModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const userForm = document.getElementById('userForm');
    const usersTableBody = document.getElementById('usersTableBody');

    if (!userModal || !cancelBtn || !userForm || !usersTableBody) {
        console.error("One or more required elements for user management not found.");
        return;
    }

    // Close modal
    cancelBtn.addEventListener('click', () => userModal.style.display = 'none');
    userModal.addEventListener('click', (e) => { // Close on outside click
        if (e.target === userModal) userModal.style.display = 'none';
    });

    // Handle form submission for editing role
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUserRole(token);
    });

    // Handle clicks on EDIT and DELETE buttons in the table
    usersTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const userId = target.dataset.id;

        if (target.classList.contains('edit-btn') && userId) {
            // Pass necessary data from the button's data attributes
            openEditForm(target.dataset.name, userId, target.dataset.role);
        } else if (target.classList.contains('delete-btn') && userId) {
            if (confirm(`Are you sure you want to delete this user? This cannot be undone.`)) {
                await deleteUser(userId, token);
            }
        }
    });
}

/**
 * Fetches all users from the API and renders them in the table.
 */
async function fetchAllUsers(token) {
    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/admin/users`, { // Use admin endpoint for user list
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);

        const users = await response.json();
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = ''; // Clear loading/previous state

        const userCountElement = document.getElementById('userCount'); // Optional: Update count display if exists
        if (userCountElement) userCountElement.textContent = users.length;

        users.forEach(user => {
            const row = document.createElement('tr');
            const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
            const role = user.role || 'user'; // Default to 'user' if role is missing
            row.innerHTML = `
                <td>${user.fullName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="status ${role === 'admin' ? 'status--ok' : ''}">${role}</span></td>
                <td>${joinedDate}</td>
                <td class="text-right">
                    <div class="actions">
                        <button class="btn btn--ghost edit-btn" data-id="${user._id}" data-name="${user.fullName || ''}" data-role="${role}">Edit Role</button>
                        <button class="btn btn--ghost btn--danger delete-btn" data-id="${user._id}">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        // Display error message in the table
        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5">Error loading users. Please try again.</td></tr>`;
    }
}

/**
 * Opens the modal and pre-fills it with the user's data for editing role.
 */
function openEditForm(name, userId, currentRole) {
    const modal = document.getElementById('userModal');
    const nameDisplay = document.getElementById('userName'); // Element to display user's name
    const idInput = document.getElementById('userId');       // Hidden input for user ID
    const roleSelect = document.getElementById('role');       // Select dropdown for role

    if (nameDisplay) nameDisplay.textContent = name || 'Selected User';
    if (idInput) idInput.value = userId;
    if (roleSelect) roleSelect.value = currentRole || 'user'; // Set dropdown to current role

    if (modal) modal.style.display = 'flex'; // Or 'block'
}

/**
 * Saves the updated role for a user.
 */
async function saveUserRole(token) {
    const userId = document.getElementById('userId').value;
    const newRole = document.getElementById('role').value;
    const form = document.getElementById('userForm');
    const submitButton = form.querySelector('button[type="submit"]'); // Assuming a submit button

    if (!userId) return;

    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;

    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, { // Specific endpoint for role update
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            document.getElementById('userModal').style.display = 'none';
            await fetchAllUsers(token); // Refresh the list
            alert('User role updated successfully.');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user role.');
        }
    } catch (error) {
        console.error("Error saving user role:", error);
        alert(`Error: ${error.message}`);
    } finally {
        submitButton.textContent = 'Save Role'; // Reset button text
        submitButton.disabled = false;
    }
}

/**
 * Deletes a user.
 */
async function deleteUser(userId, token) {
    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await fetchAllUsers(token); // Refresh the list
            alert('User deleted successfully.');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete user.');
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Sets up the logout button functionality (if needed).
 */
function setupLogout() {
    const signOutBtn = document.getElementById('signOutBtn'); // Ensure this ID exists in your sidebar HTML
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            window.location.href = '/views/login.html'; // Adjust path if needed
        });
    }
}