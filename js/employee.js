/**
 * 従業員管理機能
 * 
 * 従業員情報の登録、編集、検索、一覧表示機能を提供
 */

/**
 * 従業員新規登録画面生成
 */
async function generateEmployeeRegisterContent() {
    return `
        ${generateBreadcrumb('employee-register')}
        
        <div class="max-w-4xl mx-auto">
            <!-- ページヘッダー -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">従業員新規登録</h2>
                <p class="text-gray-600">新しい従業員の奨学金代理返還情報を登録します。</p>
            </div>
            
            <!-- 登録フォーム -->
            <form id="employee-form" class="space-y-8">
                <!-- 基本情報セクション -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">基本情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- 社員番号 -->
                            <div class="form-group">
                                <label class="form-label required" for="employee_number">社員番号</label>
                                <input type="text" id="employee_number" name="employee_number" class="form-input" 
                                       required maxlength="20" placeholder="例: EMP-2025-001">
                                <div class="form-error" id="employee_number_error"></div>
                            </div>
                            
                            <!-- 奨学生番号 -->
                            <div class="form-group">
                                <label class="form-label required" for="scholarship_number">奨学生番号</label>
                                <input type="text" id="scholarship_number" name="scholarship_number" class="form-input" 
                                       required maxlength="10" data-validate="scholarship-number" placeholder="例: 1234567890">
                                <div class="form-error" id="scholarship_number_error"></div>
                            </div>
                            
                            <!-- 氏名 -->
                            <div class="form-group">
                                <label class="form-label required" for="full_name">氏名</label>
                                <input type="text" id="full_name" name="full_name" class="form-input" 
                                       required maxlength="100" placeholder="例: 田中 太郎">
                                <div class="form-error" id="full_name_error"></div>
                            </div>
                            
                            <!-- フリガナ -->
                            <div class="form-group">
                                <label class="form-label required" for="full_name_kana">フリガナ</label>
                                <input type="text" id="full_name_kana" name="full_name_kana" class="form-input" 
                                       required maxlength="100" placeholder="例: タナカ タロウ">
                                <div class="form-error" id="full_name_kana_error"></div>
                            </div>
                            
                            <!-- 所属部署 -->
                            <div class="form-group">
                                <label class="form-label required" for="department">所属部署</label>
                                <select id="department" name="department" class="form-input form-select" required>
                                    <option value="">部署を選択してください</option>
                                    <option value="人事部">人事部</option>
                                    <option value="総務部">総務部</option>
                                    <option value="営業部">営業部</option>
                                    <option value="開発部">開発部</option>
                                    <option value="企画部">企画部</option>
                                    <option value="経理部">経理部</option>
                                    <option value="その他">その他</option>
                                </select>
                                <div class="form-error" id="department_error"></div>
                            </div>
                            
                            <!-- 役職 -->
                            <div class="form-group">
                                <label class="form-label" for="position">役職</label>
                                <input type="text" id="position" name="position" class="form-input" 
                                       maxlength="50" placeholder="例: 主任、係長">
                            </div>
                            
                            <!-- 入社年月日 -->
                            <div class="form-group">
                                <label class="form-label required" for="hire_date">入社年月日</label>
                                <input type="date" id="hire_date" name="hire_date" class="form-input" required>
                                <div class="form-error" id="hire_date_error"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 連絡先情報セクション -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">連絡先情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- メールアドレス -->
                            <div class="form-group">
                                <label class="form-label required" for="email">メールアドレス</label>
                                <input type="email" id="email" name="email" class="form-input" 
                                       required maxlength="255" data-validate="email" placeholder="例: tanaka@company.co.jp">
                                <div class="form-error" id="email_error"></div>
                            </div>
                            
                            <!-- 電話番号 -->
                            <div class="form-group">
                                <label class="form-label" for="phone">電話番号</label>
                                <input type="tel" id="phone" name="phone" class="form-input" 
                                       maxlength="15" data-validate="phone" placeholder="例: 090-1234-5678">
                                <div class="form-error" id="phone_error"></div>
                            </div>
                            
                            <!-- 郵便番号 -->
                            <div class="form-group">
                                <label class="form-label" for="postal_code">郵便番号</label>
                                <input type="text" id="postal_code" name="postal_code" class="form-input" 
                                       maxlength="8" data-validate="postal-code" placeholder="例: 123-4567">
                                <div class="form-error" id="postal_code_error"></div>
                            </div>
                            
                            <!-- 住所 -->
                            <div class="form-group md:col-span-2">
                                <label class="form-label" for="address">住所</label>
                                <input type="text" id="address" name="address" class="form-input" 
                                       maxlength="255" placeholder="例: 東京都千代田区丸の内1-1-1">
                            </div>
                            
                            <!-- 緊急連絡先氏名 -->
                            <div class="form-group">
                                <label class="form-label" for="emergency_contact_name">緊急連絡先氏名</label>
                                <input type="text" id="emergency_contact_name" name="emergency_contact_name" class="form-input" 
                                       maxlength="100" placeholder="例: 田中 花子">
                            </div>
                            
                            <!-- 緊急連絡先電話番号 -->
                            <div class="form-group">
                                <label class="form-label" for="emergency_contact_phone">緊急連絡先電話番号</label>
                                <input type="tel" id="emergency_contact_phone" name="emergency_contact_phone" class="form-input" 
                                       maxlength="15" data-validate="phone" placeholder="例: 03-1234-5678">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 奨学金情報セクション -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">奨学金情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- 奨学金種別 -->
                            <div class="form-group">
                                <label class="form-label required" for="scholarship_type">奨学金種別</label>
                                <select id="scholarship_type" name="scholarship_type" class="form-input form-select" required>
                                    <option value="">種別を選択してください</option>
                                    <option value="第一種">第一種（無利息）</option>
                                    <option value="第二種">第二種（有利息）</option>
                                    <option value="併用">併用（第一種+第二種）</option>
                                </select>
                                <div class="form-error" id="scholarship_type_error"></div>
                            </div>
                            
                            <!-- 月次返還額 -->
                            <div class="form-group">
                                <label class="form-label required" for="monthly_repayment_amount">月次返還額（円）</label>
                                <input type="number" id="monthly_repayment_amount" name="monthly_repayment_amount" class="form-input" 
                                       required min="1" max="999999" placeholder="例: 25000">
                                <div class="form-error" id="monthly_repayment_amount_error"></div>
                            </div>
                            
                            <!-- 貸与総額 -->
                            <div class="form-group">
                                <label class="form-label" for="total_loan_amount">貸与総額（円）</label>
                                <input type="number" id="total_loan_amount" name="total_loan_amount" class="form-input" 
                                       min="0" max="99999999" placeholder="例: 2400000">
                            </div>
                            
                            <!-- 残債額 -->
                            <div class="form-group">
                                <label class="form-label" for="remaining_amount">残債額（円）</label>
                                <input type="number" id="remaining_amount" name="remaining_amount" class="form-input" 
                                       min="0" max="99999999" placeholder="例: 1800000">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- フォーム操作ボタン -->
                <div class="flex justify-end space-x-4 pt-6 border-t">
                    <button type="button" id="cancel-btn" class="btn btn-outline">
                        <i class="fas fa-times mr-2"></i>キャンセル
                    </button>
                    <button type="button" id="preview-btn" class="btn btn-secondary">
                        <i class="fas fa-eye mr-2"></i>プレビュー
                    </button>
                    <button type="submit" id="submit-btn" class="btn btn-primary">
                        <i class="fas fa-save mr-2"></i>登録
                    </button>
                </div>
            </form>
        </div>
    `;
}

