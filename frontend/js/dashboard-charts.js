document.addEventListener('DOMContentLoaded', () => {
    // Call all the functions to fetch data and render the charts
    renderSegmentChart();
    initializeSubscriptionChart(); // MODIFIED: We now call the initializer for the dynamic chart
    renderDeviceChart();
    renderPcaChart();
    populateRulesTable();
});

// Base URL for your API
const API_BASE_URL = '/api/analysis';

// Get the token from localStorage to authorize API requests
const token = localStorage.getItem('auth_token');

// This variable will hold our dynamic chart instance so we can update/destroy it
let subscriptionChartInstance = null;

/**
 * Renders the User Segment Distribution Pie Chart with advanced labels.
 */
async function renderSegmentChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/segment-counts`);
        const data = await response.json();

        const labels = data.map(item => `Segment ${item.segment}`);
        const values = data.map(item => item.userCount);

        new Chart(document.getElementById('segmentChart'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Users',
                    data: values,
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff', // Set legend text color to white
                            font: { size: 14 }
                        }
                    },
                    // Use the datalabels plugin to show percentages on the chart
                    datalabels: {
                        color: '#ffffff',
                        font: {
                            weight: 'bold',
                            size: 16
                        },
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(1) + '%';
                            return percentage;
                        }
                    },
                    // Enhance tooltips that appear on hover
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                return `${label}: ${value} Users`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching segment data:', error);
    }
}

/**
 * Initializes the subscription chart: fetches data once and sets up the dropdown listener.
 */
async function initializeSubscriptionChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/distribution/subscription`);
        const data = await response.json();
        
        // Initial render as a bar chart
        renderSubscriptionChart('bar', data);

        // Add event listener to the dropdown to re-render the chart on change
        const chartTypeSelect = document.getElementById('subscriptionChartType');
        chartTypeSelect.addEventListener('change', (event) => {
            renderSubscriptionChart(event.target.value, data);
        });

    } catch (error) {
        console.error('Error fetching subscription data for initialization:', error);
    }
}

/**
 * Renders or updates the Engagement by Subscription chart with a specified type.
 * @param {string} chartType - The type of chart to render ('bar', 'pie', 'line').
 * @param {Array} data - The data fetched from the API.
 */
function renderSubscriptionChart(chartType, data) {
    const ctx = document.getElementById('subscriptionChart').getContext('2d');
    
    // CRITICAL: Destroy the previous chart instance before creating a new one
    if (subscriptionChartInstance) {
        subscriptionChartInstance.destroy();
    }

    const labels = data.map(item => item.category);
    const values = data.map(item => item.averageWatchMinutes);
    const colors = ['#8e44ad', '#3498db', '#e74c3c', '#2ecc71'];

    subscriptionChartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Watch Minutes',
                data: values,
                backgroundColor: colors,
                borderColor: '#e74c3c', // Used for the line chart
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { 
                    display: chartType === 'pie', // Only show legend for pie chart
                    labels: { color: '#ffffff' }
                },
                datalabels: { // Use our plugin for better labels
                    anchor: 'end',
                    align: 'top',
                    color: '#ffffff',
                    formatter: (value) => value.toFixed(2) + ' min'
                }
            },
            // Only show axes for bar and line charts
            scales: {
                y: { 
                    display: chartType !== 'pie', 
                    beginAtZero: true,
                    ticks: { color: '#ffffff' }
                },
                x: { 
                    display: chartType !== 'pie',
                    ticks: { color: '#ffffff' }
                }
            }
        }
    });
}


/**
 * Renders the Engagement by Device Bar Chart
 */
async function renderDeviceChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/distribution/device`);
        const data = await response.json();

        const labels = data.map(item => item.category);
        const values = data.map(item => item.averageWatchMinutes);

        new Chart(document.getElementById('deviceChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Watch Minutes',
                    data: values,
                    backgroundColor: '#16a085',
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: { 
                    x: { beginAtZero: true, ticks: { color: '#ffffff' } },
                    y: { ticks: { color: '#ffffff' } }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching device data:', error);
    }
}

/**
 * Renders the User Behavior Patterns (PCA) Scatter Plot
 */
async function renderPcaChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/pca-results`);
        const data = await response.json();

        const segments = {};
        data.forEach(p => {
            if (!segments[p.Segment]) segments[p.Segment] = [];
            segments[p.Segment].push({ x: p.PC1, y: p.PC2 });
        });

        const datasets = Object.keys(segments).map((seg, index) => {
            const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'];
            return {
                label: `Segment ${seg}`,
                data: segments[seg],
                backgroundColor: colors[index]
            };
        });

        new Chart(document.getElementById('pcaChart'), {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#ffffff' } },
                    tooltip: {
                        callbacks: {
                            label: (context) => `(PC1: ${context.raw.x.toFixed(2)}, PC2: ${context.raw.y.toFixed(2)})`
                        }
                    }
                },
                scales: { 
                    x: { ticks: { color: '#ffffff' } },
                    y: { ticks: { color: '#ffffff' } }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching PCA data:', error);
    }
}

/**
 * Populates the Association Rules table
 */
async function populateRulesTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/association-rules`);
        const data = await response.json();
        const tableBody = document.getElementById('rulesTableBody');

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No significant association rules found.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(rule => `
            <tr>
                <td>${rule.antecedents}</td>
                <td>${rule.consequents}</td>
                <td>${rule.lift.toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching association rules:', error);
    }
}