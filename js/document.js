/**
 * 書類管理機能
 * 
 * 書類アップロード、確認、一覧表示機能を提供
 */

/**
 * 書類アップロード画面生成
 */
async function generateDocumentUploadContent() {
    return `
        ${generateBreadcrumb('document-upload')}
        
        <div class="max-w-4xl mx-auto">
            <!-- ページヘッダー -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">書類アップロード</h2>
                <p class="text-gray-600">奨学金代理返還に必要な書類をアップロードします。</p>
            </div>
            
            <!-- アップロード情報 -->
            <div class="alert alert-info mb-6">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                    <div>
                        <h4 class="font-semibold mb-2">アップロード可能なファイル</h4>
                        <ul class="text-sm space-y-1">
                            <li>• ファイル形式: PDF, JPEG, PNG</li>
                            <li>• ファイルサイズ: 10MB以下</li>
                            <li>• ファイル名: 日本語対応</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- 従業員選択 -->
            <div class="card mb-6">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">対象従業員選择</h3>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label required" for="target-employee">従業員</label>
                            <select id="target-employee" class="form-input form-select" required>
                                <option value="">従業員を選択してください</option>
                                <option value="emp-001">田中 太郎 (EMP-2023-001)</option>
                                <option value="emp-002">佐藤 花子 (EMP-2023-002)</option>
                                <option value="emp-003">山田 次郎 (EMP-2023-003)</option>
                                <option value="emp-004">鈴木 美咲 (EMP-2023-004)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="target-application">関連申請</label>
                            <select id="target-application" class="form-input form-select">
                                <option value="">申請を選択（任意）</option>
                                <!-- 従業員選択時に動的に更新 -->
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- アップロードエリア -->
            <div class="card mb-6">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">ファイルアップロード</h3>
                </div>
                <div class="card-body">
                    <!-- ドラッグ&ドロップエリア -->
                    <div id="upload-area" class="file-upload-area mb-6">
                        <div class="text-center">
                            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                            <p class="text-lg font-medium text-gray-700 mb-2">ファイルをドラッグ&ドロップ</p>
                            <p class="text-sm text-gray-500 mb-4">または</p>
                            <button type="button" id="file-select-btn" class="btn btn-primary">
                                <i class="fas fa-folder-open mr-2"></i>ファイルを選択
                            </button>
                            <input type="file" id="file-input" class="hidden" multiple accept=".pdf,.jpeg,.jpg,.png">
                        </div>
                    </div>
                    
                    <!-- アップロード予定ファイル一覧 -->
                    <div id="file-queue" class="hidden">
                        <h4 class="font-medium text-gray-900 mb-3">アップロード予定ファイル</h4>
                        <div id="file-list" class="space-y-2">
                            <!-- ファイル一覧がここに表示される -->
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-4">
                            <button type="button" id="clear-queue-btn" class="btn btn-outline">
                                <i class="fas fa-trash-alt mr-2"></i>すべてクリア
                            </button>
                            <button type="button" id="upload-start-btn" class="btn btn-primary">
                                <i class="fas fa-upload mr-2"></i>アップロード開始
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- アップロード進行状況 -->
            <div id="upload-progress" class="card mb-6 hidden">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">アップロード進行状況</h3>
                </div>
                <div class="card-body">
                    <div class="mb-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span>全体の進行状況</span>
                            <span id="overall-progress-text">0%</span>
                        </div>
                        <div class="progress">
                            <div id="overall-progress-bar" class="progress-bar" style="width: 0%"></div>
                        </div>
                    </div>
                    
                    <div id="file-progress-list" class="space-y-3">
                        <!-- 個々のファイルの進行状況がここに表示される -->
                    </div>
                </div>
            </div>
            
            <!-- アップロード結果 -->
            <div id="upload-results" class="card hidden">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">アップロード結果</h3>
                </div>
                <div class="card-body">
                    <div id="upload-results-content">
                        <!-- アップロード結果がここに表示される -->
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-4">
                        <button type="button" onclick="resetUploadForm()" class="btn btn-outline">
                            <i class="fas fa-plus mr-2"></i>続けてアップロード
                        </button>
                        <a href="#document-list" class="btn btn-primary">
                            <i class="fas fa-list mr-2"></i>書類一覧を確認
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 書類一覧画面生成
 */
async function generateDocumentListContent() {
    const documents = await fetchDocuments();
    
    return `
        ${generateBreadcrumb('document-list')}
        
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">書類一覧</h2>
                    <p class="text-gray-600">アップロードされた書類の一覧です。</p>
                </div>
                <div class="flex space-x-3">
                    <button onclick="exportDocumentsToCSV()" class="btn btn-outline">
                        <i class="fas fa-download mr-2"></i>CSV出力
                    </button>
                    <a href="#document-upload" class="btn btn-primary">
                        <i class="fas fa-upload mr-2"></i>書類アップロード
                    </a>
                </div>
            </div>
        </div>
        
        <!-- 検索・フィルター -->
        <div class="card mb-6">
            <div class="card-body">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <input type="search" id="document-search" class="form-input" 
                               placeholder="ファイル名で検索" onkeyup="filterDocuments()">
                    </div>
                    <div>
                        <select id="employee-filter" class="form-input form-select" onchange="filterDocuments()">
                            <option value="">全従業員</option>
                            <option value="田中 太郎">田中 太郎</option>
                            <option value="佐藤 花子">佐藤 花子</option>
                            <option value="山田 次郎">山田 次郎</option>
                            <option value="鈴木 美咲">鈴木 美咲</option>
                        </select>
                    </div>
                    <div>
                        <select id="document-type-filter" class="form-input form-select" onchange="filterDocuments()">
                            <option value="">全書類種別</option>
                            <option value="奨学金返還証明書">奨学金返還証明書</option>
                            <option value="在学証明書">在学証明書</option>
                            <option value="卒業証明書">卒業証明書</option>
                            <option value="収入証明書">収入証明書</option>
                            <option value="住民票">住民票</option>
                        </select>
                    </div>
                    <div>
                        <select id="verification-status-filter" class="form-input form-select" onchange="filterDocuments()">
                            <option value="">全確認状況</option>
                            <option value="未確認">未確認</option>
                            <option value="確認済み">確認済み</option>
                            <option value="不備">不備</option>
                            <option value="再提出要求">再提出要求</option>
                        </select>
                    </div>
                    <div>
                        <button onclick="clearDocumentFilters()" class="btn btn-outline w-full">
                            <i class="fas fa-eraser mr-2"></i>フィルタークリア
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 書類テーブル -->
        <div class="card">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table" data-sortable>
                        <thead>
                            <tr>
                                <th data-sort="text">ファイル名</th>
                                <th data-sort="text">従業員</th>
                                <th data-sort="text">書類種別</th>
                                <th data-sort="text">ファイル形式</th>
                                <th data-sort="number">ファイルサイズ</th>
                                <th data-sort="text">確認状況</th>
                                <th data-sort="date">アップロード日</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="document-table-body">
                            ${generateDocumentRows(documents)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- ページネーション -->
        <div class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-600">
                <span id="document-count">全${documents.length}件中 1-${Math.min(10, documents.length)}件を表示</span>
            </div>
            <div class="flex space-x-2" id="document-pagination">
                <!-- ページネーションボタンがここに動的生成される -->
            </div>
        </div>
    `;
}

/**
 * 書類確認画面生成
 */
async function generateDocumentVerifyContent() {
    const pendingDocuments = await fetchPendingDocuments();
    
    return `
        ${generateBreadcrumb('document-verify')}
        
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">書類確認</h2>
            <p class="text-gray-600">アップロードされた書類の内容を確認し、承認・差し戻しを行います。</p>
        </div>
        
        <!-- 確認待ち書類サマリー -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="stat-card bg-gradient-to-br from-yellow-500 to-yellow-600">
                <div class="stat-card-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-card-value">${pendingDocuments.filter(d => d.verification_status === '未確認').length}</div>
                <div class="stat-card-label">確認待ち</div>
            </div>
            <div class="stat-card bg-gradient-to-br from-red-500 to-red-600">
                <div class="stat-card-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-card-value">${pendingDocuments.filter(d => d.verification_status === '不備').length}</div>
                <div class="stat-card-label">不備あり</div>
            </div>
            <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
                <div class="stat-card-icon">
                    <i class="fas fa-redo"></i>
                </div>
                <div class="stat-card-value">${pendingDocuments.filter(d => d.verification_status === '再提出要求').length}</div>
                <div class="stat-card-label">再提出要求</div>
            </div>
            <div class="stat-card bg-gradient-to-br from-green-500 to-green-600">
                <div class="stat-card-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-card-value">${pendingDocuments.filter(d => d.verification_status === '確認済み').length}</div>
                <div class="stat-card-label">確認済み</div>
            </div>
        </div>
        
        <!-- 確認待ち書類一覧 -->
        <div class="card">
            <div class="card-header">
                <h3 class="text-lg font-semibold text-gray-900">確認待ち書類一覧</h3>
            </div>
            <div class="card-body p-0">
                <div class="divide-y divide-gray-200">
                    ${generatePendingDocumentCards(pendingDocuments.filter(d => d.verification_status === '未確認'))}
                </div>
            </div>
        </div>
        
        <!-- 書類確認モーダル用 -->
        <div id="document-verify-modal" class="hidden">
            <!-- モーダルコンテンツは動的に生成 -->
        </div>
    `;
}

/**
 * 書類データ取得（実際のAPI連携）
 */
async function fetchDocuments(params = {}) {
    try {
        const response = await window.scholarshipAPI.getDocuments({
            limit: params.limit || 100,
            page: params.page || 1,
            search: params.search || '',
            ...params
        });
        
        // 従業員情報をマッピング
        const employeesResponse = await window.scholarshipAPI.getEmployees({ limit: 1000 });
        const employeesMap = new Map(employeesResponse.data.map(emp => [emp.id, emp]));
        
        return response.data.map(doc => {
            const employee = employeesMap.get(doc.employee_id) || {};
            return {
                ...doc,
                employee_name: employee.full_name || '不明'
            };
        });
    } catch (error) {
        console.error('書類データ取得エラー:', error);
        showToast('書類データの取得に失敗しました', 'error');
        return [];
    }
}

/**
 * 確認待ち書類取得（実際のAPI連携）
 */
async function fetchPendingDocuments() {
    try {
        // 各ステータスごとに並行取得
        const [unverified, defective, resubmission] = await Promise.all([
            window.scholarshipAPI.getDocuments({ verification_status: '未確認', limit: 100 }),
            window.scholarshipAPI.getDocuments({ verification_status: '不備', limit: 100 }),
            window.scholarshipAPI.getDocuments({ verification_status: '再提出要求', limit: 100 })
        ]);
        
        // 従業員情報をマッピング
        const employeesResponse = await window.scholarshipAPI.getEmployees({ limit: 1000 });
        const employeesMap = new Map(employeesResponse.data.map(emp => [emp.id, emp]));
        
        const allPending = [...unverified.data, ...defective.data, ...resubmission.data];
        
        return allPending.map(doc => {
            const employee = employeesMap.get(doc.employee_id) || {};
            return {
                ...doc,
                employee_name: employee.full_name || '不明'
            };
        });
    } catch (error) {
        console.error('確認待ち書類取得エラー:', error);
        return [];
    }
}

/**
 * 書類テーブル行生成
 */
function generateDocumentRows(documents) {
    return documents.map(doc => `
        <tr>
            <td class="px-4 py-3">
                <div class="flex items-center">
                    <i class="fas fa-file-${getFileIcon(doc.file_type)} text-gray-400 mr-2"></i>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${doc.file_name}</div>
                        <div class="text-xs text-gray-500">ID: ${doc.id}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${doc.employee_name}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${doc.document_type}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${doc.file_type}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${formatFileSize(doc.file_size)}</span>
            </td>
            <td class="px-4 py-3">
                <span class="status-badge ${getVerificationStatusClass(doc.verification_status)}">${doc.verification_status}</span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm text-gray-900">${formatDate(doc.upload_date)}</span>
            </td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button onclick="viewDocument('${doc.id}')" class="text-blue-600 hover:text-blue-800" title="プレビュー">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="downloadDocument('${doc.id}')" class="text-green-600 hover:text-green-800" title="ダウンロード">
                        <i class="fas fa-download"></i>
                    </button>
                    ${doc.verification_status === '未確認' ? `
                        <button onclick="verifyDocument('${doc.id}')" class="text-purple-600 hover:text-purple-800" title="確認">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button onclick="deleteDocument('${doc.id}')" class="text-red-600 hover:text-red-800" title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 確認待ち書類カード生成
 */
function generatePendingDocumentCards(documents) {
    if (documents.length === 0) {
        return '<div class="p-8 text-center text-gray-500">確認待ちの書類はありません</div>';
    }
    
    return documents.map(doc => `
        <div class="p-6">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                        <i class="fas fa-file-${getFileIcon(doc.file_type)} text-3xl text-gray-400"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-lg font-medium text-gray-900 mb-1">${doc.file_name}</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div><strong>従業員:</strong> ${doc.employee_name}</div>
                            <div><strong>書類種別:</strong> ${doc.document_type}</div>
                            <div><strong>ファイルサイズ:</strong> ${formatFileSize(doc.file_size)}</div>
                            <div><strong>アップロード日:</strong> ${formatDate(doc.upload_date)}</div>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="viewDocument('${doc.id}')" class="btn btn-outline btn-sm">
                        <i class="fas fa-eye mr-1"></i>プレビュー
                    </button>
                    <button onclick="verifyDocument('${doc.id}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-check mr-1"></i>確認
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * ファイルアイコン取得
 */
function getFileIcon(fileType) {
    switch (fileType.toLowerCase()) {
        case 'pdf': return 'pdf';
        case 'jpeg':
        case 'jpg':
        case 'png': return 'image';
        default: return 'alt';
    }
}

/**
 * 確認状況クラス取得
 */
function getVerificationStatusClass(status) {
    const statusMap = {
        '未確認': 'status-pending',
        '確認済み': 'status-approved',
        '不備': 'status-rejected',
        '再提出要求': 'status-in-progress'
    };
    return statusMap[status] || 'status-pending';
}

/**
 * ファイルアップロード初期化
 */
function initializeFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const fileSelectBtn = document.getElementById('file-select-btn');
    const fileQueue = document.getElementById('file-queue');
    const fileList = document.getElementById('file-list');
    
    if (!uploadArea || !fileInput) return;
    
    let selectedFiles = [];
    
    // ファイル選択ボタン
    fileSelectBtn?.addEventListener('click', () => {
        fileInput.click();
    });
    
    // ファイル選択時
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // ドラッグ&ドロップ
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // ファイル処理
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            // ファイル形式チェック
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showToast(`${file.name}: サポートされていないファイル形式です`, 'error');
                return false;
            }
            
            // ファイルサイズチェック
            const maxSize = window.SCHOLARSHIP_SYSTEM.config.maxFileSize;
            if (file.size > maxSize) {
                showToast(`${file.name}: ファイルサイズが${formatFileSize(maxSize)}を超えています`, 'error');
                return false;
            }
            
            return true;
        });
        
        if (validFiles.length > 0) {
            selectedFiles = [...selectedFiles, ...validFiles];
            updateFileQueue();
        }
    }
    
    // ファイルキュー更新
    function updateFileQueue() {
        if (selectedFiles.length === 0) {
            fileQueue.classList.add('hidden');
            return;
        }
        
        fileQueue.classList.remove('hidden');
        
        fileList.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-list-item">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas fa-file-${getFileTypeIcon(file.type)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">
                            ${formatFileSize(file.size)} • ${file.type}
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <select class="form-select form-input text-sm" data-file-index="${index}">
                        <option value="">書類種別を選択</option>
                        <option value="奨学金返還証明書">奨学金返還証明書</option>
                        <option value="在学証明書">在学証明書</option>
                        <option value="卒業証明書">卒業証明書</option>
                        <option value="収入証明書">収入証明書</option>
                        <option value="住民票">住民票</option>
                        <option value="その他">その他</option>
                    </select>
                    <button type="button" onclick="removeFile(${index})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // ファイル削除
    window.removeFile = (index) => {
        selectedFiles.splice(index, 1);
        updateFileQueue();
    };
    
    // すべてクリア
    document.getElementById('clear-queue-btn')?.addEventListener('click', () => {
        selectedFiles = [];
        updateFileQueue();
    });
    
    // アップロード開始
    document.getElementById('upload-start-btn')?.addEventListener('click', () => {
        startUpload();
    });
    
    // アップロード実行
    async function startUpload() {
        const targetEmployee = document.getElementById('target-employee')?.value;
        if (!targetEmployee) {
            showToast('対象従業員を選択してください', 'error');
            return;
        }
        
        if (selectedFiles.length === 0) {
            showToast('アップロードするファイルを選択してください', 'error');
            return;
        }
        
        // 書類種別チェック
        const documentTypes = Array.from(document.querySelectorAll('select[data-file-index]')).map(select => select.value);
        if (documentTypes.some(type => !type)) {
            showToast('すべてのファイルに書類種別を設定してください', 'error');
            return;
        }
        
        try {
            showUploadProgress();
            await uploadFiles(selectedFiles, documentTypes, targetEmployee);
            showUploadResults();
        } catch (error) {
            console.error('アップロードエラー:', error);
            showToast('アップロード中にエラーが発生しました', 'error');
        }
    }
    
    // アップロード進行状況表示
    function showUploadProgress() {
        document.getElementById('upload-progress').classList.remove('hidden');
        // 実際のアップロード処理をシミュレート
    }
    
    // アップロード結果表示
    function showUploadResults() {
        document.getElementById('upload-results').classList.remove('hidden');
        document.getElementById('upload-progress').classList.add('hidden');
        
        const resultsContent = document.getElementById('upload-results-content');
        resultsContent.innerHTML = `
            <div class="text-center py-6">
                <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                <h4 class="text-lg font-semibold text-gray-900 mb-2">アップロード完了</h4>
                <p class="text-gray-600">${selectedFiles.length}件のファイルが正常にアップロードされました。</p>
            </div>
        `;
        
        selectedFiles = [];
        updateFileQueue();
    }
    
    console.log('ファイルアップロード初期化完了');
}