/**
 * 従業員一覧画面生成
 */
async function generateEmployeeListContent() {
    const employees = await fetchEmployees();
    
    return `
        ${generateBreadcrumb('employee-list')}
        
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">従業員一覧</h2>
                    <p class="text-gray-600">登録されている従業員の一覧です。</p>
                </div>
                <div class="flex space-x-3">
                    <button onclick="exportEmployeesToCSV()" class="btn btn-outline">
                        <i class="fas fa-download mr-2"></i>CSV出力
                    </button>
                    <a href="#employee-register" class="btn btn-primary">
                        <i class="fas fa-plus mr-2"></i>新規登録
                    </a>
                </div>
            </div>
        </div>
        
        <!-- 検索・フィルター -->
        <div class="card mb-6">
            <div class="card-body">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input type="search" id="employee-search" class="form-input" 
                               placeholder="氏名・社員番号で検索" onkeyup="filterEmployees()">
                    </div>
                    <div>
                        <select id="department-filter" class="form-input form-select" onchange="filterEmployees()">
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
                        <select id="scholarship-filter" class="form-input form-select" onchange="filterEmployees()">
                            <option value="">全奨学金種別</option>
                            <option value="第一種">第一種</option>
                            <option value="第二種">第二種</option>
                            <option value="併用">併用</option>
                        </select>
                    </div>
                    <div>
                        <button onclick="clearFilters()" class="btn btn-outline w-full">
                            <i class="fas fa-eraser mr-2"></i>フィルタークリア
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 従業員テーブル -->
        <div class="card">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table" data-sortable>
                        <thead>
                            <tr>
                                <th data-sort="text">社員番号</th>
                                <th data-sort="text">氏名</th>
                                <th data-sort="text">部署</th>
                                <th data-sort="text">奨学金種別</th>
                                <th data-sort="number">月次返還額</th>
                                <th data-sort="date">登録日</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="employee-table-body">
                            ${generateEmployeeRows(employees)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- ページネーション -->
        <div class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-600">
                <span id="employee-count">全${employees.length}件中 1-${Math.min(10, employees.length)}件を表示</span>
            </div>
            <div class="flex space-x-2" id="pagination">
                <!-- ページネーションボタンがここに動的生成される -->
            </div>
        </div>
    `;
}

