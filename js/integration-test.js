/**
 * 奨学金代理返還情報管理システム - 統合テストシステム
 * フルスタック機能の統合テストとデバッグを実行
 */

class IntegrationTestSuite {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.startTime = null;
        this.systemComponents = [
            'errorHandler',
            'performanceOptimizer',
            'auditLogger',
            'scholarshipAPI',
            'advancedSearchManager',
            'reportManager',
            'userManagementSystem'
        ];
        
        this.initializeTestSuite();
    }

    initializeTestSuite() {
        // ページ読み込み完了後にテストを開始
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.runFullIntegrationTest(), 1000);
            });
        } else {
            setTimeout(() => this.runFullIntegrationTest(), 1000);
        }
    }

    /**
     * フルスタック統合テストの実行
     */
    async runFullIntegrationTest() {
        console.log('🚀 フルスタック統合テストを開始します...');
        this.startTime = Date.now();
        
        try {
            // システム初期化テスト
            await this.testSystemInitialization();
            
            // API統合テスト
            await this.testAPIIntegration();
            
            // エラーハンドリングテスト
            await this.testErrorHandling();
            
            // パフォーマンステスト
            await this.testPerformanceOptimization();
            
            // 監査ログテスト
            await this.testAuditLogging();
            
            // 検索機能テスト
            await this.testAdvancedSearch();
            
            // レポート機能テスト
            await this.testReportGeneration();
            
            // ユーザー管理テスト
            await this.testUserManagement();
            
            // 統合ワークフローテスト
            await this.testIntegratedWorkflow();
            
            // テスト結果のレポート
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ 統合テストでエラーが発生:', error);
            await this.handleTestError(error);
        }
    }

    /**
     * システム初期化テスト
     */
    async testSystemInitialization() {
        const testName = 'システム初期化テスト';
        this.startTest(testName);
        
        try {
            // 全システムコンポーネントの存在確認
            const missingComponents = [];
            for (const component of this.systemComponents) {
                if (!window[component]) {
                    missingComponents.push(component);
                }
            }
            
            if (missingComponents.length > 0) {
                throw new Error(`未初期化のコンポーネント: ${missingComponents.join(', ')}`);
            }
            
            // DOM要素の確認
            const requiredElements = [
                '#dashboard',
                '#employee-management',
                '#application-management',
                '#document-management',
                '#reports',
                '#user-management'
            ];
            
            const missingElements = [];
            for (const selector of requiredElements) {
                if (!document.querySelector(selector)) {
                    missingElements.push(selector);
                }
            }
            
            if (missingElements.length > 0) {
                throw new Error(`未定義のDOM要素: ${missingElements.join(', ')}`);
            }
            
            this.passTest(testName, 'すべてのシステムコンポーネントが正常に初期化されました');
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * API統合テスト
     */
    async testAPIIntegration() {
        const testName = 'API統合テスト';
        this.startTest(testName);
        
        try {
            const api = window.scholarshipAPI;
            if (!api) {
                throw new Error('ScholarshipAPI が初期化されていません');
            }
            
            // 基本的なCRUD操作テスト
            const testEmployee = {
                employee_id: 'TEST-001',
                full_name: 'テスト従業員',
                email: 'test@example.com',
                phone_number: '03-1234-5678',
                department: 'テスト部門',
                position: 'テスト職',
                hire_date: new Date().toISOString().split('T')[0],
                scholarship_eligible: true,
                status: 'active'
            };
            
            // CREATE テスト
            const createdEmployee = await api.create('employees', testEmployee);
            if (!createdEmployee.id) {
                throw new Error('従業員作成に失敗しました');
            }
            
            // READ テスト
            const fetchedEmployee = await api.get('employees', createdEmployee.id);
            if (fetchedEmployee.employee_id !== testEmployee.employee_id) {
                throw new Error('従業員取得に失敗しました');
            }
            
            // UPDATE テスト
            const updatedData = { department: '更新されたテスト部門' };
            const updatedEmployee = await api.update('employees', createdEmployee.id, updatedData);
            if (updatedEmployee.department !== updatedData.department) {
                throw new Error('従業員更新に失敗しました');
            }
            
            // LIST テスト
            const employeeList = await api.list('employees', { limit: 10 });
            if (!Array.isArray(employeeList.data)) {
                throw new Error('従業員一覧取得に失敗しました');
            }
            
            // DELETE テスト
            await api.delete('employees', createdEmployee.id);
            
            this.passTest(testName, 'すべてのCRUD操作が正常に動作しました');
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * エラーハンドリングテスト
     */
    async testErrorHandling() {
        const testName = 'エラーハンドリングテスト';
        this.startTest(testName);
        
        try {
            const errorHandler = window.errorHandler;
            if (!errorHandler) {
                throw new Error('ErrorHandler が初期化されていません');
            }
            
            // 人工的なエラーを生成してテスト
            const testError = new Error('テスト用のエラーメッセージ');
            testError.name = 'TestError';
            
            const errorRecord = await errorHandler.handleError(testError, {
                testContext: 'integration-test',
                component: 'error-handling-test'
            });
            
            if (!errorRecord.id) {
                throw new Error('エラー記録の生成に失敗しました');
            }
            
            // 入力検証テスト
            const validationSchema = errorHandler.getScholarshipValidationSchema();
            const invalidData = {
                employeeId: 'INVALID',
                fullName: '',
                email: 'invalid-email',
                phoneNumber: '123',
                scholarshipAmount: -1000
            };
            
            const validationResult = errorHandler.validateInput(invalidData, validationSchema);
            if (validationResult.isValid) {
                throw new Error('無効なデータが検証を通過しました');
            }
            
            if (validationResult.errors.length === 0) {
                throw new Error('検証エラーが検出されませんでした');
            }
            
            this.passTest(testName, `エラーハンドリングが正常に動作しました（${validationResult.errors.length}件の検証エラーを検出）`);
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * パフォーマンステスト
     */
    async testPerformanceOptimization() {
        const testName = 'パフォーマンス最適化テスト';
        this.startTest(testName);
        
        try {
            const optimizer = window.performanceOptimizer;
            if (!optimizer) {
                throw new Error('PerformanceOptimizer が初期化されていません');
            }
            
            // キャッシュ機能テスト
            const testKey = 'test-cache-key';
            let fetchCount = 0;
            const testFetcher = () => {
                fetchCount++;
                return Promise.resolve({ data: 'test-data', timestamp: Date.now() });
            };
            
            // 最初の取得（キャッシュミス）
            const result1 = await optimizer.get(testKey, testFetcher);
            
            // 2回目の取得（キャッシュヒット）
            const result2 = await optimizer.get(testKey, testFetcher);
            
            if (fetchCount !== 1) {
                throw new Error(`キャッシュが機能していません（取得回数: ${fetchCount}）`);
            }
            
            // メトリクス確認
            const metrics = optimizer.getMetrics();
            if (metrics.cacheHits === 0) {
                throw new Error('キャッシュヒットが記録されていません');
            }
            
            // バッチ処理テスト
            const batchKeys = ['key1', 'key2', 'key3'];
            const batchFetcher = (keys) => {
                return Promise.resolve(keys.map(key => ({ key, data: `data-${key}` })));
            };
            
            const batchResults = await optimizer.batchGet(batchKeys, batchFetcher);
            if (batchResults.size !== batchKeys.length) {
                throw new Error('バッチ処理が正常に動作していません');
            }
            
            this.passTest(testName, `パフォーマンス最適化が正常に動作しました（キャッシュヒット率: ${metrics.cacheHitRate.toFixed(1)}%）`);
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * 監査ログテスト
     */
    async testAuditLogging() {
        const testName = '監査ログテスト';
        this.startTest(testName);
        
        try {
            const auditLogger = window.auditLogger;
            if (!auditLogger) {
                throw new Error('AuditLogger が初期化されていません');
            }
            
            // 各種ログの記録テスト
            const userActionId = await auditLogger.logUserAction('TEST_ACTION', 'test-target', 'old-value', 'new-value');
            const dataChangeId = await auditLogger.logDataChange('employees', 'test-id', 'UPDATE', { name: 'updated' });
            const authEventId = await auditLogger.logAuthEvent('LOGIN', 'test-user', true);
            const securityEventId = await auditLogger.logSecurityEvent('SUSPICIOUS_ACTIVITY', 'medium');
            
            if (!userActionId || !dataChangeId || !authEventId || !securityEventId) {
                throw new Error('監査ログの記録に失敗しました');
            }
            
            // ログ統計の確認
            const statistics = auditLogger.getStatistics();
            if (statistics.queue_size < 0) {
                throw new Error('監査ログ統計が正常に取得できません');
            }
            
            // ログフラッシュテスト
            await auditLogger.flushLogs(true);
            
            this.passTest(testName, `監査ログが正常に動作しました（キューサイズ: ${statistics.queue_size}）`);
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * 検索機能テスト
     */
    async testAdvancedSearch() {
        const testName = '高度検索機能テスト';
        this.startTest(testName);
        
        try {
            const searchManager = window.advancedSearchManager;
            if (!searchManager) {
                throw new Error('AdvancedSearchManager が初期化されていません');
            }
            
            // グローバル検索テスト
            const searchResults = await searchManager.globalSearch('テスト', {
                tables: ['employees'],
                limit: 10
            });
            
            if (!searchResults || !Array.isArray(searchResults.results)) {
                throw new Error('グローバル検索が正常に動作していません');
            }
            
            // フィルタリングテスト
            const filterOptions = {
                status: 'active',
                department: 'テスト部門'
            };
            
            const filteredResults = await searchManager.advancedFilter('employees', filterOptions);
            
            if (!filteredResults || !Array.isArray(filteredResults.data)) {
                throw new Error('高度フィルタリングが正常に動作していません');
            }
            
            // 検索履歴テスト
            searchManager.addToSearchHistory('テスト検索', 'employees', { query: 'テスト' });
            const history = searchManager.getSearchHistory();
            
            if (!Array.isArray(history) || history.length === 0) {
                throw new Error('検索履歴が正常に記録されていません');
            }
            
            this.passTest(testName, `高度検索機能が正常に動作しました（検索結果: ${searchResults.results.length}件）`);
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * レポート機能テスト
     */
    async testReportGeneration() {
        const testName = 'レポート生成テスト';
        this.startTest(testName);
        
        try {
            const reportManager = window.reportManager;
            if (!reportManager) {
                throw new Error('ReportManager が初期化されていません');
            }
            
            // ダッシュボードレポートテスト
            const dashboardReport = await reportManager.generateDashboardReport();
            
            if (!dashboardReport || !dashboardReport.summary) {
                throw new Error('ダッシュボードレポートの生成に失敗しました');
            }
            
            // 期間指定レポートテスト
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30日前
            const endDate = new Date();
            
            const periodReport = await reportManager.generatePeriodReport(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
                'employees'
            );
            
            if (!periodReport || !Array.isArray(periodReport.data)) {
                throw new Error('期間指定レポートの生成に失敗しました');
            }
            
            // JASSO レポートテスト（模擬）
            const jassoReport = await reportManager.generateJassoReport(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
                'csv'
            );
            
            if (!jassoReport) {
                throw new Error('JASSO レポートの生成に失敗しました');
            }
            
            this.passTest(testName, `レポート生成が正常に動作しました（期間レポート: ${periodReport.data.length}件）`);
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * ユーザー管理テスト
     */
    async testUserManagement() {
        const testName = 'ユーザー管理テスト';
        this.startTest(testName);
        
        try {
            const userManager = window.userManagementSystem;
            if (!userManager) {
                throw new Error('UserManagementSystem が初期化されていません');
            }
            
            // 権限チェックテスト
            const hasReadPermission = userManager.hasPermission('admin-user', 'read');
            const hasWritePermission = userManager.hasPermission('admin-user', 'write');
            
            if (!hasReadPermission || !hasWritePermission) {
                throw new Error('権限チェックが正常に動作していません');
            }
            
            // パスワード強度チェックテスト
            const weakPassword = userManager.checkPasswordStrength('123456');
            const strongPassword = userManager.checkPasswordStrength('SecurePassword123!');
            
            if (weakPassword.strength !== 'weak' || strongPassword.strength !== 'strong') {
                throw new Error('パスワード強度チェックが正常に動作していません');
            }
            
            // セッション管理テスト
            const sessionData = {
                userId: 'test-user',
                loginTime: Date.now(),
                permissions: ['read', 'write']
            };
            
            userManager.startSession('test-session', sessionData);
            const session = userManager.getSession('test-session');
            
            if (!session || session.userId !== sessionData.userId) {
                throw new Error('セッション管理が正常に動作していません');
            }
            
            this.passTest(testName, 'ユーザー管理システムが正常に動作しました');
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    /**
     * 統合ワークフローテスト
     */
    async testIntegratedWorkflow() {
        const testName = '統合ワークフローテスト';
        this.startTest(testName);
        
        try {
            // 1. 新規従業員登録 → 2. 申請作成 → 3. 承認プロセス → 4. レポート生成
            // この一連の流れをテスト
            
            // 1. 従業員登録（APIとエラーハンドリングの統合）
            const testEmployee = {
                employee_id: 'WF-TEST-001',
                full_name: 'ワークフローテスト従業員',
                email: 'workflow@test.com',
                phone_number: '03-9999-8888',
                department: 'ワークフロー部門',
                position: 'テスター',
                hire_date: new Date().toISOString().split('T')[0],
                scholarship_eligible: true,
                status: 'active'
            };
            
            // 入力検証
            const validationResult = window.errorHandler.validateInput(
                testEmployee, 
                window.errorHandler.getScholarshipValidationSchema()
            );
            
            if (!validationResult.isValid) {
                throw new Error(`入力検証に失敗: ${validationResult.summary}`);
            }
            
            // データベース保存
            const createdEmployee = await window.scholarshipAPI.create('employees', testEmployee);
            
            // 監査ログ記録
            await window.auditLogger.logDataChange('employees', createdEmployee.id, 'CREATE', testEmployee);
            
            // 2. 申請作成
            const testApplication = {
                employee_id: createdEmployee.id,
                scholarship_type: '第一種',
                monthly_amount: 30000,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'pending',
                submitted_at: Date.now()
            };
            
            const createdApplication = await window.scholarshipAPI.create('applications', testApplication);
            
            // 3. パフォーマンス最適化されたデータ取得
            const cachedEmployee = await window.performanceOptimizer.get(
                `employee:${createdEmployee.id}`,
                () => window.scholarshipAPI.get('employees', createdEmployee.id)
            );
            
            if (cachedEmployee.employee_id !== testEmployee.employee_id) {
                throw new Error('キャッシュされたデータが正しくありません');
            }
            
            // 4. 検索システムでの確認
            const searchResults = await window.advancedSearchManager.globalSearch(
                testEmployee.full_name,
                { tables: ['employees'], limit: 1 }
            );
            
            if (searchResults.results.length === 0) {
                throw new Error('作成した従業員が検索結果に表示されません');
            }
            
            // 5. レポート生成
            const report = await window.reportManager.generateDashboardReport();
            
            if (!report || !report.summary) {
                throw new Error('統合レポートの生成に失敗しました');
            }
            
            // クリーンアップ
            await window.scholarshipAPI.delete('applications', createdApplication.id);
            await window.scholarshipAPI.delete('employees', createdEmployee.id);
            
            this.passTest(testName, '統合ワークフローが正常に動作しました（従業員登録→申請作成→検索→レポート生成）');
            
        } catch (error) {
            this.failTest(testName, error.message);
        }
    }

    // テスト管理メソッド
    startTest(testName) {
        this.currentTest = {
            name: testName,
            startTime: Date.now(),
            status: 'running'
        };
        console.log(`🔄 ${testName} を開始...`);
    }

    passTest(testName, message) {
        const duration = Date.now() - this.currentTest.startTime;
        const result = {
            name: testName,
            status: 'passed',
            message: message,
            duration: duration
        };
        
        this.testResults.push(result);
        console.log(`✅ ${testName} が成功しました - ${message} (${duration}ms)`);
    }

    failTest(testName, error) {
        const duration = Date.now() - this.currentTest.startTime;
        const result = {
            name: testName,
            status: 'failed',
            error: error,
            duration: duration
        };
        
        this.testResults.push(result);
        console.error(`❌ ${testName} が失敗しました - ${error} (${duration}ms)`);
    }

    async handleTestError(error) {
        console.error('統合テストでエラーが発生しました:', error);
        
        if (window.errorHandler) {
            await window.errorHandler.handleError(error, {
                source: 'integration-test',
                testSuite: 'full-stack-integration'
            });
        }
        
        if (window.auditLogger) {
            await window.auditLogger.logSystemError(error, {
                component: 'integration-test-suite',
                phase: 'test-execution'
            });
        }
    }

    /**
     * テスト結果レポートの生成
     */
    generateTestReport() {
        const totalDuration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.status === 'passed').length;
        const failedTests = this.testResults.filter(r => r.status === 'failed').length;
        const totalTests = this.testResults.length;
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                successRate: ((passedTests / totalTests) * 100).toFixed(1),
                totalDuration: totalDuration
            },
            details: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        console.log('\n🎯 ===== フルスタック統合テスト結果 =====');
        console.log(`📊 総テスト数: ${totalTests}`);
        console.log(`✅ 成功: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`📈 成功率: ${report.summary.successRate}%`);
        console.log(`⏱️ 総実行時間: ${totalDuration}ms`);
        console.log('==========================================\n');
        
        // 失敗したテストの詳細
        const failedDetails = this.testResults.filter(r => r.status === 'failed');
        if (failedDetails.length > 0) {
            console.log('❌ 失敗したテストの詳細:');
            failedDetails.forEach(test => {
                console.log(`  - ${test.name}: ${test.error}`);
            });
            console.log('');
        }
        
        // 成功したテストの詳細
        const passedDetails = this.testResults.filter(r => r.status === 'passed');
        if (passedDetails.length > 0) {
            console.log('✅ 成功したテストの詳細:');
            passedDetails.forEach(test => {
                console.log(`  - ${test.name}: ${test.message} (${test.duration}ms)`);
            });
        }
        
        // グローバルにテスト結果を保存
        window.integrationTestResults = report;
        
        // ローカルストレージにも保存
        localStorage.setItem('integrationTestResults', JSON.stringify(report));
        
        // 監査ログに記録
        if (window.auditLogger) {
            window.auditLogger.logSystemError(
                new Error('統合テスト完了'),
                {
                    testResults: report.summary,
                    component: 'integration-test-suite'
                }
            );
        }
        
        return report;
    }

    // パブリックAPI
    getTestResults() {
        return this.testResults;
    }

    getLastTestReport() {
        return window.integrationTestResults;
    }
}

// グローバルインスタンス作成
window.integrationTestSuite = new IntegrationTestSuite();

console.log('🧪 奨学金代理返還システム - 統合テストシステムが初期化されました');