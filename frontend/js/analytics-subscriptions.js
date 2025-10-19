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

// ======================================================================
// == Chart 1: Engagement by Subscription
// ======================================================================
async function renderSubscriptionEngagementChart(token) {
    try {
        const data = await fetch('/api/analysis/distribution/subscription', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        const options = {
            chart: {
                type: 'bar',
                height: 350,
                foreColor: '#cccccc' // Light text for dark mode
            },
            series: [{
                name: 'Average Watch Minutes',
                data: data.map(item => item.averageWatchMinutes.toFixed(2))
            }],
            xaxis: {
                categories: data.map(item => item.category)
            },
            colors: ['#ff6b6b', '#f9a825', '#fde74c'], // Sunset/Warm color palette
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    distributed: true // Apply a different color from the 'colors' array to each bar
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
        const data = await fetch('/api/analysis/subscription-status', {
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
            colors: ['#4e79a7', '#e15759', '#76b7b2'], // Professional color palette
            legend: { position: 'bottom' },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: { width: 200 },
                    legend: { position: 'bottom' }
                }
            }]
        };

        const chart = new ApexCharts(document.querySelector("#subscription-status-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching subscription status data:', error);
    }
}