/**
 * 従業員検索画面生成
 */
async function generateEmployeeSearchContent() {
    return `
        ${generateBreadcrumb('employee-search')}
        
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">従業員検索</h2>
            <p class="text-gray-600">詳細な条件で従業員を検索できます。</p>
        </div>
        
        <!-- 詳細検索フォーム -->
        <div class="card mb-6">
            <div class="card-header">
                <h3 class="text-lg font-semibold text-gray-900">検索条件</h3>
            </div>
            <div class="card-body">
                <form id="advanced-search-form">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- 基本情報検索 -->
                        <div class="space-y-4">
                            <h4 class="font-medium text-gray-900">基本情報</h4>
                            <div>
                                <label class="form-label" for="search-employee-number">社員番号</label>
                                <input type="text" id="search-employee-number" class="form-input" placeholder="部分一致">
                            </div>
                            <div>
                                <label class="form-label" for="search-name">氏名</label>
                                <input type="text" id="search-name" class="form-input" placeholder="部分一致">
                            </div>
                            <div>
                                <label class="form-label" for="search-department">部署</label>
                                <select id="search-department" class="form-input form-select">
                                    <option value="">指定なし</option>
                                    <option value="人事部">人事部</option>
                                    <option value="総務部">総務部</option>
                                    <option value="営業部">営業部</option>
                                    <option value="開発部">開発部</option>
                                    <option value="企画部">企画部</option>
                                    <option value="経理部">経理部</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 奨学金情報検索 -->
                        <div class="space-y-4">
                            <h4 class="font-medium text-gray-900">奨学金情報</h4>
                            <div>
                                <label class="form-label" for="search-scholarship-type">奨学金種別</label>
                                <select id="search-scholarship-type" class="form-input form-select">
                                    <option value="">指定なし</option>
                                    <option value="第一種">第一種</option>
                                    <option value="第二種">第二種</option>
                                    <option value="併用">併用</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label" for="search-amount-min">月次返還額（最小）</label>
                                <input type="number" id="search-amount-min" class="form-input" placeholder="円">
                            </div>
                            <div>
                                <label class="form-label" for="search-amount-max">月次返還額（最大）</label>
                                <input type="number" id="search-amount-max" class="form-input" placeholder="円">
                            </div>
                        </div>
                        
                        <!-- 期間検索 -->
                        <div class="space-y-4">
                            <h4 class="font-medium text-gray-900">期間条件</h4>
                            <div>
                                <label class="form-label" for="search-hire-date-from">入社日（開始）</label>
                                <input type="date" id="search-hire-date-from" class="form-input">
                            </div>
                            <div>
                                <label class="form-label" for="search-hire-date-to">入社日（終了）</label>
                                <input type="date" id="search-hire-date-to" class="form-input">
                            </div>
                            <div>
                                <label class="form-label" for="search-status">ステータス</label>
                                <select id="search-status" class="form-input form-select">
                                    <option value="">指定なし</option>
                                    <option value="active">有効</option>
                                    <option value="inactive">無効</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
                        <button type="button" onclick="clearSearchForm()" class="btn btn-outline">
                            <i class="fas fa-eraser mr-2"></i>条件クリア
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search mr-2"></i>検索実行
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- 検索結果 -->
        <div id="search-results" class="hidden">
            <div class="card">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">検索結果</h3>
                        <button onclick="exportSearchResults()" class="btn btn-outline btn-sm">
                            <i class="fas fa-download mr-2"></i>結果をCSV出力
                        </button>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div id="search-results-content">
                        <!-- 検索結果がここに表示される -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 従業員データ取得（実際のAPI連携）
 */
async function fetchEmployees(params = {}) {
    try {
        const response = await window.scholarshipAPI.getEmployees({
            limit: params.limit || 100,
            page: params.page || 1,
            search: params.search || '',
            ...params
        });
        
        return response.data.map(emp => ({
            id: emp.id,
            employee_number: emp.employee_number,
            full_name: emp.full_name,
            department: emp.department,
            scholarship_type: emp.scholarship_type,
            monthly_repayment_amount: emp.monthly_repayment_amount,
            created_at: emp.created_at,
            is_active: emp.is_active
        }));
    } catch (error) {
        console.error('従業員データ取得エラー:', error);
        showToast('従業員データの取得に失敗しました', 'error');
        return [];
    }
}

/**
 * 従業員テーブル行生成
 */
function generateEmployeeRows(employees) {
    return employees.map(emp => `
        <tr>
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${emp.employee_number}</div>
            </td>
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${emp.full_name}</div>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${emp.department}</span>
            </td>
            <td class="px-4 py-3">
                <span class="status-badge status-${emp.scholarship_type === '第一種' ? 'approved' : emp.scholarship_type === '第二種' ? 'in-progress' : 'pending'}">
                    ${emp.scholarship_type}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm font-medium text-gray-900">¥${formatNumber(emp.monthly_repayment_amount)}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${formatDate(emp.created_at)}</span>
            </td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button onclick="viewEmployee('${emp.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editEmployee('${emp.id}')" class="text-green-600 hover:text-green-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEmployee('${emp.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 従業員フォーム初期化
 */
function initializeEmployeeForm() {
    const form = document.getElementById('employee-form');
    if (!form) return;
    
    // キャンセルボタン
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (window.SCHOLARSHIP_SYSTEM.state.unsavedChanges) {
                showConfirmDialog(
                    '変更を破棄',
                    '入力中のデータが失われますが、よろしいですか？',
                    'warning'
                ).then(confirmed => {
                    if (confirmed) {
                        navigateToPage('employee-list');
                    }
                });
            } else {
                navigateToPage('employee-list');
            }
        });
    }
    
    // プレビューボタン
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', showEmployeePreview);
    }
    
    // フォーム変更監視
    form.addEventListener('input', () => {
        window.SCHOLARSHIP_SYSTEM.state.unsavedChanges = true;
    });
    
    console.log('従業員フォーム初期化完了');
}