/**
 * ファイルタイプアイコン取得
 */
function getFileTypeIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'alt';
}

/**
 * ファイルアップロード（実際のAPI連携）
 */
async function uploadFiles(files, documentTypes, employeeId) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const documentType = documentTypes[i];
        
        try {
            // ファイル情報をデータベースに登録
            const documentData = {
                employee_id: employeeId,
                file_name: file.name,
                file_type: file.type.split('/')[1].toUpperCase(),
                file_size: file.size,
                document_type: documentType,
                file_path: `/uploads/documents/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${file.name}`,
                upload_date: new Date().toISOString(),
                uploaded_by: window.SCHOLARSHIP_SYSTEM.currentUser.name,
                verification_status: '未確認',
                description: `${documentType}のアップロードファイル`
            };
            
            const result = await window.scholarshipAPI.createDocument(documentData);
            results.push({ success: true, file: file.name, id: result.id });
            
            // 進行状況更新
            updateUploadProgress(i + 1, files.length);
            
        } catch (error) {
            console.error(`ファイル ${file.name} のアップロードエラー:`, error);
            results.push({ success: false, file: file.name, error: error.message });
        }
    }
    
    return results;
}

/**
 * アップロード進行状況更新
 */
function updateUploadProgress(completed, total) {
    const progressPercent = Math.round((completed / total) * 100);
    const progressBar = document.getElementById('overall-progress-bar');
    const progressText = document.getElementById('overall-progress-text');
    
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (progressText) progressText.textContent = `${progressPercent}%`;
}

