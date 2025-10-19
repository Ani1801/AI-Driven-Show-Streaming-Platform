document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    renderAuthButton(token);

    if (token) {
        fetchFavourites(token);
    } else {
        showEmptyState("Please sign in to see your favourites.");
    }
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

/**
 * Handles the sign-out process correctly.
 */
function handleSignOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_full_name');
    // Consider removing other user-specific items if stored
    window.location.href = 'login.html'; // Assuming login.html is in the same directory
}

/**
 * Displays the correct "Sign In" or "Sign Out" button in the navigation.
 */
function renderAuthButton(token) {
    const authContainer = document.querySelector('.user-actions'); // Ensure this selector is correct for your HTML
    if (!authContainer) return;
    if (token) {
        authContainer.innerHTML = '<button class="signup-btn" id="signOutBtn">Sign Out</button>';
        document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
    } else {
        authContainer.innerHTML = '<button class="signup-btn" id="signInBtn">Sign In</button>';
        document.getElementById('signInBtn').addEventListener('click', () => window.location.href = 'login.html');
    }
}

/**
 * Fetches the user's favourites from the correct API endpoint.
 */
async function fetchFavourites(token) {
    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/favourites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

        const favouriteItems = await response.json();
        renderFavourites(favouriteItems, token);
    } catch (error) {
        console.error("Error fetching favourites:", error);
        showEmptyState("Could not load your favourites.");
    }
}

/**
 * Renders the list of favourite movies to the page.
 */
function renderFavourites(list, token) {
    const grid = document.getElementById('favouritesGrid');
    const emptyState = document.getElementById('emptyState');
    const countEl = document.querySelector('.favourites-count'); // Ensure this selector is correct

    if (!grid) {
        console.error("Favourites grid element not found!");
        return;
    }

    if (!list || list.length === 0) {
        showEmptyState("You haven't added any favourites yet.");
        return;
    }

    if(emptyState) emptyState.style.display = 'none';
    if(countEl) countEl.textContent = `${list.length} Item${list.length !== 1 ? 's' : ''}`;

    grid.innerHTML = ''; // Clear previous items

    list.forEach(item => {
        const show = item.show;
        if (!show) return; // Skip if show data is missing

        const card = document.createElement('div');
        card.className = 'fav-card'; // Ensure this class exists in your CSS
        card.innerHTML = `
            <div class="fav-poster" style="background-image: url('${show.poster_url || ''}');">
                <div class="fav-overlay"><button class="play-btn">▶</button></div>
            </div>
            <div class="fav-info">
                <h3 class="fav-title">${show.title}</h3>
                <div class="fav-meta">
                    <div class="fav-rating"><span>★</span><span>${show.rating || 'N/A'}</span></div>
                </div>
                <div class="fav-actions">
                    <button class="action-btn remove-btn" data-id="${show._id}">🗑️ Remove</button>
                </div>
            </div>`;
        grid.appendChild(card);
    });

    // Add event listener for remove buttons using event delegation
    grid.addEventListener('click', function(e) {
        const btn = e.target.closest('.remove-btn');
        if (btn) {
            const showId = btn.getAttribute('data-id');
            removeFavourite(showId, token, btn);
        }
    });
}

/**
 * Sends a request to the backend to remove a favourite item.
 */
async function removeFavourite(showId, token, buttonElement) {
    if (!showId) return;

    buttonElement.textContent = 'Removing...';
    buttonElement.disabled = true;

    try {
        // === UPDATE URL HERE ===
        const response = await fetch(`${API_BASE_URL}/favourites/${showId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to remove favourite: ${response.statusText}`);
        }

        // Remove the card from the UI
        buttonElement.closest('.fav-card').remove();
        
        // Update the count
        const grid = document.getElementById('favouritesGrid');
        const count = grid.children.length;
        const countEl = document.querySelector('.favourites-count');
        if(countEl) countEl.textContent = `${count} Item${count !== 1 ? 's' : ''}`;
        if(count === 0) showEmptyState("You haven't added any favourites yet.");

        // Optionally show a success message
        // alert('Removed from favourites!');

    } catch (error) {
        console.error("Error removing favourite:", error);
        alert('Could not remove item. Please try again.');
        buttonElement.textContent = '🗑️ Remove'; // Reset button text on error
        buttonElement.disabled = false;
    }
}

/**
 * Displays a message when the user has no favourites or an error occurs.
 */
function showEmptyState(message) {
    const grid = document.getElementById('favouritesGrid');
    const emptyState = document.getElementById('emptyState'); // Ensure this element exists in your HTML
    const countEl = document.querySelector('.favourites-count');

    if(grid) grid.innerHTML = '';
    if(emptyState) {
        emptyState.style.display = 'block';
        const msgElement = emptyState.querySelector('p'); // Assuming message is in a <p> tag
        if (msgElement) msgElement.textContent = message;
    }
    if(countEl) countEl.textContent = '0 Items';
}