/**
 * 従業員一覧初期化
 */
function initializeEmployeeList() {
    // テーブルソート機能を有効化
    initializeTableSorting();
    
    console.log('従業員一覧初期化完了');
}

/**
 * 従業員フォーム送信処理
 */
async function handleEmployeeFormSubmit(form) {
    try {
        showLoadingSpinner();
        
        // フォームデータ収集
        const formData = new FormData(form);
        const employeeData = Object.fromEntries(formData.entries());
        
        // バリデーション
        if (!validateForm(form)) {
            hideLoadingSpinner();
            showToast('入力内容に不備があります', 'error');
            return;
        }
        
        // API呼び出し（模擬）
        await saveEmployee(employeeData);
        
        hideLoadingSpinner();
        window.SCHOLARSHIP_SYSTEM.state.unsavedChanges = false;
        
        showToast('従業員情報を登録しました', 'success');
        
        // 一覧画面へ遷移
        setTimeout(() => {
            navigateToPage('employee-list');
        }, 1500);
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('従業員登録エラー:', error);
        showToast('登録処理中にエラーが発生しました', 'error');
    }
}

/**
 * 従業員データ保存（実際のAPI連携）
 */
async function saveEmployee(employeeData) {
    try {
        // データ型変換
        const processedData = {
            ...employeeData,
            monthly_repayment_amount: parseInt(employeeData.monthly_repayment_amount) || 0,
            total_loan_amount: parseInt(employeeData.total_loan_amount) || 0,
            remaining_amount: parseInt(employeeData.remaining_amount) || 0,
            hire_date: employeeData.hire_date ? new Date(employeeData.hire_date).toISOString() : null,
            is_active: true
        };
        
        const result = await window.scholarshipAPI.createEmployee(processedData);
        console.log('従業員データ保存成功:', result);
        return result;
    } catch (error) {
        console.error('従業員データ保存エラー:', error);
        throw new Error(`保存処理に失敗しました: ${error.message}`);
    }
}

/**
 * 従業員プレビュー表示
 */