/**
 * アップロードフォームリセット
 */
function resetUploadForm() {
    document.getElementById('target-employee').value = '';
    document.getElementById('target-application').value = '';
    document.getElementById('upload-results').classList.add('hidden');
    document.getElementById('upload-progress').classList.add('hidden');
}

/**
 * 書類フィルター処理
 */
function filterDocuments() {
    const searchTerm = document.getElementById('document-search')?.value.toLowerCase() || '';
    const employeeFilter = document.getElementById('employee-filter')?.value || '';
    const documentTypeFilter = document.getElementById('document-type-filter')?.value || '';
    const statusFilter = document.getElementById('verification-status-filter')?.value || '';
    
    const rows = document.querySelectorAll('#document-table-body tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const fileName = cells[0]?.textContent.toLowerCase() || '';
        const employeeName = cells[1]?.textContent || '';
        const documentType = cells[2]?.textContent || '';
        const verificationStatus = cells[5]?.textContent || '';
        
        const matchesSearch = !searchTerm || fileName.includes(searchTerm);
        const matchesEmployee = !employeeFilter || employeeName === employeeFilter;
        const matchesDocType = !documentTypeFilter || documentType === documentTypeFilter;
        const matchesStatus = !statusFilter || verificationStatus.includes(statusFilter);
        
        if (matchesSearch && matchesEmployee && matchesDocType && matchesStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 表示件数更新
    const countElement = document.getElementById('document-count');
    if (countElement) {
        countElement.textContent = `${visibleCount}件을 表示`;
    }
}

/**
 * 書類フィルタークリア
 */
function clearDocumentFilters() {
    document.getElementById('document-search').value = '';
    document.getElementById('employee-filter').value = '';
    document.getElementById('document-type-filter').value = '';
    document.getElementById('verification-status-filter').value = '';
    filterDocuments();
}

/**
 * 書類CSV出力
 */
async function exportDocumentsToCSV() {
    try {
        showLoadingSpinner();
        const documents = await fetchDocuments();
        
        const csvData = documents.map(doc => ({
            'ファイル名': doc.file_name,
            '従業員': doc.employee_name,
            '書類種別': doc.document_type,
            'ファイル形式': doc.file_type,
            'ファイルサイズ': formatFileSize(doc.file_size),
            '確認状況': doc.verification_status,
            'アップロード日': doc.upload_date
        }));
        
        exportToCSV(csvData, '書類一覧.csv');
        hideLoadingSpinner();
        showToast('CSVファイルをダウンロードしました', 'success');
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('CSV出力エラー:', error);
        showToast('CSV出力に失敗しました', 'error');
    }
}

// グローバル関数として公開
window.generateDocumentUploadContent = generateDocumentUploadContent;
window.generateDocumentListContent = generateDocumentListContent;
window.generateDocumentVerifyContent = generateDocumentVerifyContent;
window.initializeFileUpload = initializeFileUpload;
window.filterDocuments = filterDocuments;
window.clearDocumentFilters = clearDocumentFilters;
window.exportDocumentsToCSV = exportDocumentsToCSV;
window.resetUploadForm = resetUploadForm;
window.removeFile = removeFile;