// Global variables untuk charts
let categoryChart, trendChart;

// Load data saat halaman dimuat
window.onload = function() {
    populateYearFilter();
    loadCharts();
};

// Populate year filter dropdown
async function populateYearFilter() {
    try {
        const { data, error } = await supabase
            .from('apbd_data')
            .select('tahun');

        if (error) throw error;

        const years = [...new Set(data.map(item => item.tahun))].sort((a, b) => b - a);
        const select = document.getElementById('yearFilter');
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading years:', error);
    }
}

// Load semua charts
async function loadCharts() {
    await loadCategoryChart();
    await loadTrendChart();
    await loadDataTable();
}

// Load chart per kategori
async function loadCategoryChart() {
    const yearFilter = document.getElementById('yearFilter').value;
    
    try {
        let query = supabase
            .from('apbd_data')
            .select('*');

        if (yearFilter) {
            query = query.eq('tahun', parseInt(yearFilter));
        }

        const { data, error } = await query;
        if (error) throw error;

        createCategoryChart(data);
    } catch (error) {
        console.error('Error loading category chart:', error);
    }
}

// Load trend chart (semua tahun)
async function loadTrendChart() {
    try {
        const { data, error } = await supabase
            .from('apbd_data')
            .select('*')
            .order('tahun', { ascending: true });

        if (error) throw error;

        createTrendChart(data);
    } catch (error) {
        console.error('Error loading trend chart:', error);
    }
}

// Load data table
async function loadDataTable() {
    const yearFilter = document.getElementById('yearFilter').value;
    
    try {
        let query = supabase
            .from('apbd_data')
            .select('*')
            .order('tahun', { ascending: false });

        if (yearFilter) {
            query = query.eq('tahun', parseInt(yearFilter));
        }

        const { data, error } = await query;
        if (error) throw error;

        displayDataTable(data);
    } catch (error) {
        console.error('Error loading data table:', error);
    }
}

// Create category chart
function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    
    if (categoryChart) {
        categoryChart.destroy();
    }

    if (!data || data.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">Belum ada data untuk ditampilkan</p><canvas id="categoryChart"></canvas>';
        return;
    }

    // Group by kategori
    const categoryData = {
        'Pendapatan': 0,
        'Pembelanjaan': 0,
        'Pembiayaan': 0
    };

    data.forEach(item => {
        if (categoryData.hasOwnProperty(item.kategori)) {
            categoryData[item.kategori] += item.nilai;
        }
    });

    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(153, 102, 255, 0.7)'
    ];
    const borderColors = [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)'
    ];

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai (Rp)',
                data: values,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Nilai: ' + formatRupiah(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatRupiahShort(value);
                        }
                    }
                }
            }
        }
    });
}

// Create trend chart
function createTrendChart(data) {
    const ctx = document.getElementById('trendChart');
    
    if (trendChart) {
        trendChart.destroy();
    }

    if (!data || data.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">Belum ada data untuk ditampilkan</p><canvas id="trendChart"></canvas>';
        return;
    }

    // Group by year and category
    const yearlyData = {};
    
    data.forEach(item => {
        if (!yearlyData[item.tahun]) {
            yearlyData[item.tahun] = {
                'Pendapatan': 0,
                'Pembelanjaan': 0,
                'Pembiayaan': 0
            };
        }
        yearlyData[item.tahun][item.kategori] += item.nilai;
    });

    const sortedYears = Object.keys(yearlyData).sort();
    
    const datasets = [
        {
            label: 'Pendapatan',
            data: sortedYears.map(year => yearlyData[year]['Pendapatan']),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: false
        },
        {
            label: 'Pembelanjaan',
            data: sortedYears.map(year => yearlyData[year]['Pembelanjaan']),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: false
        },
        {
            label: 'Pembiayaan',
            data: sortedYears.map(year => yearlyData[year]['Pembiayaan']),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.4,
            fill: false
        }
    ];

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatRupiah(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatRupiahShort(value);
                        }
                    }
                }
            }
        }
    });
}

// Display data table
function displayDataTable(data) {
    const tableDiv = document.getElementById('dataTable');
    
    if (!data || data.length === 0) {
        tableDiv.innerHTML = '<p class="no-data">Belum ada data untuk ditampilkan</p>';
        return;
    }

    let html = '<div class="data-table-container"><table><thead><tr><th>Kategori</th><th>Subkategori</th><th>Tahun</th><th>Nilai (Rp)</th></tr></thead><tbody>';
    
    data.forEach(item => {
        html += `<tr>
            <td>${item.kategori}</td>
            <td>${item.subkategori}</td>
            <td>${item.tahun}</td>
            <td>${formatRupiah(item.nilai)}</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    tableDiv.innerHTML = html;
}

// Search functionality
async function searchData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        loadCharts();
        return;
    }

    try {
        const { data, error } = await supabase
            .from('apbd_data')
            .select('*');

        if (error) throw error;

        // Filter data berdasarkan search term
        const filteredData = data.filter(item => {
            return item.kategori.toLowerCase().includes(searchTerm) ||
                   item.subkategori.toLowerCase().includes(searchTerm) ||
                   item.tahun.toString().includes(searchTerm);
        });

        // Update charts dengan filtered data
        createCategoryChart(filteredData);
        displayDataTable(filteredData);
        
        // Show message if no results
        if (filteredData.length === 0) {
            alert('Tidak ada data yang cocok dengan pencarian Anda.');
        }
    } catch (error) {
        console.error('Error searching data:', error);
    }
}

// Format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Format Rupiah Short (untuk chart axis)
function formatRupiahShort(angka) {
    if (angka >= 1000000000000) {
        return 'Rp ' + (angka / 1000000000000).toFixed(1) + 'T';
    } else if (angka >= 1000000000) {
        return 'Rp ' + (angka / 1000000000).toFixed(1) + 'M';
    } else if (angka >= 1000000) {
        return 'Rp ' + (angka / 1000000).toFixed(1) + 'Jt';
    }
    return 'Rp ' + angka.toLocaleString('id-ID');
}
