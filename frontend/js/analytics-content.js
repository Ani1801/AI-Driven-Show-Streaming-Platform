document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }

    // Render all charts for the Content Analytics page
    renderDeviceEngagementChart(token);
    renderPopularGenresChart(token);
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

// ======================================================================
// == Chart 1: Engagement by Device
// ======================================================================
async function renderDeviceEngagementChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/distribution/device`, {
            // Headers are included for when auth is re-enabled, currently ignored by backend
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
            colors: ['#33E0B2'], // Theme accent color
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    distributed: true
                }
            },
            fill: { /* ... gradient options ... */ },
            legend: { show: false },
            tooltip: { theme: 'dark' },
            dataLabels: { enabled: false }
        };

        const chart = new ApexCharts(document.querySelector("#device-engagement-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching device engagement data:', error);
    }
}

// ======================================================================
// == Chart 2: Most Popular Genres
// ======================================================================
async function renderPopularGenresChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/popular-genres`, {
            // Headers are included for when auth is re-enabled, currently ignored by backend
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        data.sort((a, b) => b.viewCount - a.viewCount);

        const options = {
            chart: {
                type: 'bar',
                height: 350,
                foreColor: '#cccccc'
            },
            series: [{
                name: 'Total Views',
                data: data.map(item => item.viewCount)
            }],
            xaxis: {
                categories: data.map(item => item.genre)
            },
            colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f'], // Example palette
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

        const chart = new ApexCharts(document.querySelector("#popular-genres-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching popular genres data:', error);
    }
}