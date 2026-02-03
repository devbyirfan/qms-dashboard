let authToken = '';
let currentUser = null;
let allCheckers = [];

// Chart instances
let performanceChart = null;
let performancePieChart = null;
let testTypeChart = null;
let unitPerformanceChart = null;
let monthlyTrendChart = null;
let departmentChart = null;
let ageGroupChart = null;
let educationChart = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard initializing...');
    
    // Check authentication
    authToken = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!authToken || !userInfo) {
        console.log('⚠️ No auth token found, redirecting to login');
        window.location.href = 'http://localhost:5000/';
        return;
    }
    
    currentUser = JSON.parse(userInfo);
    console.log('✅ User authenticated:', currentUser.username);
    
    setupUserInfo();
    
    // Load initial data INCLUDING CHARTS
    try {
        await Promise.all([
            loadDashboardData(),
            loadCheckersData(),
            loadCharts()  // ✅ CHARTS LOAD HOGE PEHLI BAR
        ]);
        console.log('✅ All data and charts loaded successfully');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup picture upload
    setupPictureUpload();
    
    console.log('✅ QMS Dashboard initialized successfully!');
});

// ==================== SETUP FUNCTIONS ====================
function setupUserInfo() {
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('sidebarUserName').textContent = currentUser.username;
    document.getElementById('sidebarUserRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active navigation
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show selected page
            const pageName = item.getAttribute('data-page');
            showPage(pageName);
            
            // Update page title
            document.getElementById('pageTitle').textContent = item.querySelector('span').textContent;
        });
    });
    
    // View all links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.getAttribute('data-page');
            document.querySelector(`.nav-item[data-page="${pageName}"]`).click();
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            window.location.href = 'http://localhost:5000/';
        }
    });
    
    // Menu toggle for mobile
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('full-width');
    });
    
    // Add checker button
    document.getElementById('addCheckerBtn').addEventListener('click', () => {
        openAddCheckerModal();
    });
    
    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('checkerModal').classList.remove('active');
        });
    });
    
    // Checker form submission
    document.getElementById('checkerForm').addEventListener('submit', saveChecker);
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', searchCheckers);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchCheckers();
    });
    
    // Refresh chart
    document.getElementById('refreshChartBtn').addEventListener('click', async () => {
        await loadCheckersData();
        loadPerformanceChart();
        await loadDashboardData();
        loadCharts();
        showToast('Dashboard refreshed successfully!', 'success');
    });
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');
    
    // Load page-specific data
    if (pageName === 'reports') {
        loadPerformanceChart();
    } else if (pageName === 'dashboard') {
        loadCharts();
    }
}

// ==================== DATA LOADING FUNCTIONS ====================
async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        // Load stats
        const statsResponse = await fetch('http://localhost:5000/api/checkers/stats/performance', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (statsResponse.ok) {
            const result = await statsResponse.json();
            console.log('✅ Stats response:', result);
            
            if (result.success && result.stats) {
                const stats = result.stats;
                
                document.getElementById('totalCheckers').textContent = stats.total_checkers || 0;
                document.getElementById('avgMarks').textContent = parseFloat(stats.avg_marks || 0).toFixed(2);
                document.getElementById('maxMarks').textContent = parseFloat(stats.max_marks || 0).toFixed(2);
                
                // Update test types
                document.getElementById('testTypes').textContent = 
                    `Pre: ${stats.pretest_count || 0} | Post: ${stats.posttest_count || 0}`;
                
                console.log('✅ Stats loaded successfully');
            } else {
                console.error('❌ Stats property not found in response');
            }
        } else {
            console.error('❌ Stats API returned error:', statsResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// ==================== CHART FUNCTIONS ====================

// Load all futuristic charts
async function loadCharts() {
    try {
        console.log('📊 Loading all charts...');
        await Promise.all([
            loadMonthlyTrendChart(),
            loadPerformancePieChart(),
            loadDepartmentChart(),
            loadAgeGroupChart(),
            loadEducationChart(),
            loadUnitPerformanceChart()
        ]);
        console.log('✅ All charts loaded successfully');
    } catch (error) {
        console.error('❌ Error loading charts:', error);
    }
}

// 1. Monthly Trend Chart (Line Chart)
async function loadMonthlyTrendChart() {
    try {
        const response = await fetch('http://localhost:5000/api/checkers/stats/monthly', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const labels = data.data.map(item => item.month);
        const scores = data.data.map(item => parseFloat(item.avg_score || 0));
        
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        
        if (monthlyTrendChart) monthlyTrendChart.destroy();
        
        monthlyTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: scores,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    } catch (error) {
        console.error('Error loading monthly trend chart:', error);
    }
}

// 2. Performance Distribution Pie Chart
async function loadPerformancePieChart() {
    try {
        const response = await fetch('http://localhost:5000/api/checkers/stats/distribution', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const labels = data.data.map(item => item.performance_level);
        const counts = data.data.map(item => item.count);
        
        const colors = [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)'
        ];
        
        const ctx = document.getElementById('performancePieChart').getContext('2d');
        
        if (performancePieChart) performancePieChart.destroy();
        
        performancePieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#1e293b',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1',
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '65%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000
                }
            }
        });
    } catch (error) {
        console.error('Error loading performance pie chart:', error);
    }
}

