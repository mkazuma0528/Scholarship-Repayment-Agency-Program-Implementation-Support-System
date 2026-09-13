/**
 * ユーザー管理と権限制御モジュール
 * 
 * ユーザー作成、編集、権限管理、認証機能を提供
 */

class UserManagementSystem {
    constructor() {
        this.roles = new Map([
            ['システム管理者', {
                permissions: ['read', 'write', 'admin', 'user_management', 'system_settings'],
                description: 'システム全体の管理権限',
                color: 'red'
            }],
            ['人事担当者', {
                permissions: ['read', 'write', 'approve', 'report_generate'],
                description: '申請承認と管理業務',
                color: 'blue'
            }],
            ['一般従業員', {
                permissions: ['read', 'self_register', 'self_update'],
                description: '自身の情報管理のみ',
                color: 'green'
            }]
        ]);
        
        this.currentUserSessions = new Map();
        this.passwordPolicy = {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            preventReuse: 5,
            maxAge: 90 // days
        };
    }

    /**
     * ユーザー管理画面生成
     */
    async generateUserManagementContent() {
        try {
            const users = await this.getAllUsers();
            const stats = await this.getUserStatistics();
            
            return `
                ${generateBreadcrumb('user-management')}
                
                <div class="mb-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">ユーザー管理</h2>
                            <p class="text-gray-600">システムユーザーの管理と権限設定を行います。</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="exportUsersToCSV()" class="btn btn-outline">
                                <i class="fas fa-download mr-2"></i>CSV出力
                            </button>
                            <button onclick="showCreateUserModal()" class="btn btn-primary">
                                <i class="fas fa-user-plus mr-2"></i>新規ユーザー作成
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- ユーザー統計 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    ${this.generateUserStatsCards(stats)}
                </div>
                
                <!-- 権限マトリックス -->
                <div class="card mb-8">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900">権限マトリックス</h3>
                    </div>
                    <div class="card-body">
                        ${this.generatePermissionMatrix()}
                    </div>
                </div>
                
                <!-- ユーザー一覧 -->
                <div class="card">
                    <div class="card-header">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-900">ユーザー一覧</h3>
                            <div class="flex space-x-3">
                                <select id="role-filter" class="form-select form-input text-sm" onchange="filterUsers()">
                                    <option value="">全ての役割</option>
                                    <option value="システム管理者">システム管理者</option>
                                    <option value="人事担当者">人事担当者</option>
                                    <option value="一般従業員">一般従業員</option>
                                </select>
                                <select id="status-filter" class="form-select form-input text-sm" onchange="filterUsers()">
                                    <option value="">全てのステータス</option>
                                    <option value="active">有効</option>
                                    <option value="inactive">無効</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="overflow-x-auto">
                            <table class="table" data-sortable>
                                <thead>
                                    <tr>
                                        <th data-sort="text">ユーザー名</th>
                                        <th data-sort="text">氏名</th>
                                        <th data-sort="text">役割</th>
                                        <th data-sort="text">部署</th>
                                        <th data-sort="date">最終ログイン</th>
                                        <th data-sort="text">ステータス</th>
                                        <th data-sort="text">MFA</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="users-table-body">
                                    ${this.generateUserRows(users)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- セッション管理 -->
                <div class="mt-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900">アクティブセッション</h3>
                        </div>
                        <div class="card-body">
                            <div id="active-sessions">
                                ${this.generateActiveSessionsTable()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('ユーザー管理画面生成エラー:', error);
            return `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">ユーザー情報の読み込みに失敗しました</h3>
                    <p class="text-gray-600 mb-4">システムエラーが発生しました。</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh mr-2"></i>再読み込み
                    </button>
                </div>
            `;
        }
    }

    /**
     * 全ユーザー取得
     */
    async getAllUsers() {
        try {
            const response = await window.scholarshipAPI.getUsers({ limit: 1000 });
            return response.data || [];
        } catch (error) {
            console.error('ユーザー取得エラー:', error);
            return [];
        }
    }

    /**
     * ユーザー統計取得
     */
    async getUserStatistics() {
        try {
            const users = await this.getAllUsers();
            
            return {
                totalUsers: users.length,
                activeUsers: users.filter(user => user.is_active).length,
                admins: users.filter(user => user.role === 'システム管理者').length,
                mfaEnabled: users.filter(user => user.mfa_enabled).length
            };
        } catch (error) {
            console.error('ユーザー統計取得エラー:', error);
            return { totalUsers: 0, activeUsers: 0, admins: 0, mfaEnabled: 0 };
        }
    }

    /**
     * ユーザー統計カード生成
     */
    generateUserStatsCards(stats) {
        const cards = [
            {
                title: '総ユーザー数',
                value: formatNumber(stats.totalUsers),
                icon: 'fas fa-users',
                color: 'from-blue-500 to-blue-600'
            },
            {
                title: 'アクティブユーザー',
                value: formatNumber(stats.activeUsers),
                icon: 'fas fa-user-check',
                color: 'from-green-500 to-green-600'
            },
            {
                title: '管理者',
                value: formatNumber(stats.admins),
                icon: 'fas fa-user-shield',
                color: 'from-red-500 to-red-600'
            },
            {
                title: 'MFA有効',
                value: formatNumber(stats.mfaEnabled),
                icon: 'fas fa-shield-alt',
                color: 'from-purple-500 to-purple-600'
            }
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
     * 権限マトリックス生成
     */
    generatePermissionMatrix() {
        const permissions = ['read', 'write', 'admin', 'approve', 'user_management', 'system_settings', 'report_generate'];
        const permissionLabels = {
            'read': '閲覧',
            'write': '編集',
            'admin': '管理',
            'approve': '承認',
            'user_management': 'ユーザー管理',
            'system_settings': 'システム設定',
            'report_generate': 'レポート生成'
        };
        
        const headerRow = `
            <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-900">役割</th>
                ${permissions.map(perm => `<th class="px-2 py-2 text-center text-xs font-medium text-gray-500">${permissionLabels[perm]}</th>`).join('')}
            </tr>
        `;
        
        const bodyRows = Array.from(this.roles.entries()).map(([roleName, roleData]) => `
            <tr class="border-t">
                <td class="px-4 py-2 font-medium text-gray-900">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${roleData.color}-100 text-${roleData.color}-800">
                        ${roleName}
                    </span>
                </td>
                ${permissions.map(perm => `
                    <td class="px-2 py-2 text-center">
                        ${roleData.permissions.includes(perm) ? 
                            '<i class="fas fa-check text-green-600"></i>' : 
                            '<i class="fas fa-times text-gray-300"></i>'
                        }
                    </td>
                `).join('')}
            </tr>
        `).join('');
        
        return `
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        ${headerRow}
                    </thead>
                    <tbody>
                        ${bodyRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * ユーザー行生成
     */
    generateUserRows(users) {
        return users.map(user => `
            <tr>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-user text-gray-500"></i>
                            </div>
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${user.username || ''}</div>
                            <div class="text-xs text-gray-500">${user.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${user.full_name || '未設定'}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getRoleColorClass(user.role)}">
                        ${user.role || '未設定'}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${user.department || '未設定'}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${user.last_login ? formatDate(user.last_login, 'YYYY/MM/DD HH:mm') : '未ログイン'}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="status-badge ${user.is_active ? 'status-approved' : 'status-rejected'}">
                        ${user.is_active ? '有効' : '無効'}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm ${user.mfa_enabled ? 'text-green-600' : 'text-gray-400'}">
                        <i class="fas fa-${user.mfa_enabled ? 'shield-alt' : 'shield-alt'}"></i>
                        ${user.mfa_enabled ? '有効' : '無効'}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2">
                        <button onclick="editUser('${user.id}')" class="text-blue-600 hover:text-blue-800" title="編集">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="resetUserPassword('${user.id}')" class="text-yellow-600 hover:text-yellow-800" title="パスワードリセット">
                            <i class="fas fa-key"></i>
                        </button>
                        <button onclick="toggleUserStatus('${user.id}', ${user.is_active})" class="text-${user.is_active ? 'red' : 'green'}-600 hover:text-${user.is_active ? 'red' : 'green'}-800" title="${user.is_active ? '無効化' : '有効化'}">
                            <i class="fas fa-${user.is_active ? 'user-slash' : 'user-check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 役割カラークラス取得
     */
    getRoleColorClass(role) {
        const roleData = this.roles.get(role);
        if (!roleData) return 'bg-gray-100 text-gray-800';
        
        const colorMap = {
            'red': 'bg-red-100 text-red-800',
            'blue': 'bg-blue-100 text-blue-800',
            'green': 'bg-green-100 text-green-800'
        };
        
        return colorMap[roleData.color] || 'bg-gray-100 text-gray-800';
    }

    /**
     * アクティブセッション テーブル生成
     */
    generateActiveSessionsTable() {
        // 実際のシステムでは、セッション管理テーブルから取得
        const mockSessions = [
            {
                id: 'session-1',
                username: 'matsuki_kazuma',
                ip_address: '192.168.1.100',
                user_agent: 'Chrome 120.0.0.0',
                login_time: new Date().toISOString(),
                last_activity: new Date().toISOString()
            }
        ];
        
        if (mockSessions.length === 0) {
            return '<div class="text-center py-4 text-gray-500">アクティブセッションはありません</div>';
        }
        
        const rows = mockSessions.map(session => `
            <tr>
                <td class="px-4 py-3">
                    <span class="text-sm font-medium text-gray-900">${session.username}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${session.ip_address}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${session.user_agent}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${formatDate(session.login_time, 'YYYY/MM/DD HH:mm')}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${formatDate(session.last_activity, 'YYYY/MM/DD HH:mm')}</span>
                </td>
                <td class="px-4 py-3">
                    <button onclick="terminateSession('${session.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        return `
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザー名</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPアドレス</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ブラウザ</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ログイン時刻</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終活動</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 新規ユーザー作成
     */
    async createUser(userData) {
        try {
            // パスワードポリシーバリデーション
            if (!this.validatePassword(userData.password)) {
                throw new Error('パスワードがポリシーに準拠していません');
            }
            
            // ユーザー名重複チェック
            const existingUsers = await this.getAllUsers();
            if (existingUsers.some(user => user.username === userData.username)) {
                throw new Error('ユーザー名が既に使用されています');
            }
            
            // パスワードハッシュ化（実際のシステムでは適切にハッシュ化）
            const hashedPassword = await this.hashPassword(userData.password);
            
            const newUser = {
                ...userData,
                password_hash: hashedPassword,
                is_active: true,
                mfa_enabled: false,
                password_changed_at: new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            
            delete newUser.password; // 平文パスワードを削除
            
            const result = await window.scholarshipAPI.createUser(newUser);
            
            showToast('新しいユーザーを作成しました', 'success');
            return result;
            
        } catch (error) {
            console.error('ユーザー作成エラー:', error);
            showToast(error.message, 'error');
            throw error;
        }
    }

    /**
     * パスワードバリデーション
     */
    validatePassword(password) {
        const policy = this.passwordPolicy;
        
        if (password.length < policy.minLength) return false;
        if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
        if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
        if (policy.requireNumbers && !/\d/.test(password)) return false;
        if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
        
        return true;
    }

    /**
     * パスワードハッシュ化（模擬）
     */
    async hashPassword(password) {
        // 実際のシステムでは、bcrypt等を使用
        return 'hashed_' + btoa(password) + '_' + Date.now();
    }

    /**
     * ユーザー権限チェック
     */
    hasPermission(userId, permission) {
        const user = this.getCurrentUser(userId);
        if (!user) return false;
        
        const roleData = this.roles.get(user.role);
        return roleData && roleData.permissions.includes(permission);
    }

    /**
     * 現在のユーザー取得
     */
    getCurrentUser(userId = null) {
        if (userId) {
            // 指定されたユーザーIDでユーザー情報取得
            return null; // 実装が必要
        }
        return window.SCHOLARSHIP_SYSTEM.currentUser;
    }

    /**
     * ユーザーCSV出力
     */
    async exportUsersToCSV() {
        try {
            showLoadingSpinner();
            const users = await this.getAllUsers();
            
            const csvData = users.map(user => ({
                'ユーザー名': user.username || '',
                'メールアドレス': user.email || '',
                '役割': user.role || '',
                '部署': user.department || '',
                '最終ログイン': user.last_login ? formatDate(user.last_login) : '',
                'ステータス': user.is_active ? '有効' : '無効',
                'MFA': user.mfa_enabled ? '有効' : '無効',
                '作成日': formatDate(user.created_at)
            }));
            
            exportToCSV(csvData, `ユーザー一覧_${formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
            hideLoadingSpinner();
            showToast('ユーザー一覧をCSV出力しました', 'success');
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('CSV出力エラー:', error);
            showToast('CSV出力に失敗しました', 'error');
        }
    }

    /**
     * 新規ユーザー作成モーダル表示
     */
    showCreateUserModal() {
        const modalContent = `
            <form id="create-user-form">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label required" for="new-username">ユーザー名</label>
                            <input type="text" id="new-username" name="username" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="new-email">メールアドレス</label>
                            <input type="email" id="new-email" name="email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="new-role">役割</label>
                            <select id="new-role" name="role" class="form-input form-select" required>
                                <option value="">選択してください</option>
                                <option value="システム管理者">システム管理者</option>
                                <option value="人事担当者">人事担当者</option>
                                <option value="一般従業員">一般従業員</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="new-department">部署</label>
                            <input type="text" id="new-department" name="department" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="new-password">パスワード</label>
                            <input type="password" id="new-password" name="password" class="form-input" required>
                            <div class="text-xs text-gray-500 mt-1">
                                8文字以上、大文字・小文字・数字・記号を含む
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="confirm-password">パスワード確認</label>
                            <input type="password" id="confirm-password" name="confirmPassword" class="form-input" required>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onclick="closeActiveModal()" class="btn btn-outline">キャンセル</button>
                        <button type="submit" class="btn btn-primary">作成</button>
                    </div>
                </div>
            </form>
        `;
        
        showModal({
            title: '新規ユーザー作成',
            content: modalContent,
            size: 'large'
        });
        
        // フォーム送信処理
        document.getElementById('create-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = Object.fromEntries(formData.entries());
            
            if (userData.password !== userData.confirmPassword) {
                showToast('パスワードが一致しません', 'error');
                return;
            }
            
            try {
                await this.createUser(userData);
                closeActiveModal();
                // ページリロード
                navigateToPage('user-management');
            } catch (error) {
                // エラーは createUser 内で処理済み
            }
        });
    }
}

// グローバルインスタンス作成
window.userManagementSystem = new UserManagementSystem();

// グローバル関数公開
window.generateUserManagementContent = () => window.userManagementSystem.generateUserManagementContent();
window.showCreateUserModal = () => window.userManagementSystem.showCreateUserModal();
window.exportUsersToCSV = () => window.userManagementSystem.exportUsersToCSV();

console.log('ユーザー管理機能初期化完了');