function showEmployeePreview() {
    const form = document.getElementById('employee-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const previewContent = `
        <div class="space-y-6">
            <div>
                <h4 class="font-medium text-gray-900 mb-3">基本情報</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>社員番号:</strong> ${data.employee_number || '未入力'}</div>
                    <div><strong>奨学生番号:</strong> ${data.scholarship_number || '未入力'}</div>
                    <div><strong>氏名:</strong> ${data.full_name || '未入力'}</div>
                    <div><strong>フリガナ:</strong> ${data.full_name_kana || '未入力'}</div>
                    <div><strong>部署:</strong> ${data.department || '未入力'}</div>
                    <div><strong>役職:</strong> ${data.position || '未入力'}</div>
                </div>
            </div>
            
            <div>
                <h4 class="font-medium text-gray-900 mb-3">奨学金情報</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>奨学金種別:</strong> ${data.scholarship_type || '未入力'}</div>
                    <div><strong>月次返還額:</strong> ${data.monthly_repayment_amount ? '¥' + formatNumber(data.monthly_repayment_amount) : '未入力'}</div>
                    <div><strong>貸与総額:</strong> ${data.total_loan_amount ? '¥' + formatNumber(data.total_loan_amount) : '未入力'}</div>
                    <div><strong>残債額:</strong> ${data.remaining_amount ? '¥' + formatNumber(data.remaining_amount) : '未入力'}</div>
                </div>
            </div>
        </div>
    `;
    
    showModal({
        title: '入力内容プレビュー',
        content: previewContent,
        size: 'large'
    });
}

/**
 * 従業員フィルター処理
 */
function filterEmployees() {
    const searchTerm = document.getElementById('employee-search')?.value.toLowerCase() || '';
    const deptFilter = document.getElementById('department-filter')?.value || '';
    const scholarshipFilter = document.getElementById('scholarship-filter')?.value || '';
    
    const rows = document.querySelectorAll('#employee-table-body tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const employeeNumber = cells[0]?.textContent.toLowerCase() || '';
        const name = cells[1]?.textContent.toLowerCase() || '';
        const department = cells[2]?.textContent || '';
        const scholarshipType = cells[3]?.textContent || '';
        
        const matchesSearch = !searchTerm || 
            employeeNumber.includes(searchTerm) || 
            name.includes(searchTerm);
        const matchesDept = !deptFilter || department === deptFilter;
        const matchesScholarship = !scholarshipFilter || scholarshipType.includes(scholarshipFilter);
        
        if (matchesSearch && matchesDept && matchesScholarship) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 表示件数更新
    const countElement = document.getElementById('employee-count');
    if (countElement) {
        countElement.textContent = `${visibleCount}件を表示`;
    }
}

/**
 * フィルタークリア
 */
function clearFilters() {
    document.getElementById('employee-search').value = '';
    document.getElementById('department-filter').value = '';
    document.getElementById('scholarship-filter').value = '';
    filterEmployees();
}

/**
 * CSV出力（実際のAPI連携）
 */
async function exportEmployeesToCSV() {
    try {
        showLoadingSpinner();
        
        // 全従業員データを取得
        const response = await window.scholarshipAPI.getEmployees({ limit: 1000 });
        const employees = response.data;
        
        const csvData = employees.map(emp => ({
            '社員番号': emp.employee_number || '',
            '氏名': emp.full_name || '',
            'フリガナ': emp.full_name_kana || '',
            '部署': emp.department || '',
            '役職': emp.position || '',
            '奨学金種別': emp.scholarship_type || '',
            '奨学生番号': emp.scholarship_number || '',
            '月次返還額': emp.monthly_repayment_amount || 0,
            '貸与総額': emp.total_loan_amount || 0,
            '残債額': emp.remaining_amount || 0,
            '入社日': formatDate(emp.hire_date),
            'メールアドレス': emp.email || '',
            '電話番号': emp.phone || '',
            '登録日': formatDate(emp.created_at),
            'ステータス': emp.is_active ? '有効' : '無効'
        }));
        
        exportToCSV(csvData, `従業員一覧_${formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
        hideLoadingSpinner();
        showToast('CSVファイルをダウンロードしました', 'success');
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('CSV出力エラー:', error);
        showToast('CSV出力に失敗しました', 'error');
    }
}

// グローバル関数として公開
window.generateEmployeeRegisterContent = generateEmployeeRegisterContent;
window.generateEmployeeListContent = generateEmployeeListContent;
window.generateEmployeeSearchContent = generateEmployeeSearchContent;
window.initializeEmployeeForm = initializeEmployeeForm;
window.initializeEmployeeList = initializeEmployeeList;
window.handleEmployeeFormSubmit = handleEmployeeFormSubmit;
window.filterEmployees = filterEmployees;
window.clearFilters = clearFilters;
window.exportEmployeesToCSV = exportEmployeesToCSV;