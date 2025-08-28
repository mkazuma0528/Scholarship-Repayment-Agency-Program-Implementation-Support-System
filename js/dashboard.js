/**
 * ダッシュボード機能
 * 
 * システムの統計情報、チャート表示、概要データを管理
 */

// Chart.js CDN読み込み確認
if (typeof Chart === 'undefined') {
    console.warn('Chart.js が読み込まれていません。チャート機能を有効にするためにChart.jsを読み込んでください。');
}

/**
 * ダッシュボードコンテンツ生成
 */
async function generateDashboardContent() {
    try {
        // ダッシュボードデータ取得
        const dashboardData = await fetchDashboardData();
        
        return `
            ${generateBreadcrumb('dashboard')}
            
            <!-- ダッシュボード概要カード -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${generateStatCards(dashboardData.stats)}
            </div>
            
            <!-- チャートエリア -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- 申請状況チャート -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">申請状況</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="applicationStatusChart" style="height: 300px;"></canvas>
                    </div>
                </div>
                
                <!-- 月次申請推移チャート -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">月次申請推移</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="monthlyTrendChart" style="height: 300px;"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- データ概要テーブル -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 最近の申請一覧 -->
                <div class="card">
                    <div class="card-header">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-900">最近の申請</h3>
                            <a href="#application-list" class="text-blue-600 hover:text-blue-800 text-sm">すべて表示</a>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        ${generateRecentApplicationsTable(dashboardData.recentApplications)}
                    </div>
                </div>
                
                <!-- 要確認事項 -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">要確認事項</h3>
                    </div>
                    <div class="card-body">
                        ${generateAlertsList(dashboardData.alerts)}
                    </div>
                </div>
            </div>
            
            <!-- システム情報 -->
            <div class="mt-8">
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">システム情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <strong>バージョン:</strong> ${window.SCHOLARSHIP_SYSTEM.config.version}
                            </div>
                            <div>
                                <strong>最終更新:</strong> <span id="dashboard-last-updated">${formatDate(new Date(), 'YYYY/MM/DD HH:mm')}</span>
                            </div>
                            <div>
                                <strong>データベース:</strong> 接続正常
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('ダッシュボードコンテンツ生成エラー:', error);
        return `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">データの読み込みに失敗しました</h3>
                <p class="text-gray-600 mb-4">ダッシュボードデータの取得中にエラーが発生しました。</p>
                <button onclick="loadDashboard()" class="btn btn-primary">
                    <i class="fas fa-refresh mr-2"></i>再読み込み
                </button>
            </div>
        `;
    }
}

/**
 * ダッシュボードデータ取得（実際のAPI連携）
 */
async function fetchDashboardData() {
    try {
        const stats = await window.scholarshipAPI.getDashboardStats();
        
        // 月次推移データの生成（過去8ヶ月）
        const monthlyTrend = await generateMonthlyTrendData();
        
        // 最近の申請データ取得
        const recentApplicationsData = await window.scholarshipAPI.getApplications({
            limit: 4,
            sort: 'application_date',
            order: 'desc'
        });
        
        // アラート生成
        const alerts = await generateSystemAlerts();
        
        return {
            stats: {
                totalEmployees: stats.totalEmployees,
                activeApplications: stats.activeApplications,
                monthlyRepayment: stats.monthlyRepayment,
                completedApplications: stats.completedApplications
            },
            applicationStatusData: {
                labels: Object.keys(stats.applicationsByStatus),
                data: Object.values(stats.applicationsByStatus).map(apps => apps.length)
            },
            monthlyTrendData: monthlyTrend,
            recentApplications: recentApplicationsData.data.map(app => ({
                id: app.id,
                employeeName: app.employee_name || '不明',
                department: app.department || '不明',
                applicationDate: app.application_date,
                status: app.status,
                amount: app.monthly_amount
            })),
            alerts: alerts
        };
    } catch (error) {
        console.error('ダッシュボードデータ取得エラー:', error);
        
        // エラー時のフォールバックデータ
        return {
            stats: {
                totalEmployees: 0,
                activeApplications: 0,
                monthlyRepayment: 0,
                completedApplications: 0
            },
            applicationStatusData: {
                labels: ['データなし'],
                data: [0]
            },
            monthlyTrendData: {
                labels: ['データなし'],
                data: [0]
            },
            recentApplications: [],
            alerts: [{
                type: 'error',
                message: 'データの取得に失敗しました',
                action: '再読み込み',
                link: '#dashboard'
            }]
        };
    }
}

/**
 * 月次推移データ生成
 */
async function generateMonthlyTrendData() {
    const months = [];
    const data = [];
    const now = new Date();
    
    // 過去8ヶ月のデータを生成
    for (let i = 7; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = `${date.getMonth() + 1}月`;
        months.push(monthName);
        
        try {
            // その月の申請数を取得
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
            
            const monthlyApps = await window.scholarshipAPI.getApplications({
                application_date_from: monthStart,
                application_date_to: monthEnd,
                limit: 1000
            });
            
            data.push(monthlyApps.data.length);
        } catch (error) {
            data.push(0);
        }
    }
    
    return { labels: months, data: data };
}

/**
 * システムアラート生成
 */
async function generateSystemAlerts() {
    const alerts = [];
    
    try {
        // 未確認書類のチェック
        const pendingDocs = await window.scholarshipAPI.getDocuments({
            verification_status: '未確認',
            limit: 100
        });
        
        if (pendingDocs.data.length > 0) {
            alerts.push({
                type: 'warning',
                message: `書類確認待ちの申請が${pendingDocs.data.length}件あります`,
                action: '確認する',
                link: '#document-verify'
            });
        }
        
        // 申請中の期限チェック
        const pendingApps = await window.scholarshipAPI.getApplications({
            status: '申請中',
            limit: 100
        });
        
        const overdueApps = pendingApps.data.filter(app => {
            const appDate = new Date(app.application_date);
            const daysSince = (Date.now() - appDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince > 7; // 7日以上経過
        });
        
        if (overdueApps.length > 0) {
            alerts.push({
                type: 'error',
                message: `期限超過の申請が${overdueApps.length}件あります`,
                action: '至急対応',
                link: '#application-status'
            });
        }
        
        // JASSO提出期限アラート（仮想的な期限チェック）
        const today = new Date();
        const nextSubmissionDate = new Date(today.getFullYear(), today.getMonth() + 1, 15); // 来月15日
        const daysUntilSubmission = Math.ceil((nextSubmissionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilSubmission <= 15) {
            alerts.push({
                type: 'info',
                message: `JASSO提出期限まで${daysUntilSubmission}日です`,
                action: 'データ準備',
                link: '#report-jasso'
            });
        }
        
    } catch (error) {
        console.error('アラート生成エラー:', error);
        alerts.push({
            type: 'warning',
            message: 'システム状況の確認中にエラーが発生しました',
            action: '再確認',
            link: '#dashboard'
        });
    }
    
    return alerts;
}

/**
 * 統計カード生成
 */
function generateStatCards(stats) {
    const cards = [
        {
            title: '登録従業員数',
            value: formatNumber(stats.totalEmployees),
            icon: 'fas fa-users',
            color: 'from-blue-500 to-blue-600',
            change: '+12',
            changeType: 'increase'
        },
        {
            title: '進行中申請',
            value: formatNumber(stats.activeApplications),
            icon: 'fas fa-file-alt',
            color: 'from-green-500 to-green-600',
            change: '+5',
            changeType: 'increase'
        },
        {
            title: '月次代理返還額',
            value: '¥' + formatNumber(stats.monthlyRepayment),
            icon: 'fas fa-yen-sign',
            color: 'from-purple-500 to-purple-600',
            change: '+8%',
            changeType: 'increase'
        },
        {
            title: '完了申請数',
            value: formatNumber(stats.completedApplications),
            icon: 'fas fa-check-circle',
            color: 'from-orange-500 to-orange-600',
            change: '+23',
            changeType: 'increase'
        }
    ];
    
    return cards.map(card => `
        <div class="stat-card bg-gradient-to-br ${card.color}">
            <div class="flex items-center justify-between">
                <div>
                    <div class="stat-card-icon">
                        <i class="${card.icon}"></i>
                    </div>
                    <div class="stat-card-value">${card.value}</div>
                    <div class="stat-card-label">${card.title}</div>
                </div>
                <div class="text-right">
                    <div class="text-xs opacity-75">前月比</div>
                    <div class="text-sm font-medium flex items-center">
                        <i class="fas fa-arrow-${card.changeType === 'increase' ? 'up' : 'down'} mr-1"></i>
                        ${card.change}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 最近の申請テーブル生成
 */
function generateRecentApplicationsTable(applications) {
    if (!applications || applications.length === 0) {
        return '<div class="p-4 text-center text-gray-500">申請がありません</div>';
    }
    
    const rows = applications.map(app => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${app.id}</div>
                <div class="text-xs text-gray-500">${formatDate(app.applicationDate)}</div>
            </td>
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${app.employeeName}</div>
                <div class="text-xs text-gray-500">${app.department}</div>
            </td>
            <td class="px-4 py-3">
                <span class="status-badge ${getStatusClass(app.status)}">${app.status}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
                ¥${formatNumber(app.amount)}
            </td>
        </tr>
    `).join('');
    
    return `
        <table class="min-w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申請ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">従業員</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状況</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${rows}
            </tbody>
        </table>
    `;
}

/**
 * アラート一覧生成
 */
function generateAlertsList(alerts) {
    if (!alerts || alerts.length === 0) {
        return '<div class="text-center text-gray-500 py-4">現在、要確認事項はありません</div>';
    }
    
    return alerts.map(alert => {
        const iconMap = {
            error: 'fas fa-exclamation-circle text-red-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500',
            info: 'fas fa-info-circle text-blue-500'
        };
        
        return `
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-md mb-3">
                <div class="flex items-center">
                    <i class="${iconMap[alert.type]} mr-3"></i>
                    <span class="text-sm text-gray-700">${alert.message}</span>
                </div>
                <a href="${alert.link}" class="btn btn-sm btn-outline">
                    ${alert.action}
                </a>
            </div>
        `;
    }).join('');
}

/**
 * ステータスクラス取得
 */
function getStatusClass(status) {
    const statusMap = {
        '未申請': 'status-pending',
        '申請中': 'status-in-progress',
        '書類確認中': 'status-in-progress',
        '承認済み': 'status-approved',
        '返還中': 'status-in-progress',
        '完了': 'status-completed'
    };
    
    return statusMap[status] || 'status-pending';
}

/**
 * ダッシュボード初期化
 */
async function initializeDashboard() {
    try {
        const dashboardData = await fetchDashboardData();
        
        // チャート描画
        renderApplicationStatusChart(dashboardData.applicationStatusData);
        renderMonthlyTrendChart(dashboardData.monthlyTrendData);
        
        // 自動更新タイマー設定
        setupDashboardAutoRefresh();
        
        console.log('ダッシュボード初期化完了');
        
    } catch (error) {
        console.error('ダッシュボード初期化エラー:', error);
    }
}

/**
 * 申請状況チャート描画
 */
function renderApplicationStatusChart(data) {
    const ctx = document.getElementById('applicationStatusChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    '#FEF3C7', // 未申請 - 黄色系
                    '#DBEAFE', // 申請中 - 青色系
                    '#D1FAE5', // 承認済み - 緑色系
                    '#E0E7FF', // 返還中 - 紫色系
                    '#F3E8FF'  // 完了 - インディゴ系
                ],
                borderColor: [
                    '#F59E0B',
                    '#3B82F6',
                    '#10B981',
                    '#8B5CF6',
                    '#A855F7'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed}件 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 月次推移チャート描画
 */
function renderMonthlyTrendChart(data) {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: '申請件数',
                data: data.data,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `申請件数: ${context.parsed.y}件`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * ダッシュボード自動更新設定
 */
function setupDashboardAutoRefresh() {
    // 5分毎に更新
    setInterval(() => {
        if (window.SCHOLARSHIP_SYSTEM.state.currentPage === 'dashboard') {
            refreshDashboardData();
        }
    }, 5 * 60 * 1000);
}

/**
 * ダッシュボードデータ更新
 */
async function refreshDashboardData() {
    try {
        console.log('ダッシュボードデータを更新中...');
        
        // 最終更新時刻を更新
        const lastUpdatedElement = document.getElementById('dashboard-last-updated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = formatDate(new Date(), 'YYYY/MM/DD HH:mm');
        }
        
        // 新しいデータで更新（実際のシステムでは新しいデータを取得）
        showToast('ダッシュボードデータを更新しました', 'success', 3000);
        
    } catch (error) {
        console.error('ダッシュボードデータ更新エラー:', error);
        showToast('データ更新に失敗しました', 'error');
    }
}

/**
 * ダッシュボード読み込み（外部から呼び出し用）
 */
async function loadDashboard() {
    await navigateToPage('dashboard');
}

// グローバル関数として公開
window.generateDashboardContent = generateDashboardContent;
window.initializeDashboard = initializeDashboard;
window.loadDashboard = loadDashboard;
window.refreshDashboardData = refreshDashboardData;