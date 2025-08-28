# コーディング実装ガイド
## 奨学金代理返済支援システム

**文書バージョン**: 1.0  
**作成日**: 2025-08-28  
**対象**: 開発チーム、技術リーダー

---

## 1. 実装概要

### 1.1 開発環境セットアップ

#### 必要なツールとバージョン
```bash
# Node.js (推奨: v18.x以上)
node --version

# パッケージマネージャー
npm --version

# Git
git --version

# テキストエディタ/IDE
# - Visual Studio Code (推奨)
# - WebStorm
# - Vim/Neovim
```

#### プロジェクト初期化
```bash
# プロジェクトディレクトリ作成
mkdir scholarship-payment-system
cd scholarship-payment-system

# Git初期化
git init

# 基本ディレクトリ構造作成
mkdir -p {src/{components,services,utils,styles},public/{css,js,images},docs,tests}

# 基本ファイル作成
touch src/index.html src/main.js src/styles/main.css
touch public/index.html
touch README.md .gitignore
```

### 1.2 プロジェクト構造

```
scholarship-payment-system/
├── src/                          # ソースコード
│   ├── components/              # UIコンポーネント
│   │   ├── base/               # 基底コンポーネント
│   │   │   ├── BaseComponent.js
│   │   │   ├── DataTable.js
│   │   │   └── Modal.js
│   │   ├── auth/               # 認証関連
│   │   │   ├── LoginForm.js
│   │   │   └── UserProfile.js
│   │   ├── dashboard/          # ダッシュボード
│   │   │   ├── DashboardView.js
│   │   │   └── StatisticsCard.js
│   │   ├── application/        # 申請管理
│   │   │   ├── ApplicationForm.js
│   │   │   ├── ApplicationList.js
│   │   │   └── ApplicationDetail.js
│   │   ├── payment/            # 支払管理
│   │   │   ├── PaymentSchedule.js
│   │   │   └── PaymentHistory.js
│   │   ├── admin/              # 管理機能
│   │   │   ├── UserManagement.js
│   │   │   └── SystemSettings.js
│   │   └── shared/             # 共通コンポーネント
│   │       ├── Header.js
│   │       ├── Navigation.js
│   │       └── Footer.js
│   ├── services/               # ビジネスロジック
│   │   ├── api/               # API通信
│   │   │   ├── ApiClient.js
│   │   │   ├── AuthService.js
│   │   │   ├── ApplicationService.js
│   │   │   └── PaymentService.js
│   │   ├── validation/        # バリデーション
│   │   │   ├── FormValidator.js
│   │   │   └── BusinessRuleValidator.js
│   │   └── security/          # セキュリティ
│   │       ├── EncryptionService.js
│   │       └── AuditLogger.js
│   ├── utils/                 # ユーティリティ
│   │   ├── dateHelper.js
│   │   ├── formatHelper.js
│   │   ├── constants.js
│   │   └── config.js
│   ├── styles/               # スタイルシート
│   │   ├── main.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── index.html           # メインHTML
│   └── main.js              # アプリケーションエントリーポイント
├── public/                  # 静的ファイル
│   ├── css/
│   ├── js/
│   └── images/
├── docs/                    # ドキュメント
├── tests/                   # テストファイル
├── .gitignore
├── README.md
└── package.json
```

---

## 2. 基本実装

### 2.1 HTML構造実装

#### index.html
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>奨学金代理返済支援システム</title>
    
    <!-- External Libraries -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/components.css">
    <link rel="stylesheet" href="styles/responsive.css">
</head>
<body class="bg-gray-50 font-inter">
    <!-- App Container -->
    <div id="app" class="min-h-screen">
        <!-- Header -->
        <header id="header-container" class="bg-white shadow-sm border-b border-gray-200">
            <!-- Header content will be dynamically inserted -->
        </header>
        
        <!-- Main Content -->
        <main id="main-content" class="flex">
            <!-- Navigation Sidebar -->
            <nav id="navigation-container" class="w-64 bg-white shadow-sm min-h-screen">
                <!-- Navigation content will be dynamically inserted -->
            </nav>
            
            <!-- Content Area -->
            <div id="content-area" class="flex-1 p-6">
                <!-- Page content will be dynamically inserted -->
            </div>
        </main>
        
        <!-- Footer -->
        <footer id="footer-container" class="bg-white border-t border-gray-200">
            <!-- Footer content will be dynamically inserted -->
        </footer>
    </div>
    
    <!-- Modal Container -->
    <div id="modal-container"></div>
    
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <div class="flex items-center space-x-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="text-gray-700">読み込み中...</span>
            </div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="utils/constants.js"></script>
    <script src="utils/config.js"></script>
    <script src="utils/dateHelper.js"></script>
    <script src="utils/formatHelper.js"></script>
    <script src="services/security/EncryptionService.js"></script>
    <script src="services/security/AuditLogger.js"></script>
    <script src="services/api/ApiClient.js"></script>
    <script src="services/api/AuthService.js"></script>
    <script src="services/validation/FormValidator.js"></script>
    <script src="components/base/BaseComponent.js"></script>
    <script src="components/base/DataTable.js"></script>
    <script src="components/base/Modal.js"></script>
    <script src="main.js"></script>
</body>
</html>
```

### 2.2 メインアプリケーション実装

#### main.js
```javascript
/**
 * メインアプリケーションクラス
 * SPA（Single Page Application）のルーティングと状態管理
 */
class ScholarshipApp {
    constructor() {
        this.currentUser = null;
        this.currentView = null;
        this.components = new Map();
        this.routes = this.initializeRoutes();
        
        this.initialize();
    }
    
    /**
     * アプリケーション初期化
     */
    async initialize() {
        try {
            // ユーザー認証状態確認
            await this.checkAuthenticationStatus();
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            // 初期ルート設定
            this.handleRoute();
            
            console.log('アプリケーション初期化完了');
        } catch (error) {
            console.error('アプリケーション初期化エラー:', error);
            this.showError('アプリケーションの初期化に失敗しました。');
        }
    }
    
    /**
     * ルート定義初期化
     */
    initializeRoutes() {
        return {
            '/': () => this.loadDashboard(),
            '/login': () => this.loadLogin(),
            '/applications': () => this.loadApplicationList(),
            '/applications/new': () => this.loadApplicationForm(),
            '/applications/:id': (id) => this.loadApplicationDetail(id),
            '/payments': () => this.loadPaymentList(),
            '/payments/:id': (id) => this.loadPaymentDetail(id),
            '/profile': () => this.loadUserProfile(),
            '/admin/users': () => this.loadUserManagement(),
            '/admin/settings': () => this.loadSystemSettings()
        };
    }
    
