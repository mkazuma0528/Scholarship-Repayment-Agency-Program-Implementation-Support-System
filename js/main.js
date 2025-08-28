/**
 * 奨学金代理返還情報管理システム - メインJavaScript
 * 
 * このファイルは、システム全体の基本機能と初期化処理を担当します。
 */

// グローバル設定とユーティリティ
window.SCHOLARSHIP_SYSTEM = {
    // システム設定
    config: {
        apiUrl: '/api', // RESTful API ベースURL（相対パス）
        version: '1.0.0',
        sessionTimeout: 30 * 60 * 1000, // 30分（ミリ秒）
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['pdf', 'jpeg', 'jpg', 'png'],
        recordsPerPage: 10
    },
    
    // 現在のユーザー情報
    currentUser: {
        id: 'user-001',
        name: '松木一真',
        role: 'システム管理者',
        department: '人事部',
        permissions: ['read', 'write', 'admin']
    },
    
    // アプリケーション状態
    state: {
        currentPage: 'dashboard',
        isAuthenticated: true,
        lastActivity: Date.now(),
        unsavedChanges: false
    },
    
    // キャッシュストレージ
    cache: new Map()
};

// DOM読み込み完了時の初期化処理
document.addEventListener('DOMContentLoaded', async function() {
    console.log('奨学金代理返還情報管理システム 初期化開始');
    
    try {
        // セキュリティチェック
        await performSecurityCheck();
        
        // UIコンポーネント初期化
        initializeUI();
        
        // イベントリスナー設定
        setupEventListeners();
        
        // セッション管理開始
        startSessionManagement();
        
        // 初期画面表示
        await loadDashboard();
        
        console.log('システム初期化完了');
        showToast('システムが正常に初期化されました', 'success');
        
    } catch (error) {
        console.error('システム初期化エラー:', error);
        showToast('システム初期化中にエラーが発生しました', 'error');
        handleInitializationError(error);
    }
});

/**
 * セキュリティチェック実行
 */
async function performSecurityCheck() {
    // HTTPS接続チェック
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('HTTPS接続が推奨されます');
    }
    
    // セッション有効性チェック
    const sessionValid = await validateSession();
    if (!sessionValid) {
        redirectToLogin();
        return;
    }
    
    // CSRFトークン設定（将来的な実装用）
    setCSRFToken();
    
    console.log('セキュリティチェック完了');
}

/**
 * UIコンポーネント初期化
 */
function initializeUI() {
    // ユーザー情報表示
    updateUserDisplay();
    
    // ナビゲーション初期化
    initializeNavigation();
    
    // モーダル・ドロップダウン初期化
    initializeModals();
    initializeDropdowns();
    
    // フォームバリデーション初期化
    initializeFormValidation();
    
    // テーブルソート機能初期化
    initializeTableSorting();
    
    console.log('UI初期化完了');
}

/**
 * イベントリスナー設定
 */
function setupEventListeners() {
    // ウィンドウイベント
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleWindowResize);
    
    // キーボードショートカット
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // グローバルクリックイベント
    document.addEventListener('click', handleGlobalClick);
    
    // フォーム送信防止（SPA対応）
    document.addEventListener('submit', handleFormSubmit);
    
    console.log('イベントリスナー設定完了');
}

/**
 * ユーザー表示更新
 */
function updateUserDisplay() {
    const userNameElement = document.getElementById('currentUserName');
    if (userNameElement) {
        userNameElement.textContent = window.SCHOLARSHIP_SYSTEM.currentUser.name;
    }
}

/**
 * セッション管理開始
 */
function startSessionManagement() {
    // セッションタイムアウトチェック
    setInterval(checkSessionTimeout, 60000); // 1分毎にチェック
    
    // アクティビティ監視
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, updateLastActivity, { passive: true });
    });
    
    console.log('セッション管理開始');
}

/**
 * セッションタイムアウトチェック
 */
function checkSessionTimeout() {
    const { lastActivity, sessionTimeout } = window.SCHOLARSHIP_SYSTEM.state;
    const currentTime = Date.now();
    
    if (currentTime - lastActivity > sessionTimeout) {
        showSessionTimeoutWarning();
    }
}

/**
 * 最終アクティビティ時刻更新
 */
function updateLastActivity() {
    window.SCHOLARSHIP_SYSTEM.state.lastActivity = Date.now();
}

/**
 * セッションタイムアウト警告表示
 */
function showSessionTimeoutWarning() {
    const modal = showModal({
        title: 'セッションタイムアウト警告',
        content: `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                <p class="mb-4">セッションがまもなく期限切れになります。</p>
                <p class="text-sm text-gray-600 mb-6">操作を続行するにはセッションを延長してください。</p>
                <div class="flex justify-center space-x-3">
                    <button onclick="extendSession()" class="btn btn-primary">セッション延長</button>
                    <button onclick="logout()" class="btn btn-secondary">ログアウト</button>
                </div>
            </div>
        `,
        showCloseButton: false
    });
    
    // 5分後に自動ログアウト
    setTimeout(() => {
        if (modal.isVisible()) {
            logout();
        }
    }, 5 * 60 * 1000);
}

/**
 * ページ離脱時の処理
 */
function handleBeforeUnload(event) {
    if (window.SCHOLARSHIP_SYSTEM.state.unsavedChanges) {
        const message = '保存されていない変更があります。ページを離れますか？';
        event.returnValue = message;
        return message;
    }
}

