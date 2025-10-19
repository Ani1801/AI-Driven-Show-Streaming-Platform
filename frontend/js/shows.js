document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');

    // Secure the page
    adminAuthCheck(token);

    // Fetch and display all shows
    fetchAllShows(token);

    // Set up event listeners for buttons and forms
    setupEventListeners(token);
});

async function adminAuthCheck(token) { /* ... (Same as your other admin JS files) ... */ }
function setupEventListeners(token) {
    const addShowBtn = document.getElementById('addShowBtn');
    const showModal = document.getElementById('showModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const showForm = document.getElementById('showForm');
    const showsGrid = document.getElementById('showsGrid');

    // Open modal to ADD a new show
    addShowBtn.addEventListener('click', () => {
        showForm.reset();
        document.getElementById('showId').value = '';
        document.getElementById('formTitle').textContent = 'Add New Show';
        showModal.style.display = 'flex';
    });

    // Close modal
    cancelBtn.addEventListener('click', () => showModal.style.display = 'none');

    // Handle form submission (for both ADDING and EDITING)
    showForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveShow(token);
    });

    // Handle clicks on EDIT and DELETE buttons
    showsGrid.addEventListener('click', async (e) => {
        const target = e.target;
        const showId = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            await openEditForm(showId, token);
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this show?')) {
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
        const response = await fetch('http://localhost:5000/api/admin/shows', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const shows = await response.json();
        const grid = document.getElementById('showsGrid');
        grid.innerHTML = shows.map(show => createShowCard(show)).join('');
    } catch (error) {
        console.error("Error fetching shows:", error);
    }
}

/**
 * Creates HTML for a single show card in the admin panel.
 */
function createShowCard(show) {
    return `
        <article class="show-card">
            <div class="show-card__poster">
                <img src="${show.poster_url}" alt="${show.title}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="show-card__meta">
                <h2 class="show-card__title">${show.title}</h2>
                <p class="show-card__sub">${show.category} • ⭐ ${show.rating || 'N/A'}</p>
            </div>
            <div class="show-card__actions">
                <button class="btn btn--ghost edit-btn" data-id="${show._id}">Edit</button>
                <button class="btn btn--ghost btn--danger delete-btn" data-id="${show._id}">Delete</button>
            </div>
        </article>
    `;
}

/**
 * Fetches data for a single show and opens the form to edit it.
 */
async function openEditForm(showId, token) {
    try {
        // In a real app, you would fetch the single show's data first
        // For simplicity, we'll reuse the fetchAllShows data for now.
        // const response = await fetch(`/api/admin/shows/${showId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        // const show = await response.json();
        
        // This is a simplified way. We will find the show data from the page.
        // A better way is to fetch it from the API to get the full data.
        
        // Let's assume you fetch all shows again to find the one.
        const response = await fetch('http://localhost:5000/api/admin/shows', { headers: { 'Authorization': `Bearer ${token}` } });
        const shows = await response.json();
        const showToEdit = shows.find(s => s._id === showId);
        
        if (showToEdit) {
            document.getElementById('formTitle').textContent = 'Edit Show';
            document.getElementById('showId').value = showToEdit._id;
            document.getElementById('title').value = showToEdit.title;
            document.getElementById('description').value = showToEdit.description;
            document.getElementById('poster_url').value = showToEdit.poster_url;
            document.getElementById('trailer_url').value = showToEdit.trailer_url;
            document.getElementById('genres').value = showToEdit.genres.join(', ');
            document.getElementById('rating').value = showToEdit.rating;
            document.getElementById('category').value = showToEdit.category;
            
            document.getElementById('showModal').style.display = 'flex';
        }
    } catch (error) {
        console.error("Error preparing edit form:", error);
    }
}

/**
 * Saves a show (either creates a new one or updates an existing one).
 */
async function saveShow(token) {
    const showId = document.getElementById('showId').value;
    const isEditing = !!showId;
    
    const showData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        poster_url: document.getElementById('poster_url').value,
        trailer_url: document.getElementById('trailer_url').value,
        genres: document.getElementById('genres').value.split(',').map(g => g.trim()),
        rating: document.getElementById('rating').value,
        category: document.getElementById('category').value
    };

    const url = isEditing ? `http://localhost:5000/api/admin/shows/${showId}` : 'http://localhost:5000/api/admin/shows';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(showData)
        });
        if (response.ok) {
            document.getElementById('showModal').style.display = 'none';
            fetchAllShows(token); // Refresh the list
        } else {
            alert('Failed to save show.');
        }
    } catch (error) {
        console.error("Error saving show:", error);
    }
}

/**
 * Deletes a show.
 */
async function deleteShow(showId, token) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/shows/${showId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            fetchAllShows(token); // Refresh the list
        } else {
            alert('Failed to delete show.');
        }
    } catch (error) {
        console.error("Error deleting show:", error);
    }
}