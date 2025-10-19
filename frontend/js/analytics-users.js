document.addEventListener('DOMContentLoaded', () => {
    // Ensure the user is an admin before fetching data
    // (This assumes you have a similar check on other pages)
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

// ======================================================================
// == Chart 1: User Segment Distribution (K-Means)
// ======================================================================
async function renderSegmentChart(token) {
    try {
        const data = await fetch('/api/analysis/segment-counts', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        const options = {
            chart: {
                type: 'donut',
                height: 350,
                foreColor: '#cccccc' // Light text for dark mode
            },
            series: data.map(item => item.userCount),
            labels: data.map(item => `Segment ${item.segment}`),
            colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2'],
            legend: { position: 'top' },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Users',
                                color: '#ffffff',
                                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                            }
                        }
                    }
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: { width: 200 },
                    legend: { position: 'bottom' }
                }
            }]
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
        const data = await fetch('/api/analysis/pca-results', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        // Transform data into the format ApexCharts expects for scatter plots
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
            colors: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'],
            xaxis: {
                title: { text: 'Principal Component 1', style: { color: '#b3b3b3' } },
                tickAmount: 10,
            },
            yaxis: {
                title: { text: 'Principal Component 2', style: { color: '#b3b3b3' } },
            },
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
    // NOTE: This chart requires a new API endpoint. I'll show you how to create it below.
    try {
        const data = await fetch('/api/analysis/distribution/country', {
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
            plotOptions: {
                bar: {
                    horizontal: true, // Creates a more readable horizontal bar chart
                    borderRadius: 4
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'horizontal',
                    shadeIntensity: 0.5,
                    gradientToColors: ['#33E0B2'], // Your accent color
                    inverseColors: true,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 100]
                }
            },
            tooltip: { theme: 'dark' },
            dataLabels: { enabled: false } // Keep it clean
        };

        const chart = new ApexCharts(document.querySelector("#country-chart"), options);
        chart.render();

    } catch (error) {
        console.error('Error fetching country data:', error);
    }
}