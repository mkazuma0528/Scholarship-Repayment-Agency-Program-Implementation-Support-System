/**
 * 申請管理機能
 * 
 * 新規申請、申請一覧、ステータス管理機能を提供
 */

/**
 * 新規申請画面生成
 */
async function generateApplicationNewContent() {
    const employees = await fetchEmployees();
    
    return `
        ${generateBreadcrumb('application-new')}
        
        <div class="max-w-4xl mx-auto">
            <!-- ページヘッダー -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">新規申請</h2>
                <p class="text-gray-600">奨学金代理返還の新しい申請を作成します。</p>
            </div>
            
            <!-- 申請フォープ -->
            <form id="application-form" class="space-y-8">
                <!-- 基本情報セクション -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">申請基本情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- 対象従業員 -->
                            <div class="form-group">
                                <label class="form-label required" for="application_employee">対象従業員</label>
                                <select id="application_employee" name="employee_id" class="form-input form-select" required onchange="loadEmployeeInfo()">
                                    <option value="">従業員を選択してください</option>
                                    ${employees.map(emp => `
                                        <option value="${emp.id}" data-name="${emp.full_name}" data-number="${emp.employee_number}">
                                            ${emp.full_name} (${emp.employee_number})
                                        </option>
                                    `).join('')}
                                </select>
                                <div class="form-error" id="employee_id_error"></div>
                            </div>
                            
                            <!-- 申請日 -->
                            <div class="form-group">
                                <label class="form-label required" for="application_date">申請日</label>
                                <input type="date" id="application_date" name="application_date" class="form-input" 
                                       required value="${formatDate(new Date(), 'YYYY-MM-DD')}">
                                <div class="form-error" id="application_date_error"></div>
                            </div>
                            
                            <!-- 申請対象期間開始 -->
                            <div class="form-group">
                                <label class="form-label required" for="application_period_start">申請対象期間（開始）</label>
                                <input type="date" id="application_period_start" name="application_period_start" class="form-input" required>
                                <div class="form-error" id="application_period_start_error"></div>
                            </div>
                            
                            <!-- 申請対象期間終了 -->
                            <div class="form-group">
                                <label class="form-label required" for="application_period_end">申請対象期間（終了）</label>
                                <input type="date" id="application_period_end" name="application_period_end" class="form-input" required>
                                <div class="form-error" id="application_period_end_error"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 従業員情報表示（選択時） -->
                <div id="employee-info-section" class="card hidden">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">従業員情報</h3>
                    </div>
                    <div class="card-body">
                        <div id="employee-info-content">
                            <!-- 従業員情報がここに表示される -->
                        </div>
                    </div>
                </div>
                
                <!-- 代理返還情報セクション -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">代理返還情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- 代理返還開始日 -->
                            <div class="form-group">
                                <label class="form-label required" for="repayment_start_date">代理返還開始日</label>
                                <input type="date" id="repayment_start_date" name="repayment_start_date" class="form-input" required>
                                <div class="form-error" id="repayment_start_date_error"></div>
                            </div>
                            
                            <!-- 代理返還終了日（予定） -->
                            <div class="form-group">
                                <label class="form-label" for="repayment_end_date">代理返還終了日（予定）</label>
                                <input type="date" id="repayment_end_date" name="repayment_end_date" class="form-input">
                            </div>
                            
                            <!-- 月次代理返還額 -->
                            <div class="form-group">
                                <label class="form-label required" for="monthly_amount">月次代理返還額（円）</label>
                                <input type="number" id="monthly_amount" name="monthly_amount" class="form-input" 
                                       required min="1" max="999999" placeholder="例: 25000">
                                <div class="form-error" id="monthly_amount_error"></div>
                            </div>
                            
                            <!-- 累計代理返還予定額 -->
                            <div class="form-group">
                                <label class="form-label" for="total_estimated_amount">累計代理返還予定額（円）</label>
                                <input type="number" id="total_estimated_amount" name="total_estimated_amount" class="form-input" 
                                       readonly placeholder="自動計算されます">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 申請詳細セクション -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">申請詳細</h3>
                    </div>
                    <div class="card-body">
                        <div class="space-y-6">
                            <!-- 申請理由・備考 -->
                            <div class="form-group">
                                <label class="form-label" for="notes">申請理由・備考</label>
                                <textarea id="notes" name="notes" class="form-input" rows="4" 
                                          placeholder="申請理由や特記事項があれば記入してください"></textarea>
                            </div>
                            
                            <!-- 提出書類チェックリスト -->
                            <div>
                                <label class="form-label">提出書類チェックリスト</label>
                                <div class="mt-2 space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" class="form-checkbox" name="documents[]" value="奨学金返還証明書">
                                        <span class="ml-2 text-sm text-gray-700">奨学金返還証明書</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="form-checkbox" name="documents[]" value="在学証明書">
                                        <span class="ml-2 text-sm text-gray-700">在学証明書</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="form-checkbox" name="documents[]" value="卒業証明書">
                                        <span class="ml-2 text-sm text-gray-700">卒業証明書</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="form-checkbox" name="documents[]" value="収入証明書">
                                        <span class="ml-2 text-sm text-gray-700">収入証明書</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="form-checkbox" name="documents[]" value="住民票">
                                        <span class="ml-2 text-sm text-gray-700">住民票</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- フォーム操作ボタン -->
                <div class="flex justify-end space-x-4 pt-6 border-t">
                    <button type="button" id="application-cancel-btn" class="btn btn-outline">
                        <i class="fas fa-times mr-2"></i>キャンセル
                    </button>
                    <button type="button" id="application-preview-btn" class="btn btn-secondary">
                        <i class="fas fa-eye mr-2"></i>プレビュー
                    </button>
                    <button type="button" id="application-draft-btn" class="btn btn-secondary">
                        <i class="fas fa-save mr-2"></i>下書き保存
                    </button>
                    <button type="submit" id="application-submit-btn" class="btn btn-primary">
                        <i class="fas fa-paper-plane mr-2"></i>申請提出
                    </button>
                </div>
            </form>
        </div>
    `;
}

