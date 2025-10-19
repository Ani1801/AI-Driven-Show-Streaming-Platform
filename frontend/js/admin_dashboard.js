document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');

    // Basic authentication check
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }

    // Initialize the dashboard elements
    initializeDashboard(token);

    // Setup logout button
    setupLogout(); // Pass token if needed inside setupLogout
});

/**
 * Fetches initial dashboard stats (KPIs) AND Kaggle user count.
 * Serves as the primary auth check for live data endpoints.
 */
async function initializeDashboard(token) {
    // --- Fetch Live Stats (Shows, potentially Revenue/WatchTime) ---
    try {
        // Fetch KPIs from the admin endpoint (uses live data counts)
        const response = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            alert('Access Denied or Session Expired. Please log in again.');
            localStorage.removeItem('auth_token'); // Clear potentially bad token
            localStorage.removeItem('user_id');
            window.location.href = '/views/login.html';
            return; // Stop execution
        }

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const liveStats = await response.json();

        // Update KPIs based on LIVE data (except users, which we'll overwrite)
        document.getElementById('total-shows-metric').textContent = liveStats.shows || '0';
        document.getElementById('total-revenue-metric').textContent = liveStats.revenue ? `$${liveStats.revenue.toFixed(2)}` : '$0.00'; // Assumes backend provides this
        document.getElementById('total-watch-time-metric').textContent = liveStats.watchTime ? `${Math.round(liveStats.watchTime)}` : '0'; // Assumes backend provides this

        // Now fetch the table data since authentication passed
        fetchRecentShows(token); // Fetches live recent shows
        fetchAssociationRules(token); // Fetches Kaggle analysis rules

    } catch (error) {
        console.error("Error during dashboard initialization:", error);
        // Display a user-friendly error message on the page if desired
        // Also clear potentially bad token if auth check failed unexpectedly
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        // window.location.href = '/views/login.html'; // Optional: redirect on any init error
    }

    // --- Fetch Kaggle User Count ---
    // This is done separately as it uses a different data source and API endpoint
    try {
        // Fetch segment data from the analysis endpoint (currently bypasses auth)
        const segmentResponse = await fetch('/api/analysis/segment-counts');
        // If auth is re-enabled later, add headers: { 'Authorization': `Bearer ${token}` }

        if (!segmentResponse.ok) {
            throw new Error(`Failed to fetch segment data: ${segmentResponse.status}`);
        }
        const segmentData = await segmentResponse.json();

        // Calculate total users from segments
        const totalKaggleUsers = segmentData.reduce((sum, segment) => sum + segment.userCount, 0);

        // Update the "Total Users" KPI card with the KAGGLE count
        document.getElementById('total-users-metric').textContent = totalKaggleUsers || '0';

    } catch (error) {
        console.error("Error fetching Kaggle user count:", error);
        document.getElementById('total-users-metric').textContent = 'Error'; // Show error on card
    }
}


/**
 * Fetches Recently Added Shows (from live data) and populates the table.
 */
async function fetchRecentShows(token) {
    try {
        const response = await fetch('/api/admin/shows', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) { return; } // Silently fail for non-critical data

        const shows = await response.json();
        const tableBody = document.getElementById('recent-shows-body'); // Make sure this ID exists in your HTML
        tableBody.innerHTML = '';

        shows.slice(0, 5).forEach(show => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${show.title || 'N/A'}</td>
                <td>${show.genre || show.category || 'N/A'}</td>
                <td>${show.rating || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching recent shows:", error);
    }
}

/**
 * Fetches Top Content Association Rules (from Kaggle analysis data) and populates the table.
 */
async function fetchAssociationRules(token) {
    try {
        // Fetch rules from the analysis endpoint (currently bypasses auth)
        const response = await fetch('/api/analysis/association-rules');
        // If auth is re-enabled later, add headers: { 'Authorization': `Bearer ${token}` }

        if (!response.ok) { return; }

        const data = await response.json();
        const tableBody = document.getElementById('rules-table-body'); // Make sure this ID exists in your HTML
        tableBody.innerHTML = '';

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No significant association rules found.</td></tr>';
            return;
        }

        // Populate table, showing top 5 rules
        data.slice(0, 5).forEach(rule => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rule.antecedents}</td>
                <td>${rule.consequents}</td>
                <td>${rule.lift.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching association rules:", error);
    }
}


/**
 * Sets up the logout button functionality.
 */
function setupLogout() { // Removed token parameter as it's not strictly needed here
    // Assuming your logout button has id="signOutBtn"
    const signOutBtn = document.getElementById('signOutBtn'); // Make sure this ID exists in your HTML
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            window.location.href = '/views/login.html';
        });
    }
}