document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');

    adminAuthCheck(token);
    fetchAllUsers(token);
    setupEventListeners(token);
});

async function adminAuthCheck(token) { /* ... (Same as your other admin JS files) ... */ }

function setupEventListeners(token) {
    const userModal = document.getElementById('userModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const userForm = document.getElementById('userForm');
    const usersTableBody = document.getElementById('usersTableBody');
    const signOutBtn = document.getElementById('signOutBtn');

    if(signOutBtn) { /* ... (Add your standard sign out logic here) ... */ }

    // Close modal
    cancelBtn.addEventListener('click', () => userModal.style.display = 'none');

    // Handle form submission for editing role
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUserRole(token);
    });

    // Handle clicks on EDIT and DELETE buttons in the table
    usersTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const userId = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            openEditForm(target.dataset.name, userId, target.dataset.role);
        } else if (target.classList.contains('delete-btn')) {
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
        const response = await fetch('http://localhost:5000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = ''; // Clear loading state

        document.getElementById('userCount').textContent = users.length; // Update stat card

        users.forEach(user => {
            const row = document.createElement('tr');
            const joinedDate = new Date(user.createdAt).toLocaleDateString();
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td><span class="status ${user.role === 'admin' ? 'status--ok' : ''}">${user.role}</span></td>
                <td>${joinedDate}</td>
                <td class="text-right">
                    <div class="actions">
                        <button class="btn btn--ghost edit-btn" data-id="${user._id}" data-name="${user.fullName}" data-role="${user.role}">Edit</button>
                        <button class="btn btn--ghost btn--danger delete-btn" data-id="${user._id}">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

/**
 * Opens the modal and pre-fills it with the user's data for editing.
 */
function openEditForm(name, userId, currentRole) {
    document.getElementById('userName').textContent = name;
    document.getElementById('userId').value = userId;
    document.getElementById('role').value = currentRole;
    document.getElementById('userModal').style.display = 'flex';
}

/**
 * Saves the updated role for a user.
 */
async function saveUserRole(token) {
    const userId = document.getElementById('userId').value;
    const newRole = document.getElementById('role').value;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ role: newRole })
        });
        if (response.ok) {
            document.getElementById('userModal').style.display = 'none';
            fetchAllUsers(token); // Refresh the list
        } else {
            alert('Failed to update user role.');
        }
    } catch (error) {
        console.error("Error saving user role:", error);
    }
}

/**
 * Deletes a user.
 */
async function deleteUser(userId, token) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            fetchAllUsers(token); // Refresh the list
        } else {
            alert('Failed to delete user.');
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}