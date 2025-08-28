/**
 * ナビゲーション制御システム
 * 
 * SPAナビゲーション、ページ遷移、ルーティング機能を提供
 */

// ページ定義
const PAGES = {
    'dashboard': {
        title: 'ダッシュボード',
        icon: 'fas fa-chart-dashboard',
        permission: 'read'
    },
    'employee-register': {
        title: '従業員新規登録',
        icon: 'fas fa-user-plus',
        permission: 'write'
    },
    'employee-list': {
        title: '従業員一覧',
        icon: 'fas fa-list',
        permission: 'read'
    },
    'employee-search': {
        title: '従業員検索',
        icon: 'fas fa-search',
        permission: 'read'
    },
    'application-new': {
        title: '新規申請',
        icon: 'fas fa-plus-circle',
        permission: 'write'
    },
    'application-list': {
        title: '申請一覧',
        icon: 'fas fa-clipboard-list',
        permission: 'read'
    },
    'application-status': {
        title: 'ステータス管理',
        icon: 'fas fa-tasks',
        permission: 'write'
    },
    'document-upload': {
        title: '書類アップロード',
        icon: 'fas fa-cloud-upload-alt',
        permission: 'write'
    },
    'document-list': {
        title: '書類一覧',
        icon: 'fas fa-file-archive',
        permission: 'read'
    },
    'document-verify': {
        title: '書類確認',
        icon: 'fas fa-check-circle',
        permission: 'write'
    },
    'report-overview': {
        title: '概要レポート',
        icon: 'fas fa-chart-pie',
        permission: 'read'
    },
    'report-jasso': {
        title: 'JASSO提出用データ',
        icon: 'fas fa-file-export',
        permission: 'admin'
    },
    'user-management': {
        title: 'ユーザー管理',
        icon: 'fas fa-users-cog',
        permission: 'admin'
    },
    'audit-logs': {
        title: '監査ログ',
        icon: 'fas fa-history',
        permission: 'admin'
    },
    'system-settings': {
        title: 'システム設定',
        icon: 'fas fa-sliders-h',
        permission: 'admin'
    }
};

/**
 * ナビゲーション初期化
 */
function initializeNavigation() {
    setupNavigationEvents();
    updateNavigationPermissions();
    console.log('ナビゲーション初期化完了');
}

/**
 * ナビゲーションイベント設定
 */
function setupNavigationEvents() {
    // ナビゲーションリンククリック処理
    document.addEventListener('click', function(event) {
        const navLink = event.target.closest('a[href^="#"]');
        if (navLink) {
            event.preventDefault();
            const pageId = navLink.getAttribute('href').substring(1);
            navigateToPage(pageId);
        }
    });
    
    // ブラウザ戻る・進むボタン対応
    window.addEventListener('popstate', function(event) {
        const pageId = event.state?.page || 'dashboard';
        navigateToPage(pageId, false);
    });
    
    // 初期URLハッシュ処理
    const initialPage = window.location.hash.substring(1) || 'dashboard';
    history.replaceState({ page: initialPage }, '', `#${initialPage}`);
}

/**
 * ページ遷移実行
 * @param {string} pageId - 遷移先ページID
 * @param {boolean} pushState - ブラウザ履歴に追加するか
 */
async function navigateToPage(pageId, pushState = true) {
    try {
        // ページ定義確認
        if (!PAGES[pageId]) {
            console.error('未定義のページ:', pageId);
            pageId = 'dashboard';
        }
        
        // 権限チェック
        if (!hasPermission(PAGES[pageId].permission)) {
            showToast('このページにアクセスする権限がありません', 'error');
            return;
        }
        
        // 未保存変更チェック
        if (window.SCHOLARSHIP_SYSTEM.state.unsavedChanges) {
            const confirm = await showConfirmDialog(
                '未保存の変更があります',
                '変更を破棄してページを移動しますか？',
                'warning'
            );
            if (!confirm) return;
        }
        
        showLoadingSpinner();
        
        // ナビゲーション状態更新
        updateActiveNavigation(pageId);
        updatePageTitle(PAGES[pageId].title);
        
        // ページコンテンツ読み込み
        await loadPageContent(pageId);
        
        // ブラウザ履歴更新
        if (pushState) {
            history.pushState({ page: pageId }, '', `#${pageId}`);
        }
        
        // システム状態更新
        window.SCHOLARSHIP_SYSTEM.state.currentPage = pageId;
        window.SCHOLARSHIP_SYSTEM.state.unsavedChanges = false;
        
        hideLoadingSpinner();
        
        // ページ遷移完了イベント
        document.dispatchEvent(new CustomEvent('pageNavigated', {
            detail: { pageId, pageInfo: PAGES[pageId] }
        }));
        
        console.log(`ページ遷移完了: ${pageId}`);
        
    } catch (error) {
        hideLoadingSpinner();
        console.error('ページ遷移エラー:', error);
        showToast('ページの読み込み中にエラーが発生しました', 'error');
    }
}