/**
 * 申請一覧画面生成
 */
async function generateApplicationListContent() {
    const applications = await fetchApplications();
    
    return `
        ${generateBreadcrumb('application-list')}
        
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">申請一覧</h2>
                    <p class="text-gray-600">奨学金代理返還申請の一覧です。</p>
                </div>
                <div class="flex space-x-3">
                    <button onclick="exportApplicationsToCSV()" class="btn btn-outline">
                        <i class="fas fa-download mr-2"></i>CSV出力
                    </button>
                    <a href="#application-new" class="btn btn-primary">
                        <i class="fas fa-plus mr-2"></i>新規申請
                    </a>
                </div>
            </div>
        </div>
        
        <!-- 統計カード -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            ${generateApplicationStatsCards(applications)}
        </div>
        
        <!-- 検索・フィルター -->
        <div class="card mb-6">
            <div class="card-body">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <input type="search" id="application-search" class="form-input" 
                               placeholder="申請ID・従業員名で検索" onkeyup="filterApplications()">
                    </div>
                    <div>
                        <select id="application-status-filter" class="form-input form-select" onchange="filterApplications()">
                            <option value="">全ステータス</option>
                            <option value="未申請">未申請</option>
                            <option value="申請中">申請中</option>
                            <option value="承認済み">承認済み</option>
                            <option value="返還中">返還中</option>
                            <option value="完了">完了</option>
                            <option value="差し戻し">差し戻し</option>
                        </select>
                    </div>
                    <div>
                        <select id="application-department-filter" class="form-input form-select" onchange="filterApplications()">
                            <option value="">全部署</option>
                            <option value="人事部">人事部</option>
                            <option value="総務部">総務部</option>
                            <option value="営業部">営業部</option>
                            <option value="開発部">開発部</option>
                            <option value="企画部">企画部</option>
                            <option value="経理部">経理部</option>
                        </select>
                    </div>
                    <div>
                        <input type="month" id="application-month-filter" class="form-input" onchange="filterApplications()">
                    </div>
                    <div>
                        <button onclick="clearApplicationFilters()" class="btn btn-outline w-full">
                            <i class="fas fa-eraser mr-2"></i>フィルタークリア
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 申請テーブル -->
        <div class="card">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table" data-sortable>
                        <thead>
                            <tr>
                                <th data-sort="text">申請ID</th>
                                <th data-sort="text">従業員</th>
                                <th data-sort="text">部署</th>
                                <th data-sort="text">ステータス</th>
                                <th data-sort="number">月次返還額</th>
                                <th data-sort="date">申請日</th>
                                <th data-sort="date">開始予定日</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="application-table-body">
                            ${generateApplicationRows(applications)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- ページネーション -->
        <div class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-600">
                <span id="application-count">全${applications.length}件中 1-${Math.min(10, applications.length)}件을 表示</span>
            </div>
            <div class="flex space-x-2" id="application-pagination">
                <!-- ページネーションボタンがここに動的生成される -->
            </div>
        </div>
    `;
}

