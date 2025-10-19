document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }

    // Render all charts for the Subscription Analytics page
    renderSubscriptionEngagementChart(token);
    renderSubscriptionStatusChart(token);
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

// ======================================================================
// == Chart 1: Engagement by Subscription
// ======================================================================
async function renderSubscriptionEngagementChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/distribution/subscription`, {
            // Headers included for when auth is re-enabled, currently ignored by backend
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        const options = {
            chart: {
                type: 'bar',
                height: 350,
                foreColor: '#cccccc'
            },
            series: [{
                name: 'Average Watch Minutes',
                data: data.map(item => item.averageWatchMinutes.toFixed(2))
            }],
            xaxis: {
                categories: data.map(item => item.category)
            },
            colors: ['#ff6b6b', '#f9a825', '#fde74c'], // Example palette
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    distributed: true
                }
            },
            legend: { show: false },
            tooltip: { theme: 'dark' },
            dataLabels: { enabled: false }
        };

        const chart = new ApexCharts(document.querySelector("#subscription-engagement-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching subscription engagement data:', error);
    }
}

// ======================================================================
// == Chart 2: Subscription Status Breakdown
// ======================================================================
async function renderSubscriptionStatusChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/subscription-status`, {
            // Headers included for when auth is re-enabled, currently ignored by backend
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        const options = {
            chart: {
                type: 'pie',
                height: 350,
                foreColor: '#cccccc'
            },
            series: data.map(item => item.count),
            labels: data.map(item => item.status),
            colors: ['#4e79a7', '#e15759', '#76b7b2'], // Example palette
            legend: { position: 'bottom' },
            responsive: [{ /* ... responsive options ... */ }]
        };

        const chart = new ApexCharts(document.querySelector("#subscription-status-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching subscription status data:', error);
    }
}