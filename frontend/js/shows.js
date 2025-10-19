document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');

    // Basic authentication check
    if (!token) {
        window.location.href = '/views/login.html'; // Adjust path if needed
        return;
    }
    // You might want a stronger admin check here depending on your middleware setup
    // adminAuthCheck(token); // Assuming you have this function defined or imported

    // Fetch and display all shows
    fetchAllShows(token);

    // Set up event listeners for buttons and forms
    setupEventListeners(token);

    // Setup logout button
    setupLogout(); // Assuming you have this function defined elsewhere or below
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

/**
 * Sets up event listeners for add, edit, delete, and form submission.
 */
function setupEventListeners(token) {
    const addShowBtn = document.getElementById('addShowBtn');
    const showModal = document.getElementById('showModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const showForm = document.getElementById('showForm');
    const showsGrid = document.getElementById('showsGrid');

    if (!addShowBtn || !showModal || !cancelBtn || !showForm || !showsGrid) {
        console.error("One or more required elements for event listeners not found.");
        return;
    }

    // Open modal to ADD a new show
    addShowBtn.addEventListener('click', () => {
        showForm.reset();
        document.getElementById('showId').value = ''; // Clear hidden ID field
        document.getElementById('formTitle').textContent = 'Add New Show';
        showModal.style.display = 'flex'; // Or 'block' depending on your CSS
    });

    // Close modal
    cancelBtn.addEventListener('click', () => showModal.style.display = 'none');
    // Optional: Close modal if clicking outside the form area
    showModal.addEventListener('click', (e) => {
        if (e.target === showModal) {
            showModal.style.display = 'none';
        }
    });

    // Handle form submission (ADD/EDIT)
    showForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveShow(token);
    });

    // Handle clicks on EDIT and DELETE buttons using event delegation
    showsGrid.addEventListener('click', async (e) => {
        const target = e.target;
        const showCard = target.closest('.show-card'); // Find the parent card
        if (!showCard) return;

        const showId = target.dataset.id;

        if (target.classList.contains('edit-btn') && showId) {
            await openEditForm(showId, token);
        } else if (target.classList.contains('delete-btn') && showId) {
            if (confirm('Are you sure you want to delete this show? This action cannot be undone.')) {
                await deleteShow(showId, token);
            }
        }
    });
}

/**
 * Fetches all shows from the API and renders them.
 */
async function fetchAllShows(token) {
    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/admin/shows`, { // Use admin endpoint
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Failed to fetch shows: ${response.statusText}`);

        const shows = await response.json();
        const grid = document.getElementById('showsGrid');
        if (!grid) return;
        grid.innerHTML = shows.map(show => createShowCard(show)).join('');
    } catch (error) {
        console.error("Error fetching shows:", error);
        // Optionally display an error message to the user
    }
}

/**
 * Creates HTML for a single show card in the admin panel.
 */
function createShowCard(show) {
    // Basic validation for essential show properties
    const title = show.title || 'Untitled';
    const posterUrl = show.poster_url || 'path/to/default/poster.jpg'; // Provide a default poster path
    const category = show.category || 'N/A';
    const rating = show.rating ? `⭐ ${show.rating}` : 'N/A';

    return `
        <article class="show-card">
            <div class="show-card__poster">
                <img src="${posterUrl}" alt="${title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="show-card__meta">
                <h2 class="show-card__title">${title}</h2>
                <p class="show-card__sub">${category} • ${rating}</p>
            </div>
            <div class="show-card__actions">
                <button class="btn btn--ghost edit-btn" data-id="${show._id}">Edit</button>
                <button class="btn btn--ghost btn--danger delete-btn" data-id="${show._id}">Delete</button>
            </div>
        </article>
    `;
}

/**
 * Fetches data for a single show and opens the form populated with its data.
 * NOTE: Requires a backend endpoint like GET /api/admin/shows/:id
 */
async function openEditForm(showId, token) {
    try {
        // === UPDATE URL HERE ===
        // Fetch the specific show's details for accurate editing
        const response = await fetch(`${API_BASE_URL}/admin/shows/${showId}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Could not fetch show details for editing.');

        const showToEdit = await response.json();

        if (showToEdit) {
            document.getElementById('formTitle').textContent = 'Edit Show';
            document.getElementById('showId').value = showToEdit._id;
            document.getElementById('title').value = showToEdit.title || '';
            document.getElementById('description').value = showToEdit.description || '';
            document.getElementById('poster_url').value = showToEdit.poster_url || '';
            document.getElementById('trailer_url').value = showToEdit.trailer_url || '';
            // Handle genres array carefully
            document.getElementById('genres').value = Array.isArray(showToEdit.genres) ? showToEdit.genres.join(', ') : '';
            document.getElementById('rating').value = showToEdit.rating || '';
            document.getElementById('category').value = showToEdit.category || '';
            // Add other fields from your Show model as needed

            document.getElementById('showModal').style.display = 'flex'; // Or 'block'
        }
    } catch (error) {
        console.error("Error preparing edit form:", error);
        alert('Could not load show data for editing. Please try again.');
    }
}

/**
 * Saves a show (creates a new one or updates an existing one).
 */
async function saveShow(token) {
    const showId = document.getElementById('showId').value;
    const isEditing = !!showId;
    const form = document.getElementById('showForm');
    const submitButton = form.querySelector('button[type="submit"]'); // Assuming there's a submit button

    const showData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        poster_url: document.getElementById('poster_url').value,
        trailer_url: document.getElementById('trailer_url').value,
        genres: document.getElementById('genres').value.split(',').map(g => g.trim()).filter(g => g), // Ensure no empty strings
        rating: parseFloat(document.getElementById('rating').value) || null, // Convert to number or null
        category: document.getElementById('category').value
        // Add other fields from your Show model
    };

    // Basic validation
    if (!showData.title || !showData.category) {
        alert('Title and Category are required.');
        return;
    }

    // === UPDATE URL LOGIC HERE ===
    const url = isEditing
        ? `${API_BASE_URL}/admin/shows/${showId}`
        : `${API_BASE_URL}/admin/shows`;
    const method = isEditing ? 'PUT' : 'POST';

    submitButton.textContent = isEditing ? 'Updating...' : 'Adding...';
    submitButton.disabled = true;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(showData)
        });

        if (response.ok) {
            document.getElementById('showModal').style.display = 'none';
            await fetchAllShows(token); // Refresh the list after successful save
            alert(`Show ${isEditing ? 'updated' : 'added'} successfully!`);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} show.`);
        }
    } catch (error) {
        console.error("Error saving show:", error);
        alert(`Error: ${error.message}`);
    } finally {
        submitButton.textContent = isEditing ? 'Update Show' : 'Add Show'; // Reset button text
        submitButton.disabled = false;
    }
}

/**
 * Deletes a show.
 */
async function deleteShow(showId, token) {
    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/admin/shows/${showId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await fetchAllShows(token); // Refresh the list after successful deletion
            alert('Show deleted successfully.');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete show.');
        }
    } catch (error) {
        console.error("Error deleting show:", error);
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