/**
 * 申請ステータス管理画面生成
 */
async function generateApplicationStatusContent() {
    const applications = await fetchApplications();
    const statusGroups = groupApplicationsByStatus(applications);
    
    return `
        ${generateBreadcrumb('application-status')}
        
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">申請ステータス管理</h2>
            <p class="text-gray-600">申請の進行状況を管理し、ステータスの更新を行います。</p>
        </div>
        
        <!-- ステータス別統計 -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            ${Object.entries(statusGroups).map(([status, apps]) => `
                <div class="stat-card bg-gradient-to-br ${getStatusGradient(status)}">
                    <div class="stat-card-icon">
                        <i class="${getStatusIcon(status)}"></i>
                    </div>
                    <div class="stat-card-value">${apps.length}</div>
                    <div class="stat-card-label">${status}</div>
                </div>
            `).join('')}
        </div>
        
        <!-- カンバンボード風ステータス管理 -->
        <div class="grid gap-6 lg:grid-cols-3">
            ${generateStatusColumns(statusGroups)}
        </div>
        
        <!-- 一括ステータス更新 -->
        <div class="mt-8">
            <div class="card">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">一括ステータス更新</h3>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="form-label" for="bulk-status-from">変更前ステータス</label>
                            <select id="bulk-status-from" class="form-input form-select">
                                <option value="">選択してください</option>
                                <option value="申請中">申請中</option>
                                <option value="承認済み">承認済み</option>
                                <option value="返還中">返還中</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" for="bulk-status-to">変更後ステータス</label>
                            <select id="bulk-status-to" class="form-input form-select">
                                <option value="">選択してください</option>
                                <option value="承認済み">承認済み</option>
                                <option value="返還中">返還中</option>
                                <option value="完了">完了</option>
                                <option value="差し戻し">差し戻し</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" for="bulk-update-reason">変更理由</label>
                            <input type="text" id="bulk-update-reason" class="form-input" placeholder="理由を入力">
                        </div>
                        <div class="flex items-end">
                            <button onclick="executeBulkStatusUpdate()" class="btn btn-primary w-full">
                                <i class="fas fa-sync-alt mr-2"></i>一括更新実行
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 申請データ取得（実際のAPI連携）
 */
async function fetchApplications(params = {}) {
    try {
        const response = await window.scholarshipAPI.getApplications({
            limit: params.limit || 100,
            page: params.page || 1,
            search: params.search || '',
            ...params
        });
        
        // 従業員情報をマッピング
        const employeesResponse = await window.scholarshipAPI.getEmployees({ limit: 1000 });
        const employeesMap = new Map(employeesResponse.data.map(emp => [emp.id, emp]));
        
        return response.data.map(app => {
            const employee = employeesMap.get(app.employee_id) || {};
            return {
                ...app,
                employee_name: employee.full_name || '不明',
                department: employee.department || '不明'
            };
        });
    } catch (error) {
        console.error('申請データ取得エラー:', error);
        showToast('申請データの取得に失敗しました', 'error');
        return [];
    }
}

/**
 * 申請統計カード生成
 */
function generateApplicationStatsCards(applications) {
    const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === '申請中').length,
        approved: applications.filter(app => app.status === '承認済み').length,
        active: applications.filter(app => app.status === '返還中').length,
        completed: applications.filter(app => app.status === '完了').length
    };
    
    const cards = [
        { title: '総申請数', value: stats.total, icon: 'fas fa-file-alt', color: 'from-blue-500 to-blue-600' },
        { title: '申請中', value: stats.pending, icon: 'fas fa-clock', color: 'from-yellow-500 to-yellow-600' },
        { title: '承認済み', value: stats.approved, icon: 'fas fa-check', color: 'from-green-500 to-green-600' },
        { title: '返還中', value: stats.active, icon: 'fas fa-arrow-right', color: 'from-purple-500 to-purple-600' }
    ];
    
    return cards.map(card => `
        <div class="stat-card bg-gradient-to-br ${card.color}">
            <div class="stat-card-icon">
                <i class="${card.icon}"></i>
            </div>
            <div class="stat-card-value">${card.value}</div>
            <div class="stat-card-label">${card.title}</div>
        </div>
    `).join('');
}

/**
 * 申請テーブル行生成
 */
function generateApplicationRows(applications) {
    return applications.map(app => `
        <tr>
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${app.id}</div>
                <div class="text-xs text-gray-500">${formatDate(app.application_date)}</div>
            </td>
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${app.employee_name}</div>
                <div class="text-xs text-gray-500">${app.employee_id}</div>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${app.department}</span>
            </td>
            <td class="px-4 py-3">
                <span class="status-badge ${getApplicationStatusClass(app.status)}">${app.status}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm font-medium text-gray-900">¥${formatNumber(app.monthly_amount)}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${formatDate(app.application_date)}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${formatDate(app.repayment_start_date)}</span>
            </td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button onclick="viewApplication('${app.id}')" class="text-blue-600 hover:text-blue-800" title="詳細表示">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editApplication('${app.id}')" class="text-green-600 hover:text-green-800" title="編集">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="updateApplicationStatus('${app.id}')" class="text-purple-600 hover:text-purple-800" title="ステータス更新">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * ステータス別申請グループ化
 */
function groupApplicationsByStatus(applications) {
    return applications.reduce((groups, app) => {
        const status = app.status;
        if (!groups[status]) groups[status] = [];
        groups[status].push(app);
        return groups;
    }, {});
}

/**
 * ステータスカラム生成
 */
function generateStatusColumns(statusGroups) {
    const priorityStatuses = ['申請中', '承認済み', '返還中'];
    
    return priorityStatuses.map(status => {
        const apps = statusGroups[status] || [];
        return `
            <div class="card">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <h3 class="font-semibold text-gray-900">${status}</h3>
                        <span class="status-badge ${getApplicationStatusClass(status)}">${apps.length}</span>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        ${apps.map(app => `
                            <div class="p-4 hover:bg-gray-50 cursor-pointer" onclick="viewApplication('${app.id}')">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="text-sm font-medium text-gray-900">${app.id}</div>
                                    <button onclick="event.stopPropagation(); updateApplicationStatus('${app.id}')" 
                                            class="text-xs text-blue-600 hover:text-blue-800">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                                <div class="text-sm text-gray-600">${app.employee_name}</div>
                                <div class="text-xs text-gray-500">${app.department}</div>
                                <div class="text-xs text-gray-500 mt-1">¥${formatNumber(app.monthly_amount)}/月</div>
                            </div>
                        `).join('')}
                        ${apps.length === 0 ? '<div class="p-4 text-center text-gray-500 text-sm">該当なし</div>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 申請ステータスクラス取得
 */
function getApplicationStatusClass(status) {
    const statusMap = {
        '未申請': 'status-pending',
        '申請中': 'status-in-progress',
        '承認済み': 'status-approved',
        '返還中': 'status-in-progress',
        '完了': 'status-completed',
        '差し戻し': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
}

/**
 * ステータス色取得
 */
function getStatusGradient(status) {
    const gradients = {
        '未申請': 'from-gray-400 to-gray-500',
        '申請中': 'from-yellow-400 to-yellow-500',
        '承認済み': 'from-green-400 to-green-500',
        '返還中': 'from-blue-400 to-blue-500',
        '完了': 'from-purple-400 to-purple-500',
        '差し戻し': 'from-red-400 to-red-500'
    };
    return gradients[status] || 'from-gray-400 to-gray-500';
}

/**
 * ステータスアイコン取得
 */
function getStatusIcon(status) {
    const icons = {
        '未申請': 'fas fa-file',
        '申請中': 'fas fa-clock',
        '承認済み': 'fas fa-check',
        '返還中': 'fas fa-arrow-right',
        '完了': 'fas fa-check-circle',
        '差し戻し': 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-file';
}

/**
 * 従業員情報読み込み
 */
async function loadEmployeeInfo() {
    const select = document.getElementById('application_employee');
    if (!select || !select.value) return;
    
    const employeeId = select.value;
    const option = select.querySelector(`option[value="${employeeId}"]`);
    
    if (option) {
        const employeeName = option.dataset.name;
        const employeeNumber = option.dataset.number;
        
        // 従業員詳細情報を取得（模擬）
        const employeeInfo = await fetchEmployeeDetails(employeeId);
        
        const infoSection = document.getElementById('employee-info-section');
        const infoContent = document.getElementById('employee-info-content');
        
        infoContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h5 class="font-medium text-gray-900 mb-2">基本情報</h5>
                    <div class="text-sm space-y-1">
                        <div><strong>氏名:</strong> ${employeeName}</div>
                        <div><strong>社員番号:</strong> ${employeeNumber}</div>
                        <div><strong>部署:</strong> ${employeeInfo.department}</div>
                        <div><strong>入社日:</strong> ${formatDate(employeeInfo.hire_date)}</div>
                    </div>
                </div>
                <div>
                    <h5 class="font-medium text-gray-900 mb-2">奨学金情報</h5>
                    <div class="text-sm space-y-1">
                        <div><strong>奨学生番号:</strong> ${employeeInfo.scholarship_number}</div>
                        <div><strong>奨学金種別:</strong> ${employeeInfo.scholarship_type}</div>
                        <div><strong>月次返還額:</strong> ¥${formatNumber(employeeInfo.monthly_repayment_amount)}</div>
                        <div><strong>残債額:</strong> ¥${formatNumber(employeeInfo.remaining_amount)}</div>
                    </div>
                </div>
                <div>
                    <h5 class="font-medium text-gray-900 mb-2">申請履歴</h5>
                    <div class="text-sm text-gray-600">
                        過去の申請: ${employeeInfo.past_applications}件
                    </div>
                </div>
            </div>
        `;
        
        infoSection.classList.remove('hidden');
        
        // 月次返還額を自動入力
        document.getElementById('monthly_amount').value = employeeInfo.monthly_repayment_amount;
    }
}

/**
 * 従業員詳細情報取得（実際のAPI連携）
 */
async function fetchEmployeeDetails(employeeId) {
    try {
        const employee = await window.scholarshipAPI.getEmployee(employeeId);
        
        // 過去の申請履歴を取得
        const pastApplications = await window.scholarshipAPI.getApplications({
            employee_id: employeeId,
            limit: 100
        });
        
        return {
            department: employee.department || '',
            hire_date: employee.hire_date || '',
            scholarship_number: employee.scholarship_number || '',
            scholarship_type: employee.scholarship_type || '',
            monthly_repayment_amount: employee.monthly_repayment_amount || 0,
            remaining_amount: employee.remaining_amount || 0,
            total_loan_amount: employee.total_loan_amount || 0,
            past_applications: pastApplications.data.length
        };
    } catch (error) {
        console.error('従業員詳細取得エラー:', error);
        return {
            department: '不明',
            hire_date: '',
            scholarship_number: '',
            scholarship_type: '',
            monthly_repayment_amount: 0,
            remaining_amount: 0,
            total_loan_amount: 0,
            past_applications: 0
        };
    }
}

/**
 * 申請フォーム処理
 */
async function handleApplicationFormSubmit(form) {
    try {
        showLoadingSpinner();
        
        const formData = new FormData(form);
        const applicationData = Object.fromEntries(formData.entries());
        
        // チェックボックス配列の処理
        const documents = Array.from(form.querySelectorAll('input[name="documents[]"]:checked')).map(cb => cb.value);
        applicationData.documents = documents;
        
        // バリデーション
        if (!validateForm(form)) {
            hideLoadingSpinner();
            showToast('入力内容に不備があります', 'error');
            return;
        }
        
        // API呼び出し（模擬）
        await saveApplication(applicationData);
        
        hideLoadingSpinner();
        window.SCHOLARSHIP_SYSTEM.state.unsavedChanges = false;
        
        showToast('申請を提出しました', 'success');
        
        setTimeout(() => {
            navigateToPage('application-list');
        }, 1500);
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('申請提出エラー:', error);
        showToast('申請提出中にエラーが発生しました', 'error');
    }
}

/**
 * 申請データ保存（実際のAPI連携）
 */
async function saveApplication(applicationData) {
    try {
        // データ型変換と必須項目の設定
        const processedData = {
            ...applicationData,
            monthly_amount: parseInt(applicationData.monthly_amount) || 0,
            total_estimated_amount: parseInt(applicationData.total_estimated_amount) || 0,
            application_date: applicationData.application_date ? new Date(applicationData.application_date).toISOString() : new Date().toISOString(),
            application_period_start: applicationData.application_period_start ? new Date(applicationData.application_period_start).toISOString() : null,
            application_period_end: applicationData.application_period_end ? new Date(applicationData.application_period_end).toISOString() : null,
            repayment_start_date: applicationData.repayment_start_date ? new Date(applicationData.repayment_start_date).toISOString() : null,
            repayment_end_date: applicationData.repayment_end_date ? new Date(applicationData.repayment_end_date).toISOString() : null,
            status: '申請中',
            submitted_by: window.SCHOLARSHIP_SYSTEM.currentUser.name
        };
        
        const result = await window.scholarshipAPI.createApplication(processedData);
        console.log('申請データ保存成功:', result);
        return result;
    } catch (error) {
        console.error('申請データ保存エラー:', error);
        throw new Error(`申請処理に失敗しました: ${error.message}`);
    }
}

/**
 * 申請フィルター処理
 */
function filterApplications() {
    const searchTerm = document.getElementById('application-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('application-status-filter')?.value || '';
    const departmentFilter = document.getElementById('application-department-filter')?.value || '';
    const monthFilter = document.getElementById('application-month-filter')?.value || '';
    
    const rows = document.querySelectorAll('#application-table-body tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const applicationId = cells[0]?.textContent.toLowerCase() || '';
        const employeeName = cells[1]?.textContent.toLowerCase() || '';
        const department = cells[2]?.textContent || '';
        const status = cells[3]?.textContent || '';
        const applicationDate = cells[5]?.textContent || '';
        
        const matchesSearch = !searchTerm || 
            applicationId.includes(searchTerm) || 
            employeeName.includes(searchTerm);
        const matchesStatus = !statusFilter || status.includes(statusFilter);
        const matchesDepartment = !departmentFilter || department === departmentFilter;
        const matchesMonth = !monthFilter || applicationDate.includes(monthFilter.replace('-', '/'));
        
        if (matchesSearch && matchesStatus && matchesDepartment && matchesMonth) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 表示件数更新
    const countElement = document.getElementById('application-count');
    if (countElement) {
        countElement.textContent = `${visibleCount}件を表示`;
    }
}

/**
 * 申請フィルタークリア
 */
function clearApplicationFilters() {
    document.getElementById('application-search').value = '';
    document.getElementById('application-status-filter').value = '';
    document.getElementById('application-department-filter').value = '';
    document.getElementById('application-month-filter').value = '';
    filterApplications();
}

/**
 * 申請CSV出力
 */
async function exportApplicationsToCSV() {
    try {
        showLoadingSpinner();
        const applications = await fetchApplications();
        
        const csvData = applications.map(app => ({
            '申請ID': app.id,
            '従業員名': app.employee_name,
            '部署': app.department,
            'ステータス': app.status,
            '月次返還額': app.monthly_amount,
            '申請日': app.application_date,
            '開始予定日': app.repayment_start_date
        }));
        
        exportToCSV(csvData, '申請一覧.csv');
        hideLoadingSpinner();
        showToast('CSVファイルをダウンロードしました', 'success');
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('CSV出力エラー:', error);
        showToast('CSV出力に失敗しました', 'error');
    }
}

// グローバル関数として公開
window.generateApplicationNewContent = generateApplicationNewContent;
window.generateApplicationListContent = generateApplicationListContent;
window.generateApplicationStatusContent = generateApplicationStatusContent;
window.handleApplicationFormSubmit = handleApplicationFormSubmit;
window.loadEmployeeInfo = loadEmployeeInfo;
window.filterApplications = filterApplications;
window.clearApplicationFilters = clearApplicationFilters;
window.exportApplicationsToCSV = exportApplicationsToCSV;