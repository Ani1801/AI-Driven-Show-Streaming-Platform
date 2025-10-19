document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }

    // Render all charts for this page
    renderSegmentChart(token);
    renderPcaChart(token);
    renderCountryChart(token);
});

// === ADD YOUR LIVE BACKEND URL HERE ===
const API_BASE_URL = 'https://ai-driven-show-streaming-platform-1.onrender.com/api';

// ======================================================================
// == Chart 1: User Segment Distribution (K-Means)
// ======================================================================
async function renderSegmentChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/segment-counts`, {
            // Headers included for when auth is re-enabled, currently ignored by backend
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        const options = {
            chart: {
                type: 'donut',
                height: 350,
                foreColor: '#cccccc'
            },
            series: data.map(item => item.userCount),
            labels: data.map(item => `Segment ${item.segment}`),
            colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2'], // Example palette
            legend: { position: 'top' },
            plotOptions: { /* ... plot options ... */ },
            responsive: [{ /* ... responsive options ... */ }]
        };

        const chart = new ApexCharts(document.querySelector("#segment-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching segment data:', error);
    }
}

// ======================================================================
// == Chart 2: User Behavior Patterns (PCA)
// ======================================================================
async function renderPcaChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/pca-results`, {
            // Headers included for when auth is re-enabled, currently ignored by backend
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        const segments = {};
        data.forEach(p => {
            if (!segments[p.Segment]) {
                segments[p.Segment] = { name: `Segment ${p.Segment}`, data: [] };
            }
            segments[p.Segment].data.push([p.PC1.toFixed(2), p.PC2.toFixed(2)]);
        });
        const series = Object.values(segments);

        const options = {
            chart: {
                type: 'scatter',
                height: 350,
                zoom: { enabled: true },
                foreColor: '#cccccc'
            },
            series: series,
            colors: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'], // Example palette
            xaxis: { /* ... xaxis options ... */ },
            yaxis: { /* ... yaxis options ... */ },
            legend: { position: 'top' },
            tooltip: { theme: 'dark' }
        };

        const chart = new ApexCharts(document.querySelector("#pca-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching PCA data:', error);
    }
}

// ======================================================================
// == Chart 3: User Distribution by Country
// ======================================================================
async function renderCountryChart(token) {
    try {
        // === UPDATE URL HERE ===
        const data = await fetch(`${API_BASE_URL}/analysis/distribution/country`, {
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
                name: 'User Count',
                data: data.map(item => item.userCount)
            }],
            xaxis: {
                categories: data.map(item => item.country)
            },
            plotOptions: { /* ... plot options ... */ },
            fill: { /* ... fill options ... */ },
            tooltip: { theme: 'dark' },
            dataLabels: { enabled: false }
        };

        const chart = new ApexCharts(document.querySelector("#country-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching country data:', error);
    }
}