    /**
     * 認証状態確認
     */
    async checkAuthenticationStatus() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                this.currentUser = await AuthService.validateToken(token);
                this.showAuthenticatedView();
            } catch (error) {
                localStorage.removeItem('auth_token');
                this.showLoginView();
            }
        } else {
            this.showLoginView();
        }
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // ブラウザの戻る/進むボタン対応
        window.addEventListener('popstate', () => this.handleRoute());
        
        // ページ離脱時の確認（未保存データがある場合）
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '未保存の変更があります。ページを離れますか？';
            }
        });
        
        // グローバルエラーハンドリング
        window.addEventListener('error', (e) => {
            console.error('グローバルエラー:', e.error);
            AuditLogger.logError('GLOBAL_ERROR', e.error.message, e.error.stack);
        });
    }
    
    /**
     * ルートハンドリング
     */
    handleRoute() {
        const path = window.location.pathname;
        const route = this.matchRoute(path);
        
        if (route) {
            route.handler(route.params);
        } else {
            this.show404();
        }
    }
    
    /**
     * ルートマッチング
     */
    matchRoute(path) {
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const match = this.matchPattern(pattern, path);
            if (match) {
                return { handler, params: match.params };
            }
        }
        return null;
    }
    
    /**
     * パターンマッチング
     */
    matchPattern(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }
        
        return { params };
    }
    
    /**
     * ページナビゲーション
     */
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
    
    /**
     * ダッシュボード表示
     */
    async loadDashboard() {
        if (!this.currentUser) {
            this.navigate('/login');
            return;
        }
        
        try {
            const DashboardView = await this.loadComponent('dashboard/DashboardView');
            this.currentView = new DashboardView();
            await this.currentView.render();
        } catch (error) {
            console.error('ダッシュボード読み込みエラー:', error);
            this.showError('ダッシュボードの読み込みに失敗しました。');
        }
    }
    
    /**
     * ログイン画面表示
     */
    async loadLogin() {
        try {
            const LoginForm = await this.loadComponent('auth/LoginForm');
            this.currentView = new LoginForm();
            await this.currentView.render();
        } catch (error) {
            console.error('ログイン画面読み込みエラー:', error);
            this.showError('ログイン画面の読み込みに失敗しました。');
        }
    }
    
    /**
     * コンポーネント動的読み込み
     */
    async loadComponent(componentPath) {
        if (this.components.has(componentPath)) {
            return this.components.get(componentPath);
        }
        
        try {
            const script = document.createElement('script');
            script.src = `components/${componentPath}.js`;
            document.head.appendChild(script);
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    const componentName = componentPath.split('/').pop();
                    const Component = window[componentName];
                    if (Component) {
                        this.components.set(componentPath, Component);
                        resolve(Component);
                    } else {
                        reject(new Error(`Component ${componentName} not found`));
                    }
                };
                script.onerror = reject;
            });
        } catch (error) {
            console.error(`コンポーネント読み込みエラー (${componentPath}):`, error);
            throw error;
        }
    }
    
    /**
     * エラー表示
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // 5秒後に自動削除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    /**
     * 成功メッセージ表示
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        // 5秒後に自動削除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
    
    /**
     * 未保存変更確認
     */
    hasUnsavedChanges() {
        return this.currentView && this.currentView.hasUnsavedChanges && this.currentView.hasUnsavedChanges();
    }
    
    /**
     * 認証済みビュー表示
     */
    showAuthenticatedView() {
        document.getElementById('navigation-container').style.display = 'block';
        this.loadNavigation();
        this.loadHeader();
    }
    
    /**
     * ログインビュー表示
     */
    showLoginView() {
        document.getElementById('navigation-container').style.display = 'none';
    }
    
    /**
     * ナビゲーション読み込み
     */
    async loadNavigation() {
        const Navigation = await this.loadComponent('shared/Navigation');
        const navigation = new Navigation(this.currentUser);
        await navigation.render();
    }
    
    /**
     * ヘッダー読み込み
     */
    async loadHeader() {
        const Header = await this.loadComponent('shared/Header');
        const header = new Header(this.currentUser);
        await header.render();
    }
    
    /**
     * 404エラー表示
     */
    show404() {
        document.getElementById('content-area').innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <h1 class="text-6xl font-bold text-gray-400 mb-4">404</h1>
                    <p class="text-xl text-gray-600 mb-8">ページが見つかりません</p>
                    <button onclick="app.navigate('/')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        ホームに戻る
                    </button>
                </div>
            </div>
        `;
    }
}

// アプリケーション初期化
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ScholarshipApp();
});
```

---

## 3. コンポーネント実装

### 3.1 基底コンポーネント

#### components/base/BaseComponent.js
```javascript
/**
 * 基底コンポーネントクラス
 * すべてのUIコンポーネントの基本機能を提供
 */
class BaseComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = { ...this.getDefaultOptions(), ...options };
        this.state = {};
        this.eventListeners = [];
        this.childComponents = [];
        
        if (!this.container) {
            throw new Error(`Container with ID "${containerId}" not found`);
        }
    }
    
    /**
     * デフォルトオプション
     */
    getDefaultOptions() {
        return {
            loadingText: '読み込み中...',
            errorClass: 'error',
            successClass: 'success',
            loadingClass: 'loading'
        };
    }
    
    /**
     * コンポーネント描画
     */
    async render() {
        try {
            this.showLoading();
            await this.fetchData();
            const html = await this.template();
            this.container.innerHTML = html;
            await this.afterRender();
            this.hideLoading();
            this.bindEvents();
        } catch (error) {
            this.hideLoading();
            this.handleError(error);
        }
    }
    
    /**
     * テンプレート生成（継承先で実装）
     */
    async template() {
        return '<div>Base Component</div>';
    }
    
    /**
     * データ取得（継承先で実装）
     */
    async fetchData() {
        // Override in child classes
    }
    
    /**
     * 描画後処理（継承先で実装）
     */
    async afterRender() {
        // Override in child classes
    }
    
    /**
     * イベント設定（継承先で実装）
     */
    bindEvents() {
        // Override in child classes
    }
    
    /**
     * 状態更新
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
    
    /**
     * イベントリスナー追加
     */
    addEventListener(element, event, handler) {
        if (typeof element === 'string') {
            element = this.container.querySelector(element);
        }
        
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }
    
    /**
     * 子コンポーネント追加
     */
    addChildComponent(component) {
        this.childComponents.push(component);
    }
    
    /**
     * ローディング表示
     */
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = `${this.options.loadingClass} flex items-center justify-center p-4`;
        loadingDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span class="text-gray-600">${this.options.loadingText}</span>
            </div>
        `;
        loadingDiv.id = `${this.containerId}-loading`;
        this.container.appendChild(loadingDiv);
    }
    
    /**
     * ローディング非表示
     */
    hideLoading() {
        const loadingDiv = document.getElementById(`${this.containerId}-loading`);
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    
    /**
     * エラーハンドリング
     */
    handleError(error) {
        console.error(`${this.constructor.name} Error:`, error);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = `${this.options.errorClass} bg-red-50 border border-red-200 rounded-lg p-4`;
        errorDiv.innerHTML = `
            <div class="flex items-center space-x-2 text-red-700">
                <i class="fas fa-exclamation-triangle"></i>
                <span>エラーが発生しました: ${error.message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        this.container.appendChild(errorDiv);
        
        // ログ記録
        AuditLogger.logError('COMPONENT_ERROR', error.message, error.stack, {
            component: this.constructor.name,
            containerId: this.containerId
        });
    }
    
    /**
     * 成功メッセージ表示
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = `${this.options.successClass} bg-green-50 border border-green-200 rounded-lg p-4 mb-4`;
        successDiv.innerHTML = `
            <div class="flex items-center space-x-2 text-green-700">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-green-500 hover:text-green-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        this.container.insertBefore(successDiv, this.container.firstChild);
        
        // 5秒後に自動削除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
    
    /**
     * バリデーション
     */
    validate() {
        return true; // Override in child classes
    }
    
    /**
     * コンポーネント破棄
     */
    destroy() {
        // イベントリスナー削除
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // 子コンポーネント破棄
        this.childComponents.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.childComponents = [];
        
        // コンテナクリア
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    /**
     * 要素検索
     */
    find(selector) {
        return this.container.querySelector(selector);
    }
    
    /**
     * 複数要素検索
     */
    findAll(selector) {
        return this.container.querySelectorAll(selector);
    }
    
    /**
     * 未保存変更確認
     */
    hasUnsavedChanges() {
        return false; // Override in child classes
    }
}
```

### 3.2 データテーブルコンポーネント

#### components/base/DataTable.js
```javascript
/**
 * データテーブルコンポーネント
 * ページング、ソート、フィルタ機能付き
 */
class DataTable extends BaseComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);
        
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = this.options.pageSize || 10;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';
        this.selectedRows = new Set();
    }
    
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            pageSize: 10,
            showSearch: true,
            showPagination: true,
            showRowSelector: false,
            sortable: true,
            responsive: true,
            emptyMessage: 'データがありません',
            columns: [],
            actions: []
        };
    }
    
    /**
     * データ設定
     */
    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.currentPage = 1;
        this.selectedRows.clear();
        this.applyFilters();
    }
    
    /**
     * テンプレート生成
     */
    async template() {
        const tableId = `${this.containerId}-table`;
        
        return `
            <div class="data-table-container">
                ${this.options.showSearch ? this.renderSearchBar() : ''}
                ${this.renderToolbar()}
                <div class="overflow-x-auto bg-white rounded-lg shadow">
                    <table id="${tableId}" class="min-w-full divide-y divide-gray-200">
                        ${this.renderTableHeader()}
                        ${this.renderTableBody()}
                    </table>
                </div>
                ${this.options.showPagination ? this.renderPagination() : ''}
            </div>
        `;
    }
    
    /**
     * 検索バー描画
     */
    renderSearchBar() {
        return `
            <div class="mb-4 flex items-center space-x-4">
                <div class="flex-1">
                    <div class="relative">
                        <input
                            type="text"
                            id="${this.containerId}-search"
                            placeholder="検索..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value="${this.searchQuery}"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                    </div>
                </div>
                <button
                    id="${this.containerId}-clear-search"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800"
                    title="検索クリア"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
    
    /**
     * ツールバー描画
     */
    renderToolbar() {
        if (this.options.actions.length === 0) return '';
        
        return `
            <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    ${this.options.actions.map(action => `
                        <button
                            id="${this.containerId}-action-${action.id}"
                            class="px-4 py-2 text-sm font-medium rounded-lg ${action.class || 'bg-blue-600 text-white hover:bg-blue-700'}"
                            ${action.disabled ? 'disabled' : ''}
                        >
                            ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
                <div class="text-sm text-gray-500">
                    ${this.filteredData.length} 件中 ${this.getDisplayRange()} 件を表示
                </div>
            </div>
        `;
    }
    
    /**
     * テーブルヘッダー描画
     */
    renderTableHeader() {
        return `
            <thead class="bg-gray-50">
                <tr>
                    ${this.options.showRowSelector ? `
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                                type="checkbox"
                                id="${this.containerId}-select-all"
                                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            >
                        </th>
                    ` : ''}
                    ${this.options.columns.map(column => `
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${this.options.sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}"
                            ${this.options.sortable && column.sortable !== false ? `data-sort="${column.key}"` : ''}
                        >
                            <div class="flex items-center space-x-1">
                                <span>${column.label}</span>
                                ${this.options.sortable && column.sortable !== false ? `
                                    <div class="flex flex-col">
                                        <i class="fas fa-chevron-up text-xs ${this.sortColumn === column.key && this.sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-300'}"></i>
                                        <i class="fas fa-chevron-down text-xs ${this.sortColumn === column.key && this.sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-300'}"></i>
                                    </div>
                                ` : ''}
                            </div>
                        </th>
                    `).join('')}
                </tr>
            </thead>
        `;
    }
    
    /**
     * テーブルボディ描画
     */
    renderTableBody() {
        if (this.filteredData.length === 0) {
            return `
                <tbody>
                    <tr>
                        <td colspan="${this.getTotalColumns()}" class="px-6 py-12 text-center text-gray-500">
                            <div class="flex flex-col items-center space-y-2">
                                <i class="fas fa-inbox text-4xl text-gray-300"></i>
                                <span>${this.options.emptyMessage}</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            `;
        }
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        return `
            <tbody class="bg-white divide-y divide-gray-200">
                ${pageData.map((row, index) => `
                    <tr class="hover:bg-gray-50 ${this.selectedRows.has(row.id) ? 'bg-blue-50' : ''}" data-row-id="${row.id}">
                        ${this.options.showRowSelector ? `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    class="row-selector rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    data-row-id="${row.id}"
                                    ${this.selectedRows.has(row.id) ? 'checked' : ''}
                                >
                            </td>
                        ` : ''}
                        ${this.options.columns.map(column => `
                            <td class="px-6 py-4 whitespace-nowrap ${column.class || ''}">
                                ${this.renderCellValue(row, column)}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;
    }
    
    /**
     * セル値描画
     */
    renderCellValue(row, column) {
        let value = this.getNestedValue(row, column.key);
        
        if (column.render) {
            return column.render(value, row);
        }
        
        switch (column.type) {
            case 'date':
                return value ? DateHelper.formatDate(new Date(value)) : '-';
            case 'currency':
                return value ? FormatHelper.formatCurrency(value) : '-';
            case 'status':
                return this.renderStatus(value);
            case 'actions':
                return this.renderRowActions(row);
            default:
                return value || '-';
        }
    }
    
    /**
     * ネストされた値取得
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
    
    /**
     * ステータス描画
     */
    renderStatus(status) {
        const statusConfig = {
            active: { class: 'bg-green-100 text-green-800', label: 'アクティブ' },
            inactive: { class: 'bg-gray-100 text-gray-800', label: '非アクティブ' },
            pending: { class: 'bg-yellow-100 text-yellow-800', label: '保留中' },
            approved: { class: 'bg-green-100 text-green-800', label: '承認済み' },
            rejected: { class: 'bg-red-100 text-red-800', label: '却下' }
        };
        
        const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', label: status };
        
        return `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}">
                ${config.label}
            </span>
        `;
    }
    
    /**
     * 行アクション描画
     */
    renderRowActions(row) {
        return `
            <div class="flex items-center space-x-2">
                <button
                    class="text-blue-600 hover:text-blue-900"
                    onclick="this.dispatchEvent(new CustomEvent('row-view', { detail: { row: ${JSON.stringify(row).replace(/"/g, '&quot;')} }, bubbles: true }))"
                    title="詳細表示"
                >
                    <i class="fas fa-eye"></i>
                </button>
                <button
                    class="text-gray-600 hover:text-gray-900"
                    onclick="this.dispatchEvent(new CustomEvent('row-edit', { detail: { row: ${JSON.stringify(row).replace(/"/g, '&quot;')} }, bubbles: true }))"
                    title="編集"
                >
                    <i class="fas fa-edit"></i>
                </button>
                <button
                    class="text-red-600 hover:text-red-900"
                    onclick="this.dispatchEvent(new CustomEvent('row-delete', { detail: { row: ${JSON.stringify(row).replace(/"/g, '&quot;')} }, bubbles: true }))"
                    title="削除"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    /**
     * ページネーション描画
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        
        if (totalPages <= 1) return '';
        
        const pages = this.getPaginationPages(totalPages);
        
        return `
            <div class="mt-4 flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    ${this.getDisplayRange()} / ${this.filteredData.length} 件
                </div>
                <nav class="flex items-center space-x-2">
                    <button
                        id="${this.containerId}-prev-page"
                        class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${this.currentPage === 1 ? 'disabled' : ''}
                    >
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    ${pages.map(page => {
                        if (page === '...') {
                            return '<span class="px-3 py-2 text-sm text-gray-500">...</span>';
                        }
                        return `
                            <button
                                class="px-3 py-2 text-sm rounded-md ${page === this.currentPage 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'}"
                                data-page="${page}"
                            >
                                ${page}
                            </button>
                        `;
                    }).join('')}
                    
                    <button
                        id="${this.containerId}-next-page"
                        class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 ${this.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                    >
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </nav>
            </div>
        `;
    }
    
    /**
     * ページネーション用ページ配列生成
     */
    getPaginationPages(totalPages) {
        const pages = [];
        const current = this.currentPage;
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            if (current > 4) {
                pages.push('...');
            }
            
            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (current < totalPages - 3) {
                pages.push('...');
            }
            
            pages.push(totalPages);
        }
        
        return pages;
    }
    
    /**
     * 表示範囲取得
     */
    getDisplayRange() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
        return `${start}-${end}`;
    }
    
    /**
     * 総列数取得
     */
    getTotalColumns() {
        return this.options.columns.length + (this.options.showRowSelector ? 1 : 0);
    }
    
    /**
     * イベント設定
     */
    bindEvents() {
        // 検索
        if (this.options.showSearch) {
            this.addEventListener(`#${this.containerId}-search`, 'input', (e) => {
                this.searchQuery = e.target.value;
                this.applyFilters();
            });
            
            this.addEventListener(`#${this.containerId}-clear-search`, 'click', () => {
                this.searchQuery = '';
                document.getElementById(`${this.containerId}-search`).value = '';
                this.applyFilters();
            });
        }
        
        // ソート
        if (this.options.sortable) {
            this.container.addEventListener('click', (e) => {
                const sortHeader = e.target.closest('[data-sort]');
                if (sortHeader) {
                    const column = sortHeader.dataset.sort;
                    this.handleSort(column);
                }
            });
        }
        
        // ページネーション
        if (this.options.showPagination) {
            this.addEventListener(`#${this.containerId}-prev-page`, 'click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.render();
                }
            });
            
            this.addEventListener(`#${this.containerId}-next-page`, 'click', () => {
                const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.render();
                }
            });
            
            this.container.addEventListener('click', (e) => {
                if (e.target.dataset.page) {
                    this.currentPage = parseInt(e.target.dataset.page);
                    this.render();
                }
            });
        }
        
        // 行選択
        if (this.options.showRowSelector) {
            this.addEventListener(`#${this.containerId}-select-all`, 'change', (e) => {
                this.handleSelectAll(e.target.checked);
            });
            
            this.container.addEventListener('change', (e) => {
                if (e.target.classList.contains('row-selector')) {
                    this.handleRowSelect(e.target.dataset.rowId, e.target.checked);
                }
            });
        }
        
        // アクション
        this.options.actions.forEach(action => {
            this.addEventListener(`#${this.containerId}-action-${action.id}`, 'click', (e) => {
                if (action.handler) {
                    action.handler(this.getSelectedRows());
                }
            });
        });
        
        // カスタムイベント
        this.container.addEventListener('row-view', (e) => {
            this.handleRowView(e.detail.row);
        });
        
        this.container.addEventListener('row-edit', (e) => {
            this.handleRowEdit(e.detail.row);
        });
        
        this.container.addEventListener('row-delete', (e) => {
            this.handleRowDelete(e.detail.row);
        });
    }
    
    /**
     * フィルタ適用
     */
    applyFilters() {
        this.filteredData = this.data.filter(row => {
            if (!this.searchQuery) return true;
            
            return this.options.columns.some(column => {
                const value = this.getNestedValue(row, column.key);
                return value && value.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        });
        
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * ソート処理
     */
    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.filteredData.sort((a, b) => {
            const aValue = this.getNestedValue(a, column);
            const bValue = this.getNestedValue(b, column);
            
            if (aValue === bValue) return 0;
            
            const result = aValue < bValue ? -1 : 1;
            return this.sortDirection === 'asc' ? result : -result;
        });
        
        this.render();
    }
    
    /**
     * 全選択処理
     */
    handleSelectAll(checked) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        pageData.forEach(row => {
            if (checked) {
                this.selectedRows.add(row.id);
            } else {
                this.selectedRows.delete(row.id);
            }
        });
        
        this.render();
    }
    
    /**
     * 行選択処理
     */
    handleRowSelect(rowId, checked) {
        if (checked) {
            this.selectedRows.add(rowId);
        } else {
            this.selectedRows.delete(rowId);
        }
        
        // 全選択チェックボックスの状態更新
        const selectAllCheckbox = document.getElementById(`${this.containerId}-select-all`);
        if (selectAllCheckbox) {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const pageData = this.filteredData.slice(startIndex, endIndex);
            
            const selectedCount = pageData.filter(row => this.selectedRows.has(row.id)).length;
            selectAllCheckbox.checked = selectedCount === pageData.length;
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < pageData.length;
        }
    }
    
    /**
     * 選択行取得
     */
    getSelectedRows() {
        return this.data.filter(row => this.selectedRows.has(row.id));
    }
    
    /**
     * 行表示処理
     */
    handleRowView(row) {
        console.log('Row view:', row);
        // Override in parent component
    }
    
    /**
     * 行編集処理
     */
    handleRowEdit(row) {
        console.log('Row edit:', row);
        // Override in parent component
    }
    
    /**
     * 行削除処理
     */
    handleRowDelete(row) {
        console.log('Row delete:', row);
        // Override in parent component
    }
    
    /**
     * データ更新
     */
    updateRow(rowId, newData) {
        const index = this.data.findIndex(row => row.id === rowId);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...newData };
            this.applyFilters();
        }
    }
    
    /**
     * データ削除
     */
    removeRow(rowId) {
        this.data = this.data.filter(row => row.id !== rowId);
        this.selectedRows.delete(rowId);
        this.applyFilters();
    }
    
    /**
     * データ追加
     */
    addRow(newRow) {
        this.data.unshift(newRow);
        this.applyFilters();
    }
    
    /**
     * リフレッシュ
     */
    refresh() {
        this.render();
    }
}
```

---

## 4. サービス層実装

### 4.1 API通信サービス

#### services/api/ApiClient.js
```javascript
/**
 * API通信クライアント
 * 認証、エラーハンドリング、レスポンス処理を統合
 */
class ApiClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.timeout = CONFIG.API_TIMEOUT || 30000;
        this.retryCount = CONFIG.API_RETRY_COUNT || 3;
        this.retryDelay = CONFIG.API_RETRY_DELAY || 1000;
    }
    
    /**
     * GET リクエスト
     */
    async get(endpoint, params = {}, options = {}) {
        const url = this.buildURL(endpoint, params);
        return this.request('GET', url, null, options);
    }
    
    /**
     * POST リクエスト
     */
    async post(endpoint, data = null, options = {}) {
        const url = this.buildURL(endpoint);
        return this.request('POST', url, data, options);
    }
    
    /**
     * PUT リクエスト
     */
    async put(endpoint, data = null, options = {}) {
        const url = this.buildURL(endpoint);
        return this.request('PUT', url, data, options);
    }
    
    /**
     * PATCH リクエスト
     */
    async patch(endpoint, data = null, options = {}) {
        const url = this.buildURL(endpoint);
        return this.request('PATCH', url, data, options);
    }
    
    /**
     * DELETE リクエスト
     */
    async delete(endpoint, options = {}) {
        const url = this.buildURL(endpoint);
        return this.request('DELETE', url, null, options);
    }
    
    /**
     * 基本リクエスト処理
     */
    async request(method, url, data = null, options = {}) {
        const config = {
            method,
            headers: this.getHeaders(options.headers),
            ...options
        };
        
        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                // FormDataの場合はContent-Typeを設定しない（ブラウザが自動設定）
                delete config.headers['Content-Type'];
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }
        
        // AbortController でタイムアウト制御
        const controller = new AbortController();
        config.signal = controller.signal;
        
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.timeout);
        
        try {
            const response = await this.executeWithRetry(() => fetch(url, config));
            clearTimeout(timeoutId);
            
            return await this.handleResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);
            throw this.handleError(error, method, url);
        }
    }
    
    /**
     * リトライ機能付き実行
     */
    async executeWithRetry(requestFunction) {
        let lastError;
        
        for (let attempt = 0; attempt <= this.retryCount; attempt++) {
            try {
                const response = await requestFunction();
                
                // サーバーエラー(5xx)の場合はリトライ
                if (response.status >= 500 && attempt < this.retryCount) {
                    lastError = new Error(`Server error: ${response.status}`);
                    await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
                    continue;
                }
                
                return response;
            } catch (error) {
                lastError = error;
                
                // ネットワークエラーの場合はリトライ
                if (this.isRetryableError(error) && attempt < this.retryCount) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                    continue;
                }
                
                throw error;
            }
        }
        
        throw lastError;
    }
    
    /**
     * リトライ可能エラー判定
     */
    isRetryableError(error) {
        return (
            error.name === 'TypeError' || // ネットワークエラー
            error.name === 'AbortError' || // タイムアウト
            error.message.includes('fetch')
        );
    }
    
    /**
     * URL構築
     */
    buildURL(endpoint, params = {}) {
        let url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`;
        
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    searchParams.append(key, value);
                }
            });
            url += `?${searchParams.toString()}`;
        }
        
        return url;
    }
    
    /**
     * リクエストヘッダー構築
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders
        };
        
        // 認証トークン追加
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // CSRF対策
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
        
        return headers;
    }
    
    /**
     * CSRFトークン取得
     */
    getCSRFToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
    }
    
    /**
     * レスポンス処理
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        try {
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            if (!response.ok) {
                throw new ApiError(
                    data.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    data
                );
            }
            
            // レスポンスログ記録
            this.logResponse(response, data);
            
            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError(
                'レスポンスの解析に失敗しました',
                response.status,
                null
            );
        }
    }
    
    /**
     * エラーハンドリング
     */
    handleError(error, method, url) {
        // ログ記録
        AuditLogger.logError('API_ERROR', error.message, error.stack, {
            method,
            url,
            timestamp: new Date().toISOString()
        });
        
        if (error.name === 'AbortError') {
            return new ApiError('リクエストがタイムアウトしました', 408, null);
        }
        
        if (error instanceof ApiError) {
            return error;
        }
        
        return new ApiError(
            'ネットワークエラーが発生しました',
            0,
            { originalError: error.message }
        );
    }
    
    /**
     * レスポンスログ記録
     */
    logResponse(response, data) {
        if (CONFIG.DEBUG_MODE) {
            console.log('API Response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                data: data
            });
        }
    }
    
    /**
     * 遅延実行
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * ファイルアップロード
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        return this.post(endpoint, formData, {
            headers: {} // Content-Typeを自動設定させる
        });
    }
    
    /**
     * 複数ファイルアップロード
     */
    async uploadFiles(endpoint, files, additionalData = {}) {
        const formData = new FormData();
        
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        return this.post(endpoint, formData, {
            headers: {}
        });
    }
    
    /**
     * ダウンロード
     */
    async download(endpoint, filename) {
        try {
            const response = await fetch(this.buildURL(endpoint), {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            throw this.handleError(error, 'GET', endpoint);
        }
    }
}

/**
 * API エラークラス
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// グローバルインスタンス
const apiClient = new ApiClient();
```

### 4.2 認証サービス

#### services/api/AuthService.js
```javascript
/**
 * 認証サービス
 * ログイン、ログアウト、トークン管理
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.tokenKey = 'auth_token';
        this.refreshTokenKey = 'refresh_token';
        this.userKey = 'current_user';
    }
    
    /**
     * ログイン
     */
    async login(credentials) {
        try {
            const response = await apiClient.post('auth/login', {
                email: credentials.email,
                password: credentials.password,
                remember_me: credentials.rememberMe || false
            });
            
            if (response.success) {
                await this.setSession(response.data);
                
                // ログイン成功ログ
                AuditLogger.logEvent('USER_LOGIN', 'ログイン成功', {
                    user_id: response.data.user.id,
                    email: response.data.user.email,
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                });
                
                return response.data.user;
            } else {
                throw new Error(response.message || 'ログインに失敗しました');
            }
        } catch (error) {
            // ログイン失敗ログ
            AuditLogger.logEvent('USER_LOGIN_FAILED', 'ログイン失敗', {
                email: credentials.email,
                error: error.message,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent
            });
            
            throw error;
        }
    }
    
    /**
     * ログアウト
     */
    async logout() {
        try {
            const user = this.getCurrentUser();
            
            // サーバーサイドでのトークン無効化
            await apiClient.post('auth/logout');
            
            // ローカルセッション削除
            this.clearSession();
            
            // ログアウトログ
            if (user) {
                AuditLogger.logEvent('USER_LOGOUT', 'ログアウト', {
                    user_id: user.id,
                    email: user.email
                });
            }
            
            // ログインページにリダイレクト
            window.location.href = '/login';
            
        } catch (error) {
            // エラーが発生してもローカルセッションは削除
            this.clearSession();
            console.error('ログアウトエラー:', error);
            window.location.href = '/login';
        }
    }
    
    /**
     * トークン検証
     */
    async validateToken(token) {
        try {
            const response = await apiClient.get('auth/validate', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.success) {
                this.currentUser = response.data.user;
                return response.data.user;
            } else {
                throw new Error('トークンが無効です');
            }
        } catch (error) {
            this.clearSession();
            throw error;
        }
    }
    
    /**
     * トークンリフレッシュ
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        
        if (!refreshToken) {
            throw new Error('リフレッシュトークンがありません');
        }
        
        try {
            const response = await apiClient.post('auth/refresh', {
                refresh_token: refreshToken
            });
            
            if (response.success) {
                await this.setSession(response.data);
                return response.data.user;
            } else {
                throw new Error('トークンのリフレッシュに失敗しました');
            }
        } catch (error) {
            this.clearSession();
            throw error;
        }
    }
    
    /**
     * パスワード変更
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await apiClient.post('auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPassword
            });
            
            if (response.success) {
                // パスワード変更ログ
                const user = this.getCurrentUser();
                AuditLogger.logEvent('PASSWORD_CHANGED', 'パスワード変更', {
                    user_id: user.id,
                    email: user.email
                });
                
                return true;
            } else {
                throw new Error(response.message || 'パスワードの変更に失敗しました');
            }
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * パスワードリセット要求
     */
    async requestPasswordReset(email) {
        try {
            const response = await apiClient.post('auth/password-reset-request', {
                email: email
            });
            
            if (response.success) {
                // パスワードリセット要求ログ
                AuditLogger.logEvent('PASSWORD_RESET_REQUEST', 'パスワードリセット要求', {
                    email: email,
                    ip_address: await this.getClientIP()
                });
                
                return true;
            } else {
                throw new Error(response.message || 'パスワードリセットの要求に失敗しました');
            }
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * パスワードリセット実行
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await apiClient.post('auth/password-reset', {
                token: token,
                new_password: newPassword,
                new_password_confirmation: newPassword
            });
            
            if (response.success) {
                // パスワードリセットログ
                AuditLogger.logEvent('PASSWORD_RESET', 'パスワードリセット完了', {
                    token: token.substring(0, 8) + '...' // セキュリティのため一部のみ
                });
                
                return true;
            } else {
                throw new Error(response.message || 'パスワードのリセットに失敗しました');
            }
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * ユーザー登録
     */
    async register(userData) {
        try {
            const response = await apiClient.post('auth/register', userData);
            
            if (response.success) {
                // ユーザー登録ログ
                AuditLogger.logEvent('USER_REGISTERED', 'ユーザー登録', {
                    email: userData.email,
                    name: userData.name,
                    role: userData.role || 'user'
                });
                
                return response.data.user;
            } else {
                throw new Error(response.message || 'ユーザー登録に失敗しました');
            }
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * セッション設定
     */
    async setSession(authData) {
        localStorage.setItem(this.tokenKey, authData.access_token);
        localStorage.setItem(this.refreshTokenKey, authData.refresh_token);
        localStorage.setItem(this.userKey, JSON.stringify(authData.user));
        
        this.currentUser = authData.user;
        
        // トークン自動リフレッシュ設定
        this.scheduleTokenRefresh(authData.expires_in);
    }
    
    /**
     * セッション削除
     */
    clearSession() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUser = null;
        
        // リフレッシュタイマークリア
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    /**
     * 現在のユーザー取得
     */
    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }
        
        const userData = localStorage.getItem(this.userKey);
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                return this.currentUser;
            } catch (error) {
                console.error('ユーザー情報の解析エラー:', error);
                this.clearSession();
            }
        }
        
        return null;
    }
    
    /**
     * 認証状態確認
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey);
        const user = this.getCurrentUser();
        return !!(token && user);
    }
    
    /**
     * 権限確認
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user || !user.permissions) {
            return false;
        }
        
        return user.permissions.includes(permission);
    }
    
    /**
     * ロール確認
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user) {
            return false;
        }
        
        if (Array.isArray(user.roles)) {
            return user.roles.includes(role);
        }
        
        return user.role === role;
    }
    
    /**
     * 管理者権限確認
     */
    isAdmin() {
        return this.hasRole('admin') || this.hasRole('super_admin');
    }
    
    /**
     * トークン自動リフレッシュスケジュール
     */
    scheduleTokenRefresh(expiresIn) {
        // トークン有効期限の80%で自動リフレッシュ
        const refreshTime = (expiresIn * 0.8) * 1000;
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        this.refreshTimer = setTimeout(async () => {
            try {
                await this.refreshToken();
            } catch (error) {
                console.error('自動トークンリフレッシュエラー:', error);
                // リフレッシュに失敗した場合はログアウト
                this.logout();
            }
        }, refreshTime);
    }
    
    /**
     * クライアントIP取得
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
    
    /**
     * セッション延長
     */
    async extendSession() {
        try {
            const response = await apiClient.post('auth/extend-session');
            
            if (response.success) {
                // セッション延長ログ
                const user = this.getCurrentUser();
                AuditLogger.logEvent('SESSION_EXTENDED', 'セッション延長', {
                    user_id: user.id,
                    email: user.email
                });
                
                return true;
            }
        } catch (error) {
            console.error('セッション延長エラー:', error);
            return false;
        }
    }
    
    /**
     * アクティビティタイマー設定
     */
    setupActivityTimer() {
        let lastActivity = Date.now();
        const activityTimeout = 30 * 60 * 1000; // 30分
        const warningTime = 5 * 60 * 1000; // 5分前に警告
        
        // ユーザーアクティビティ検出
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // 定期的にアクティビティチェック
        setInterval(() => {
            const inactiveTime = Date.now() - lastActivity;
            
            if (inactiveTime > activityTimeout) {
                // 非アクティブタイムアウト
                this.handleInactiveTimeout();
            } else if (inactiveTime > activityTimeout - warningTime) {
                // 警告表示
                this.showInactivityWarning();
            }
        }, 60000); // 1分毎にチェック
    }
    
    /**
     * 非アクティブタイムアウト処理
     */
    handleInactiveTimeout() {
        AuditLogger.logEvent('SESSION_TIMEOUT', 'セッションタイムアウト', {
            user_id: this.getCurrentUser()?.id
        });
        
        alert('長時間操作が行われなかったため、セキュリティ上ログアウトします。');
        this.logout();
    }
    
    /**
     * 非アクティブ警告表示
     */
    showInactivityWarning() {
        const warning = document.createElement('div');
        warning.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50';
        warning.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-exclamation-triangle"></i>
                <span>5分後にセッションがタイムアウトします</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 10000);
    }
}

// グローバルインスタンス
const authService = new AuthService();
```

---

## 5. 実装手順

### 5.1 段階的実装計画

#### フェーズ1: 基盤構築（1-2週間）
1. **プロジェクト初期化**
   ```bash
   # プロジェクト作成
   mkdir scholarship-payment-system
   cd scholarship-payment-system
   
   # 基本構造作成
   mkdir -p src/{components,services,utils,styles}
   mkdir -p public/{css,js,images}
   mkdir -p docs tests
   ```

2. **基本HTML/CSS実装**
   - index.html の作成
   - Tailwind CSS 設定
   - レスポンシブデザイン実装

3. **基底クラス実装**
   - BaseComponent クラス
   - ApiClient クラス
   - 基本ユーティリティ関数

#### フェーズ2: 認証システム（1週間）
1. **認証サービス実装**
   - AuthService クラス
   - ログイン/ログアウト機能
   - トークン管理

2. **認証UI実装**
   - ログインフォーム
   - パスワードリセット
   - ユーザー登録フォーム

#### フェーズ3: 基本機能（2-3週間）
1. **ナビゲーション実装**
   - ヘッダーコンポーネント
   - サイドバーナビゲーション
   - ルーティング機能

2. **ダッシュボード実装**
   - 統計情報表示
   - チャート表示
   - 最近の活動表示

3. **データテーブル実装**
   - DataTable コンポーネント
   - ページング機能
   - ソート・フィルタ機能

#### フェーズ4: 申請管理（2週間）
1. **申請フォーム実装**
   - 入力フォーム
   - バリデーション
   - ファイルアップロード

2. **申請一覧・詳細**
   - 申請リスト表示
   - 申請詳細表示
   - ステータス管理

#### フェーズ5: 支払管理（2週間）
1. **支払スケジュール**
   - スケジュール表示
   - 支払予定管理

2. **支払履歴**
   - 履歴表示
   - レポート生成

#### フェーズ6: 管理機能（1-2週間）
1. **ユーザー管理**
   - ユーザー一覧
   - ユーザー編集
   - 権限管理

2. **システム設定**
   - 設定画面
   - 監査ログ表示

### 5.2 開発環境セットアップ詳細

#### package.json 作成
```json
{
  "name": "scholarship-payment-system",
  "version": "1.0.0",
  "description": "奨学金代理返済支援システム",
  "main": "src/main.js",
  "scripts": {
    "dev": "python -m http.server 8000",
    "build": "npm run minify",
    "minify": "npx terser src/main.js -o public/js/main.min.js",
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "jest",
    "test:e2e": "playwright test",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "terser": "^5.20.0"
  },
  "keywords": ["scholarship", "payment", "education", "finance"],
  "author": "Your Team",
  "license": "MIT"
}
```

#### .gitignore 作成
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/
public/js/*.min.js
public/css/*.min.css

# Environment files
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Test results
test-results/
playwright-report/
```

### 5.3 デバッグとテスト

#### コンソールデバッグ設定
```javascript
// utils/debug.js
class DebugHelper {
    constructor() {
        this.enabled = CONFIG.DEBUG_MODE || false;
    }
    
    log(category, message, data = null) {
        if (this.enabled) {
            console.group(`🔍 [${category}] ${message}`);
            if (data) {
                console.log(data);
            }
            console.trace();
            console.groupEnd();
        }
    }
    
    error(category, error, context = null) {
        console.group(`❌ [${category}] Error`);
        console.error(error);
        if (context) {
            console.log('Context:', context);
        }
        console.trace();
        console.groupEnd();
    }
    
    performance(label, fn) {
        if (this.enabled) {
            console.time(label);
            const result = fn();
            console.timeEnd(label);
            return result;
        }
        return fn();
    }
}

const debugHelper = new DebugHelper();
```

#### エラー監視設定
```javascript
// utils/errorMonitoring.js
class ErrorMonitoring {
    constructor() {
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // JavaScript エラー
        window.addEventListener('error', (event) => {
            this.logError('JAVASCRIPT_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Promise reject エラー
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('UNHANDLED_PROMISE_REJECTION', {
                reason: event.reason,
                promise: event.promise
            });
        });
        
        // リソース読み込みエラー
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError('RESOURCE_ERROR', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Resource failed to load'
                });
            }
        }, true);
    }
    
    logError(type, details) {
        const errorData = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            user: authService.getCurrentUser()?.id || 'anonymous'
        };
        
        // コンソール出力
        console.error(`Error [${type}]:`, errorData);
        
        // サーバーに送信（オプション）
        if (CONFIG.ERROR_REPORTING_ENABLED) {
            this.sendErrorToServer(errorData);
        }
        
        // ローカルストレージに保存
        this.saveErrorLocally(errorData);
    }
    
    async sendErrorToServer(errorData) {
        try {
            await apiClient.post('errors/report', errorData);
        } catch (error) {
            console.error('Failed to send error to server:', error);
        }
    }
    
    saveErrorLocally(errorData) {
        try {
            const errors = JSON.parse(localStorage.getItem('client_errors') || '[]');
            errors.push(errorData);
            
            // 最大100件まで保存
            if (errors.length > 100) {
                errors.shift();
            }
            
            localStorage.setItem('client_errors', JSON.stringify(errors));
        } catch (error) {
            console.error('Failed to save error locally:', error);
        }
    }
}

const errorMonitoring = new ErrorMonitoring();
```

---

## 6. パフォーマンス最適化

### 6.1 遅延読み込み実装

```javascript
// utils/lazyLoader.js
class LazyLoader {
    constructor() {
        this.observer = null;
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
        }
    }
    
    observe(element) {
        if (this.observer) {
            this.observer.observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadElement(element);
        }
    }
    
    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        
        if (element.dataset.component) {
            this.loadComponent(element);
        }
    }
    
    async loadComponent(element) {
        const componentName = element.dataset.component;
        try {
            const Component = await app.loadComponent(componentName);
            const instance = new Component(element.id);
            await instance.render();
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
        }
    }
}

const lazyLoader = new LazyLoader();
```

### 6.2 キャッシュシステム

```javascript
// utils/cache.js
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.maxMemorySize = 50; // 最大50エントリ
        this.defaultTTL = 5 * 60 * 1000; // 5分
    }
    
    set(key, value, ttl = this.defaultTTL) {
        const item = {
            value,
            expires: Date.now() + ttl,
            accessed: Date.now()
        };
        
        this.memoryCache.set(key, item);
        this.cleanup();
        
        // localStorage にも保存（永続化）
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(item));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }
    
    get(key) {
        // メモリキャッシュから取得
        let item = this.memoryCache.get(key);
        
        if (!item) {
            // localStorage から取得
            try {
                const stored = localStorage.getItem(`cache_${key}`);
                if (stored) {
                    item = JSON.parse(stored);
                    this.memoryCache.set(key, item);
                }
            } catch (error) {
                console.warn('Failed to load from localStorage:', error);
            }
        }
        
        if (!item || Date.now() > item.expires) {
            this.delete(key);
            return null;
        }
        
        item.accessed = Date.now();
        return item.value;
    }
    
    delete(key) {
        this.memoryCache.delete(key);
        localStorage.removeItem(`cache_${key}`);
    }
    
    clear() {
        this.memoryCache.clear();
        
        // localStorage のキャッシュエントリを削除
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        }
    }
    
    cleanup() {
        if (this.memoryCache.size <= this.maxMemorySize) {
            return;
        }
        
        // アクセス時間順でソート
        const entries = Array.from(this.memoryCache.entries())
            .sort((a, b) => a[1].accessed - b[1].accessed);
        
        // 古いエントリを削除
        const deleteCount = this.memoryCache.size - this.maxMemorySize;
        for (let i = 0; i < deleteCount; i++) {
            this.delete(entries[i][0]);
        }
    }
    
    // API レスポンス専用メソッド
    async cacheApiCall(key, apiCall, ttl = this.defaultTTL) {
        const cached = this.get(key);
        if (cached) {
            return cached;
        }
        
        try {
            const result = await apiCall();
            this.set(key, result, ttl);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

const cacheManager = new CacheManager();
```

---

## 7. セキュリティ実装

### 7.1 入力サニタイゼーション

```javascript
// utils/sanitizer.js
class InputSanitizer {
    /**
     * HTML サニタイゼーション
     */
    sanitizeHtml(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    /**
     * SQL インジェクション対策
     */
    sanitizeSql(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .replace(/'/g, "''")
            .replace(/"/g, '""')
            .replace(/;/g, '\\;')
            .replace(/--/g, '\\--')
            .replace(/\/\*/g, '\\/\\*')
            .replace(/\*\//g, '\\*\\/');
    }
    
    /**
     * XSS 対策
     */
    sanitizeXss(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    /**
     * JSONデータのサニタイゼーション
     */
    sanitizeObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return typeof obj === 'string' ? this.sanitizeXss(obj) : obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanKey = this.sanitizeXss(key);
            sanitized[cleanKey] = this.sanitizeObject(value);
        }
        
        return sanitized;
    }
    
    /**
     * ファイル名サニタイゼーション
     */
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_{2,}/g, '_')
            .substring(0, 255);
    }
    
    /**
     * URL サニタイゼーション
     */
    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // 許可されたプロトコルのみ
            if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
                return '';
            }
            return urlObj.toString();
        } catch (error) {
            return '';
        }
    }
}

const inputSanitizer = new InputSanitizer();
```

---

このコーディング実装ガイドにより、開発チームは具体的な実装手順と詳細なコード例を参考にして、奨学金代理返済支援システムを構築することができます。次は、テスト項目書の作成に進みます。