/**
 * アクティブナビゲーション更新
 */
function updateActiveNavigation(pageId) {
    // 全ナビゲーション項目の active クラス削除
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // アクティブページのナビゲーション項目にクラス追加
    const activeNav = document.querySelector(`a[href="#${pageId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

/**
 * ページタイトル更新
 */
function updatePageTitle(title) {
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = title;
    }
    
    // ブラウザタブタイトル更新
    document.title = `${title} - 奨学金代理返還情報管理システム`;
}

/**
 * ページコンテンツ読み込み
 */
async function loadPageContent(pageId) {
    const contentContainer = document.getElementById('main-content');
    if (!contentContainer) {
        throw new Error('メインコンテンツコンテナが見つかりません');
    }
    
    let content = '';
    
    switch (pageId) {
        case 'dashboard':
            content = await generateDashboardContent();
            break;
        case 'employee-register':
            content = await generateEmployeeRegisterContent();
            break;
        case 'employee-list':
            content = await generateEmployeeListContent();
            break;
        case 'employee-search':
            content = await generateEmployeeSearchContent();
            break;
        case 'application-new':
            content = await generateApplicationNewContent();
            break;
        case 'application-list':
            content = await generateApplicationListContent();
            break;
        case 'application-status':
            content = await generateApplicationStatusContent();
            break;
        case 'document-upload':
            content = await generateDocumentUploadContent();
            break;
        case 'document-list':
            content = await generateDocumentListContent();
            break;
        case 'document-verify':
            content = await generateDocumentVerifyContent();
            break;
        case 'report-overview':
            content = await generateReportOverviewContent();
            break;
        case 'report-jasso':
            content = await generateReportJassoContent();
            break;
        case 'user-management':
            content = await generateUserManagementContent();
            break;
        case 'audit-logs':
            content = await generateAuditLogsContent();
            break;
        case 'system-settings':
            content = await generateSystemSettingsContent();
            break;
        default:
            content = `<div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">ページが見つかりません</h3>
                <p class="text-gray-600">指定されたページは存在しないか、アクセス権限がありません。</p>
            </div>`;
    }
    
    // フェードアウト → コンテンツ更新 → フェードイン
    contentContainer.style.opacity = '0';
    
    setTimeout(() => {
        contentContainer.innerHTML = content;
        
        // ページ固有の初期化処理
        initializePageSpecificFeatures(pageId);
        
        // フェードイン
        contentContainer.style.opacity = '1';
    }, 150);
}

/**
 * ページ固有機能初期化
 */
function initializePageSpecificFeatures(pageId) {
    switch (pageId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'employee-register':
            initializeEmployeeForm();
            break;
        case 'employee-list':
            initializeEmployeeList();
            break;
        case 'document-upload':
            initializeFileUpload();
            break;
        // 他のページの初期化処理を追加
    }
}

/**
 * 権限チェック
 */
function hasPermission(requiredPermission) {
    const userPermissions = window.SCHOLARSHIP_SYSTEM.currentUser.permissions;
    
    if (userPermissions.includes('admin')) {
        return true; // 管理者は全権限
    }
    
    return userPermissions.includes(requiredPermission);
}

/**
 * ナビゲーション権限更新
 */
function updateNavigationPermissions() {
    Object.entries(PAGES).forEach(([pageId, pageInfo]) => {
        const navLink = document.querySelector(`a[href="#${pageId}"]`);
        if (navLink) {
            if (!hasPermission(pageInfo.permission)) {
                navLink.style.display = 'none';
            } else {
                navLink.style.display = '';
            }
        }
    });
}

/**
 * パンくずナビ生成
 */
function generateBreadcrumb(pageId) {
    const pageInfo = PAGES[pageId];
    if (!pageInfo) return '';
    
    return `
        <nav class="flex mb-4" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
                <li class="inline-flex items-center">
                    <a href="#dashboard" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                        <i class="fas fa-home mr-2"></i>ホーム
                    </a>
                </li>
                ${pageId !== 'dashboard' ? `
                    <li>
                        <div class="flex items-center">
                            <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                            <span class="text-sm font-medium text-gray-500">
                                <i class="${pageInfo.icon} mr-2"></i>${pageInfo.title}
                            </span>
                        </div>
                    </li>
                ` : ''}
            </ol>
        </nav>
    `;
}

// グローバル関数として公開
window.navigateToPage = navigateToPage;
window.hasPermission = hasPermission;
window.generateBreadcrumb = generateBreadcrumb;