// 3. Department Performance Chart (Bar Chart)
async function loadDepartmentChart() {
    try {
        const response = await fetch('http://localhost:5000/api/checkers/stats/by-department', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const labels = data.data.map(item => item.department || 'Unknown');
        const avgMarks = data.data.map(item => parseFloat(item.avg_marks || 0));
        
        const ctx = document.getElementById('departmentChart').getContext('2d');
        
        if (departmentChart) departmentChart.destroy();
        
        departmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: avgMarks,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderRadius: 8
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        }
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    } catch (error) {
        console.error('Error loading department chart:', error);
    }
}

// 4. Age Group Analysis (Radar Chart)
async function loadAgeGroupChart() {
    try {
        const response = await fetch('http://localhost:5000/api/checkers/stats/by-age', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const labels = data.data.map(item => item.age_group);
        const avgMarks = data.data.map(item => parseFloat(item.avg_marks || 0));
        
        const ctx = document.getElementById('ageGroupChart').getContext('2d');
        
        if (ageGroupChart) ageGroupChart.destroy();
        
        ageGroupChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Performance',
                    data: avgMarks,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: '#8b5cf6',
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#8b5cf6',
                    pointHoverRadius: 7,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        pointLabels: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            color: '#94a3b8',
                            backdropColor: 'transparent'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1'
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    } catch (error) {
        console.error('Error loading age group chart:', error);
    }
}

// 5. Education vs Performance (Horizontal Bar)
async function loadEducationChart() {
    try {
        const response = await fetch('http://localhost:5000/api/checkers/stats/by-education', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const labels = data.data.map(item => item.education || 'Unknown');
        const avgMarks = data.data.map(item => parseFloat(item.avg_marks || 0));
        
        const ctx = document.getElementById('educationChart').getContext('2d');
        
        if (educationChart) educationChart.destroy();
        
        educationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: avgMarks,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#e2e8f0'
                        }
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    } catch (error) {
        console.error('Error loading education chart:', error);
    }
}

// 6. Unit Performance Comparison (Bar Chart)
async function loadUnitPerformanceChart() {
    try {
        const response = await fetch('http://localhost:5000/api/checkers/stats/by-unit', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const labels = data.data.map(item => item.unit);
        const avgMarks = data.data.map(item => parseFloat(item.avg_marks || 0));
        
        const ctx = document.getElementById('unitPerformanceChart').getContext('2d');
        
        if (unitPerformanceChart) unitPerformanceChart.destroy();
        
        unitPerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: avgMarks,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 8
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#e2e8f0'
                        }
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    } catch (error) {
        console.error('Error loading unit performance chart:', error);
    }
}

// ==================== CHECKERS DATA ====================
async function loadCheckersData() {
    try {
        console.log('📋 Loading checkers data...');
        const response = await fetch('http://localhost:5000/api/checkers', {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Checkers response:', result);
            
            if (result.success && result.data) {
                allCheckers = result.data;
                renderCheckersTable(allCheckers);
                updatePerformanceSummary();
                loadRecentCheckers(allCheckers.slice(0, 10));
                console.log('✅ Loaded', allCheckers.length, 'checkers');
            } else {
                console.error('❌ Invalid checkers data format');
                allCheckers = [];
            }
        } else {
            console.error('❌ Failed to load checkers:', response.status);
            showToast('Failed to load checkers data', 'error');
        }
    } catch (error) {
        console.error('❌ Error loading checkers:', error);
        showToast('Server error while loading checkers', 'error');
    }
}

function renderCheckersTable(checkers) {
    const tbody = document.getElementById('checkersTableBody');
    if (!checkers || checkers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #95a5a6; margin-bottom: 15px;"></i>
                    <p style="color: #7f8c8d; font-size: 16px;">No checkers found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = checkers.map((checker, index) => {
        const marks = parseFloat(checker.test_marks);
        let marksClass = '';
        let marksIcon = '';
        
        if (marks >= 90) {
            marksClass = 'excellent';
            marksIcon = '🏆';
        } else if (marks >= 80) {
            marksClass = 'very-good';
            marksIcon = '⭐';
        } else if (marks >= 70) {
            marksClass = 'good';
            marksIcon = '✓';
        } else if (marks >= 60) {
            marksClass = 'average';
            marksIcon = '📊';
        } else {
            marksClass = 'poor';
            marksIcon = '⚠️';
        }
        
        // Get initials for avatar
        const initials = checker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        
        return `
            <tr>
                <td>
                    <div class="checker-avatar-table">
                        ${checker.profile_picture 
                            ? `<img src="http://localhost:5000${checker.profile_picture}" alt="${checker.name}">`
                            : `<div class="avatar-initials">${initials}</div>`
                        }
                    </div>
                </td>
                <td>${index + 1}</td>
                <td><strong>${checker.name}</strong></td>
                <td><span class="badge">${checker.emp_id}</span></td>
                <td>${checker.designation || '-'}</td>
                <td>${checker.department || '-'}</td>
                <td>${checker.unit}</td>
                <td>
                    <span class="marks-badge marks-${marksClass}">
                        ${marksIcon} ${marks.toFixed(2)}%
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editChecker(${checker.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteChecker(${checker.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load Recent Checkers List
function loadRecentCheckers(checkers) {
    const container = document.getElementById('recentCheckersList');
    
    if (checkers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No recent checkers found</p>';
        return;
    }
    
    const html = checkers.map(checker => {
        const initials = checker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const scoreClass = checker.test_marks >= 85 ? 'score-excellent' : 
                         checker.test_marks >= 70 ? 'score-good' : 'score-average';
        
        return `
            <div class="checker-item">
                <div class="checker-info">
                    <div class="checker-avatar">
                        ${checker.profile_picture 
                            ? `<img src="http://localhost:5000${checker.profile_picture}" alt="${checker.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                            : initials
                        }
                    </div>
                    <div class="checker-details">
                        <h4>${checker.name}</h4>
                        <p>${checker.emp_id} • ${checker.department || 'N/A'} • ${checker.unit || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <span class="score-badge ${scoreClass}">${parseFloat(checker.test_marks).toFixed(1)}%</span>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">${checker.test_type}</p>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// ==================== MODAL FUNCTIONS ====================
function openAddCheckerModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Add New Checker';
    document.getElementById('checkerForm').reset();
    document.getElementById('checkerId').value = '';
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('saveCheckerBtn').innerHTML = '<i class="fas fa-save"></i> <span>Add Checker</span>';
    document.getElementById('checkerModal').classList.add('active');
    
    // Reset picture preview
    resetPicturePreview();
}

async function editChecker(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/checkers/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const checker = result.data;
            
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Checker';
            document.getElementById('checkerId').value = checker.id;
            document.getElementById('name').value = checker.name;
            document.getElementById('empId').value = checker.emp_id;
            document.getElementById('age').value = checker.age || '';
            document.getElementById('designation').value = checker.designation || '';
            document.getElementById('education').value = checker.education || '';
            document.getElementById('jobPeriod').value = checker.job_period || '';
            document.getElementById('unit').value = checker.unit;
            document.getElementById('department').value = checker.department || '';
            document.getElementById('lineSection').value = checker.line_section || '';
            document.getElementById('testMarks').value = checker.test_marks;
            document.getElementById('remarks').value = checker.remarks || '';
            document.getElementById('testType').value = checker.test_type || 'pretest';
            document.getElementById('testDate').value = checker.test_date 
                ? checker.test_date.split('T')[0] 
                : new Date().toISOString().split('T')[0];
            document.getElementById('pretestMarks').value = checker.pretest_marks || '';
            document.getElementById('posttestMarks').value = checker.posttest_marks || '';
            
            // Monthly scores
            document.getElementById('janScore').value = checker.jan_score || '';
            document.getElementById('febScore').value = checker.feb_score || '';
            document.getElementById('marScore').value = checker.mar_score || '';
            document.getElementById('aprScore').value = checker.apr_score || '';
            document.getElementById('mayScore').value = checker.may_score || '';
            document.getElementById('junScore').value = checker.jun_score || '';
            document.getElementById('julScore').value = checker.jul_score || '';
            document.getElementById('augScore').value = checker.aug_score || '';
            document.getElementById('sepScore').value = checker.sep_score || '';
            document.getElementById('octScore').value = checker.oct_score || '';
            document.getElementById('novScore').value = checker.nov_score || '';
            document.getElementById('decScore').value = checker.dec_score || '';
            
            document.getElementById('saveCheckerBtn').innerHTML = '<i class="fas fa-save"></i> <span>Update Checker</span>';
            document.getElementById('checkerModal').classList.add('active');
            
            // Load picture
            await loadCheckerPicture(id);
        }
    } catch (error) {
        console.error('Error loading checker:', error);
        showToast('Failed to load checker details', 'error');
    }
}

async function saveChecker(e) {
    e.preventDefault();
    const id = document.getElementById('checkerId').value;
    const checkerData = {
        name: document.getElementById('name').value.trim(),
        emp_id: document.getElementById('empId').value.trim(),
        age: document.getElementById('age').value ? parseInt(document.getElementById('age').value) : null,
        designation: document.getElementById('designation').value.trim() || null,
        education: document.getElementById('education').value.trim() || null,
        job_period: document.getElementById('jobPeriod').value.trim() || null,
        unit: document.getElementById('unit').value.trim(),
        department: document.getElementById('department').value.trim() || null,
        line_section: document.getElementById('lineSection').value.trim() || null,
        test_marks: parseFloat(document.getElementById('testMarks').value),
        remarks: document.getElementById('remarks').value.trim() || null,
        test_type: document.getElementById('testType').value,
        test_date: document.getElementById('testDate').value,
        pretest_marks: document.getElementById('pretestMarks').value 
            ? parseFloat(document.getElementById('pretestMarks').value) 
            : null,
        posttest_marks: document.getElementById('posttestMarks').value 
            ? parseFloat(document.getElementById('posttestMarks').value) 
            : null,
        jan_score: document.getElementById('janScore').value ? parseFloat(document.getElementById('janScore').value) : null,
        feb_score: document.getElementById('febScore').value ? parseFloat(document.getElementById('febScore').value) : null,
        mar_score: document.getElementById('marScore').value ? parseFloat(document.getElementById('marScore').value) : null,
        apr_score: document.getElementById('aprScore').value ? parseFloat(document.getElementById('aprScore').value) : null,
        may_score: document.getElementById('mayScore').value ? parseFloat(document.getElementById('mayScore').value) : null,
        jun_score: document.getElementById('junScore').value ? parseFloat(document.getElementById('junScore').value) : null,
        jul_score: document.getElementById('julScore').value ? parseFloat(document.getElementById('julScore').value) : null,
        aug_score: document.getElementById('augScore').value ? parseFloat(document.getElementById('augScore').value) : null,
        sep_score: document.getElementById('sepScore').value ? parseFloat(document.getElementById('sepScore').value) : null,
        oct_score: document.getElementById('octScore').value ? parseFloat(document.getElementById('octScore').value) : null,
        nov_score: document.getElementById('novScore').value ? parseFloat(document.getElementById('novScore').value) : null,
        dec_score: document.getElementById('decScore').value ? parseFloat(document.getElementById('decScore').value) : null
    };
    
    // Validate
    if (!checkerData.name || !checkerData.emp_id || !checkerData.unit || isNaN(checkerData.test_marks)) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const saveBtn = document.getElementById('saveCheckerBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Saving...</span>';
    saveBtn.disabled = true;
    
    try {
        const url = id 
            ? `http://localhost:5000/api/checkers/${id}`
            : 'http://localhost:5000/api/checkers';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(checkerData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success
            saveBtn.innerHTML = '<i class="fas fa-check"></i> <span>Saved!</span>';
            saveBtn.style.background = '#27ae60';
            
            setTimeout(() => {
                document.getElementById('checkerModal').classList.remove('active');
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                saveBtn.style.background = '';
                
                // Reload data
                loadCheckersData();
                loadDashboardData();
                loadCharts();
                
                showToast(id ? 'Checker updated successfully!' : 'Checker added successfully!', 'success');
            }, 1000);
        } else {
            showToast(result.error || 'Failed to save checker', 'error');
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error saving checker:', error);
        showToast('Server error. Please try again.', 'error');
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// ==================== CRUD OPERATIONS ====================
async function deleteChecker(id) {
    if (!confirm('Are you sure you want to delete this checker? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/checkers/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showToast('Checker deleted successfully!', 'success');
            await loadCheckersData();
            await loadDashboardData();
            loadCharts();
        } else {
            showToast('Failed to delete checker', 'error');
        }
    } catch (error) {
        console.error('Error deleting checker:', error);
        showToast('Server error. Please try again.', 'error');
    }
}

function searchCheckers() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (query === '') {
        renderCheckersTable(allCheckers);
        return;
    }
    
    const filtered = allCheckers.filter(checker => 
        checker.name.toLowerCase().includes(query) ||
        checker.emp_id.toLowerCase().includes(query) ||
        checker.unit.toLowerCase().includes(query)
    );
    
    renderCheckersTable(filtered);
    showToast(`Found ${filtered.length} result(s)`, 'info');
}

// ==================== SUMMARY FUNCTIONS ====================
function updatePerformanceSummary() {
    if (allCheckers.length === 0) return;
    
    // Total checkers
    document.getElementById('summaryTotal').textContent = allCheckers.length;
    
    // Average score
    const avg = allCheckers.reduce((acc, c) => acc + parseFloat(c.test_marks), 0) / allCheckers.length;
    document.getElementById('summaryAvg').textContent = `${avg.toFixed(2)}%`;
    
    // Best performer
    const best = allCheckers.reduce((max, c) => 
        parseFloat(c.test_marks) > parseFloat(max.test_marks) ? c : max
    );
    document.getElementById('summaryBest').textContent = `${best.name} (${parseFloat(best.test_marks).toFixed(2)}%)`;
    
    // Lowest score
    const lowest = allCheckers.reduce((min, c) => 
        parseFloat(c.test_marks) < parseFloat(min.test_marks) ? c : min
    );
    document.getElementById('summaryLow').textContent = `${lowest.name} (${parseFloat(lowest.test_marks).toFixed(2)}%)`;
}

// ==================== PICTURE UPLOAD FUNCTIONS ====================

// Initialize picture upload
function setupPictureUpload() {
    const uploadBtn = document.getElementById('uploadPictureBtn');
    const pictureInput = document.getElementById('pictureInput');
    const previewImage = document.getElementById('previewImage');
    const picturePlaceholder = document.getElementById('picturePlaceholder');
    const deleteBtn = document.getElementById('deletePictureBtn');
    
    // Upload button click
    uploadBtn.addEventListener('click', () => {
        pictureInput.click();
    });
    
    // File selection
    pictureInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            pictureInput.value = '';
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            picturePlaceholder.style.display = 'none';
            deleteBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
        
        // Upload to server
        await uploadPicture(file);
    });
    
    // Delete picture
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove this picture?')) {
            await deletePicture();
        }
    });
}

// Upload picture to server
async function uploadPicture(file) {
    const checkerId = document.getElementById('checkerId').value;
    if (!checkerId) {
        showToast('Please save the checker first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('picture', file);
    
    try {
        const response = await fetch(`http://localhost:5000/api/checkers/${checkerId}/upload-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToast('Picture uploaded successfully!', 'success');
        } else {
            showToast(result.error || 'Failed to upload picture', 'error');
            // Reset preview
            resetPicturePreview();
        }
    } catch (error) {
        console.error('Error uploading picture:', error);
        showToast('Server error. Please try again.', 'error');
        resetPicturePreview();
    }
}

// Delete picture from server
async function deletePicture() {
    const checkerId = document.getElementById('checkerId').value;
    if (!checkerId) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/checkers/${checkerId}/delete-picture`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            resetPicturePreview();
            showToast('Picture removed successfully!', 'success');
        } else {
            showToast(result.error || 'Failed to delete picture', 'error');
        }
    } catch (error) {
        console.error('Error deleting picture:', error);
        showToast('Server error. Please try again.', 'error');
    }
}

// Reset picture preview
function resetPicturePreview() {
    const previewImage = document.getElementById('previewImage');
    const picturePlaceholder = document.getElementById('picturePlaceholder');
    const deleteBtn = document.getElementById('deletePictureBtn');
    
    previewImage.src = '';
    previewImage.style.display = 'none';
    picturePlaceholder.style.display = 'block';
    deleteBtn.style.display = 'none';
    document.getElementById('pictureInput').value = '';
}

// Load existing picture when editing
async function loadCheckerPicture(checkerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/checkers/${checkerId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const checker = result.data;
            
            if (checker && checker.profile_picture) {
                const previewImage = document.getElementById('previewImage');
                const picturePlaceholder = document.getElementById('picturePlaceholder');
                const deleteBtn = document.getElementById('deletePictureBtn');
                
                previewImage.src = `http://localhost:5000${checker.profile_picture}`;
                previewImage.style.display = 'block';
                picturePlaceholder.style.display = 'none';
                deleteBtn.style.display = 'inline-flex';
            }
        }
    } catch (error) {
        console.error('Error loading checker picture:', error);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.getElementById('toastNotification');
    if (existing) existing.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Filter Chart Data
function filterChart(chartType, period) {
    console.log(`Filter ${chartType} for ${period}`);
    // Implement filtering logic based on your API
}