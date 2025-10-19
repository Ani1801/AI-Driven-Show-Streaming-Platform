 
    document.addEventListener('DOMContentLoaded', function() {
        const token = localStorage.getItem('auth_token');
        renderAuthButton(token);

        if (token) {
            fetchFavourites(token);
        } else {
            // If user is not logged in, show a message and stop.
            showEmptyState("Please sign in to see your favourites.");
        }
    });

    /**
     * Handles the sign-out process correctly.
     */
    function handleSignOut() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_full_name');
        window.location.href = 'login.html';
    }
    
    /**
     * Displays the correct "Sign In" or "Sign Out" button in the navigation.
     */
    function renderAuthButton(token) {
        const authContainer = document.querySelector('.user-actions');
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
            const response = await fetch('http://localhost:5000/api/favourites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch data');

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
        
        if (!list || list.length === 0) {
            showEmptyState("You haven't added any favourites yet.");
            return;
        }

        const emptyState = document.getElementById('emptyState');
        if(emptyState) emptyState.style.display = 'none';

        const countEl = document.querySelector('.favourites-count');
        if(countEl) countEl.textContent = `${list.length} Item${list.length !== 1 ? 's' : ''}`;
        
        grid.innerHTML = ''; // Clear previous items

        // --- THIS IS THE CRUCIAL FIX ---
        // We loop through the list and correctly access the nested 'show' object.
        list.forEach(item => {
            const show = item.show; 
            if (!show) return; // Skip if a show's data is missing

            const card = document.createElement('div');
            card.className = 'fav-card';
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

        // Add a single event listener to the grid for all remove buttons.
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
        // ... (The removeFavourite logic from the previous turn was correct and can be used here) ...
    }
    
    /**
     * Displays a message when the user has no favourites.
     */
    function showEmptyState(message) {
        const grid = document.getElementById('favouritesGrid');
        const emptyState = document.getElementById('emptyState');
        const countEl = document.querySelector('.favourites-count');
        
        if(grid) grid.innerHTML = '';
        if(emptyState) {
            emptyState.style.display = 'block';
            emptyState.querySelector('p').textContent = message;
        }
        if(countEl) countEl.textContent = '0 Items';
    }