/**
 * ウィンドウリサイズ処理
 */
function handleWindowResize() {
    // モバイル対応の動的調整
    adjustMobileLayout();
    
    // チャートのリサイズ（Chart.jsがある場合）
    if (window.Chart) {
        Object.values(Chart.instances).forEach(chart => {
            chart.resize();
        });
    }
}

/**
 * キーボードショートカット処理
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S で保存
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleQuickSave();
        return;
    }
    
    // Ctrl/Cmd + F で検索
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        focusSearchInput();
        return;
    }
    
    // Escape でモーダル閉じる
    if (event.key === 'Escape') {
        closeActiveModal();
        return;
    }
}

/**
 * グローバルクリック処理
 */
function handleGlobalClick(event) {
    // ドロップダウン以外をクリックした時に閉じる
    if (!event.target.closest('.dropdown')) {
        closeAllDropdowns();
    }
    
    // モーダル外クリック時に閉じる
    if (event.target.id === 'modal-overlay') {
        closeActiveModal();
    }
}

/**
 * フォーム送信処理
 */
function handleFormSubmit(event) {
    event.preventDefault(); // デフォルトの送信を無効化
    
    const form = event.target;
    const formId = form.id;
    
    // フォーム別処理
    switch (formId) {
        case 'employee-form':
            handleEmployeeFormSubmit(form);
            break;
        case 'application-form':
            handleApplicationFormSubmit(form);
            break;
        case 'document-upload-form':
            handleDocumentUploadSubmit(form);
            break;
        default:
            console.warn('未定義のフォーム送信:', formId);
    }
}

/**
 * クイック保存処理
 */
function handleQuickSave() {
    const activeForm = document.querySelector('form:focus-within');
    if (activeForm) {
        const submitButton = activeForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    }
}

/**
 * 検索入力フォーカス
 */
function focusSearchInput() {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="検索"]');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

/**
 * セッション延長
 */
async function extendSession() {
    try {
        showLoadingSpinner();
        
        // API呼び出し（模擬）
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // セッション情報更新
        window.SCHOLARSHIP_SYSTEM.state.lastActivity = Date.now();
        
        hideLoadingSpinner();
        closeActiveModal();
        showToast('セッションが延長されました', 'success');
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('セッション延長エラー:', error);
        showToast('セッション延長に失敗しました', 'error');
    }
}

/**
 * ログアウト処理
 */
function logout() {
    if (confirm('ログアウトしますか？未保存の変更は失われます。')) {
        // セッション情報クリア
        window.SCHOLARSHIP_SYSTEM.state.isAuthenticated = false;
        window.SCHOLARSHIP_SYSTEM.cache.clear();
        
        // ログアウト処理（実際のシステムでは認証APIを呼び出し）
        console.log('ログアウト処理実行');
        
        // ログイン画面へリダイレクト（模擬）
        showToast('ログアウトしました', 'info');
        
        // 実際の実装では: window.location.href = '/login';
    }
}

/**
 * セッション検証（模擬）
 */
async function validateSession() {
    // 実際のシステムでは認証APIを呼び出し
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(window.SCHOLARSHIP_SYSTEM.state.isAuthenticated);
        }, 100);
    });
}

/**
 * CSRFトークン設定（模擬）
 */
function setCSRFToken() {
    // 実際のシステムではサーバーからトークンを取得
    const token = 'csrf-token-' + Date.now();
    document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', token);
}

/**
 * ログイン画面リダイレクト
 */
function redirectToLogin() {
    console.log('ログイン画面へリダイレクト');
    // 実際の実装では: window.location.href = '/login';
}

/**
 * 初期化エラー処理
 */
function handleInitializationError(error) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'fixed inset-0 bg-red-100 flex items-center justify-center z-50';
    errorContainer.innerHTML = `
        <div class="max-w-md p-6 bg-white rounded-lg shadow-xl border-l-4 border-red-500">
            <div class="flex items-center mb-4">
                <i class="fas fa-exclamation-circle text-red-500 text-2xl mr-3"></i>
                <h2 class="text-xl font-bold text-red-800">システム初期化エラー</h2>
            </div>
            <p class="text-gray-700 mb-4">システムの初期化中にエラーが発生しました。</p>
            <div class="text-sm text-gray-600 mb-4">
                エラー詳細: ${error.message}
            </div>
            <button onclick="location.reload()" class="btn btn-primary w-full">
                <i class="fas fa-refresh mr-2"></i>ページを再読み込み
            </button>
        </div>
    `;
    
    document.body.appendChild(errorContainer);
}

/**
 * モバイルレイアウト調整
 */
function adjustMobileLayout() {
    const isMobile = window.innerWidth < 768;
    const sidebar = document.querySelector('aside');
    
    if (sidebar) {
        if (isMobile) {
            sidebar.classList.add('mobile-hidden');
        } else {
            sidebar.classList.remove('mobile-hidden');
        }
    }
}

// システム情報をコンソールに出力
console.log(`奨学金代理返還情報管理システム v${window.SCHOLARSHIP_SYSTEM.config.version}`);
console.log('開発者: 新規事業立ち上げチーム');
console.log('対象市場: 奨学金代理返還制度導入サポート事業');

// グローバル関数をwindowオブジェクトに追加（HTML内から呼び出し可能にする）
window.extendSession = extendSession;
window.logout = logout;