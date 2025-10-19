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

// ======================================================================
// == Chart 1: Engagement by Device
// ======================================================================
async function renderDeviceEngagementChart(token) {
    try {
        const data = await fetch('/api/analysis/distribution/device', {
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
            colors: ['#33E0B2'], // Your theme's accent color
            plotOptions: {
                bar: {
                    horizontal: true, // A horizontal bar chart is great for category comparisons
                    borderRadius: 4,
                    distributed: true // This applies a different color to each bar if multiple colors are provided
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'vertical',
                    shadeIntensity: 0.5,
                    gradientToColors: ['#1a1a1a'],
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100]
                }
            },
            legend: { show: false }, // Not needed for a single-series chart
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
        const data = await fetch('/api/analysis/popular-genres', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        // Sort data to show the most popular genre first
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
            colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f'],
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

        const chart = new ApexCharts(document.querySelector("#popular-genres-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching popular genres data:', error);
    }
}