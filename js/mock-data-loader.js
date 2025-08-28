/**
 * 奨学金代理返還情報管理システム - モックデータローダー
 * 本番環境構築前のデモ・テスト用データ提供
 */

class MockDataLoader {
    constructor() {
        this.isInitialized = false;
        this.mockEmployees = [];
        this.mockApplications = [];
        this.mockDocuments = [];
        this.mockUsers = [];
        this.mockAuditLogs = [];
        
        this.initializeMockData();
    }

    initializeMockData() {
        if (this.isInitialized) return;
        
        // モック従業員データ
        this.mockEmployees = [
            {
                id: 'emp-001',
                employee_id: 'EMP-202501-001',
                full_name: '山田太郎',
                email: 'yamada.taro@company.com',
                phone_number: '03-1234-5678',
                department: '人事部',
                position: '主任',
                hire_date: '2024-04-01',
                scholarship_eligible: true,
                current_scholarship_amount: 30000,
                max_support_amount: 50000,
                bank_account: '三菱UFJ銀行 普通 1234567',
                emergency_contact: '090-1234-5678',
                notes: '第一種奨学金利用者',
                status: 'active',
                created_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
                updated_at: Date.now()
            },
            {
                id: 'emp-002',
                employee_id: 'EMP-202501-002',
                full_name: '佐藤花子',
                email: 'sato.hanako@company.com',
                phone_number: '03-2345-6789',
                department: '営業部',
                position: '係長',
                hire_date: '2023-10-01',
                scholarship_eligible: true,
                current_scholarship_amount: 25000,
                max_support_amount: 40000,
                bank_account: 'みずほ銀行 普通 7890123',
                emergency_contact: '090-2345-6789',
                notes: '第二種奨学金利用者',
                status: 'active',
                created_at: Date.now() - 60 * 24 * 60 * 60 * 1000,
                updated_at: Date.now()
            },
            {
                id: 'emp-003',
                employee_id: 'EMP-202501-003',
                full_name: '田中一郎',
                email: 'tanaka.ichiro@company.com',
                phone_number: '03-3456-7890',
                department: '開発部',
                position: '主任',
                hire_date: '2024-01-15',
                scholarship_eligible: false,
                current_scholarship_amount: 0,
                max_support_amount: 0,
                bank_account: '',
                emergency_contact: '090-3456-7890',
                notes: '奨学金利用なし',
                status: 'active',
                created_at: Date.now() - 20 * 24 * 60 * 60 * 1000,
                updated_at: Date.now()
            },
            {
                id: 'emp-004',
                employee_id: 'EMP-202501-004',
                full_name: '鈴木美咲',
                email: 'suzuki.misaki@company.com',
                phone_number: '03-4567-8901',
                department: '経理部',
                position: '担当',
                hire_date: '2024-06-01',
                scholarship_eligible: true,
                current_scholarship_amount: 35000,
                max_support_amount: 60000,
                bank_account: '三井住友銀行 普通 4567890',
                emergency_contact: '090-4567-8901',
                notes: '給付型奨学金併用',
                status: 'active',
                created_at: Date.now() - 45 * 24 * 60 * 60 * 1000,
                updated_at: Date.now()
            },
            {
                id: 'emp-005',
                employee_id: 'EMP-202501-005',
                full_name: '高橋健二',
                email: 'takahashi.kenji@company.com',
                phone_number: '03-5678-9012',
                department: 'IT部',
                position: '課長',
                hire_date: '2022-08-01',
                scholarship_eligible: true,
                current_scholarship_amount: 28000,
                max_support_amount: 45000,
                bank_account: 'りそな銀行 普通 5678901',
                emergency_contact: '090-5678-9012',
                notes: '管理職・奨学金返還中',
                status: 'active',
                created_at: Date.now() - 90 * 24 * 60 * 60 * 1000,
                updated_at: Date.now()
            }
        ];

        // モック申請データ
        this.mockApplications = [
            {
                id: 'app-001',
                employee_id: 'emp-001',
                application_number: 'APP-202501-001',
                scholarship_type: '第一種',
                monthly_amount: 30000,
                total_amount: 1800000,
                start_date: '2025-02-01',
                end_date: '2030-01-31',
                jasso_id: 'J12345678',
                status: 'approved',
                submitted_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
                approved_at: Date.now() - 7 * 24 * 60 * 60 * 1000,
                approved_by: 'user-001',
                comments: '承認済み・支援開始',
                created_at: Date.now() - 20 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 7 * 24 * 60 * 60 * 1000
            },
            {
                id: 'app-002',
                employee_id: 'emp-002',
                application_number: 'APP-202501-002',
                scholarship_type: '第二種',
                monthly_amount: 25000,
                total_amount: 1200000,
                start_date: '2025-03-01',
                end_date: '2029-02-28',
                jasso_id: 'J23456789',
                status: 'pending',
                submitted_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
                approved_at: null,
                approved_by: null,
                comments: '審査中',
                created_at: Date.now() - 5 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 3 * 24 * 60 * 60 * 1000
            },
            {
                id: 'app-003',
                employee_id: 'emp-004',
                application_number: 'APP-202501-003',
                scholarship_type: '給付型',
                monthly_amount: 35000,
                total_amount: 2100000,
                start_date: '2025-04-01',
                end_date: '2030-03-31',
                jasso_id: 'J34567890',
                status: 'draft',
                submitted_at: null,
                approved_at: null,
                approved_by: null,
                comments: '申請書作成中',
                created_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000
            }
        ];

        // モック文書データ
        this.mockDocuments = [
            {
                id: 'doc-001',
                employee_id: 'emp-001',
                application_id: 'app-001',
                document_name: '奨学金返還証明書_山田太郎_202501',
                document_type: '返還証明書',
                file_path: '/documents/scholarship_proof_yamada.pdf',
                file_size: 2048576,
                mime_type: 'application/pdf',
                upload_date: Date.now() - 18 * 24 * 60 * 60 * 1000,
                uploaded_by: 'user-001',
                verification_status: 'verified',
                expiry_date: '2025-12-31',
                checksum: 'abc123def456',
                version: 1,
                created_at: Date.now() - 20 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 18 * 24 * 60 * 60 * 1000
            },
            {
                id: 'doc-002',
                employee_id: 'emp-001',
                application_id: 'app-001',
                document_name: '在職証明書_山田太郎_202501',
                document_type: '在職証明書',
                file_path: '/documents/employment_cert_yamada.pdf',
                file_size: 1024768,
                mime_type: 'application/pdf',
                upload_date: Date.now() - 16 * 24 * 60 * 60 * 1000,
                uploaded_by: 'user-001',
                verification_status: 'verified',
                expiry_date: '2025-06-30',
                checksum: 'def456ghi789',
                version: 1,
                created_at: Date.now() - 18 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 16 * 24 * 60 * 60 * 1000
            },
            {
                id: 'doc-003',
                employee_id: 'emp-002',
                application_id: 'app-002',
                document_name: '同意書_佐藤花子_202501',
                document_type: '同意書',
                file_path: '/documents/consent_form_sato.pdf',
                file_size: 512384,
                mime_type: 'application/pdf',
                upload_date: Date.now() - 4 * 24 * 60 * 60 * 1000,
                uploaded_by: 'user-002',
                verification_status: 'pending',
                expiry_date: '2026-01-31',
                checksum: 'ghi789jkl012',
                version: 1,
                created_at: Date.now() - 5 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 4 * 24 * 60 * 60 * 1000
            }
        ];

        // モックユーザーデータ
        this.mockUsers = [
            {
                id: 'user-001',
                username: 'admin',
                full_name: '松木一真',
                email: 'matsuki.kazuma@company.com',
                role: 'システム管理者',
                department: '新規事業部',
                permissions: ['read', 'write', 'admin'],
                last_login: Date.now() - 2 * 60 * 60 * 1000,
                status: 'active',
                created_at: Date.now() - 100 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 2 * 60 * 60 * 1000
            },
            {
                id: 'user-002',
                username: 'hr_manager',
                full_name: '人事部長',
                email: 'hr.manager@company.com',
                role: '人事管理者',
                department: '人事部',
                permissions: ['read', 'write'],
                last_login: Date.now() - 1 * 24 * 60 * 60 * 1000,
                status: 'active',
                created_at: Date.now() - 80 * 24 * 60 * 60 * 1000,
                updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000
            }
        ];

        // モック監査ログデータ
        this.mockAuditLogs = [
            {
                id: 'log-001',
                action: 'USER_LOGIN',
                user_id: 'user-001',
                details: JSON.stringify({
                    login_method: 'password',
                    success: true,
                    ip_address: '192.168.1.100'
                }),
                ip_address: '192.168.1.100',
                created_at: Date.now() - 2 * 60 * 60 * 1000
            },
            {
                id: 'log-002',
                action: 'DATA_CREATE',
                user_id: 'user-001',
                details: JSON.stringify({
                    table: 'employees',
                    record_id: 'emp-001',
                    operation: 'CREATE'
                }),
                ip_address: '192.168.1.100',
                created_at: Date.now() - 20 * 24 * 60 * 60 * 1000
            },
            {
                id: 'log-003',
                action: 'APPROVAL_APPROVED',
                user_id: 'user-002',
                details: JSON.stringify({
                    application_id: 'app-001',
                    approval_level: 'manager',
                    comments: '承認済み'
                }),
                ip_address: '192.168.1.101',
                created_at: Date.now() - 7 * 24 * 60 * 60 * 1000
            }
        ];

        this.isInitialized = true;
        console.log('✅ モックデータが初期化されました');
        console.log(`📊 従業員: ${this.mockEmployees.length}件`);
        console.log(`📄 申請: ${this.mockApplications.length}件`);
        console.log(`📁 文書: ${this.mockDocuments.length}件`);
        console.log(`👥 ユーザー: ${this.mockUsers.length}件`);
        console.log(`📋 監査ログ: ${this.mockAuditLogs.length}件`);
    }

    // API互換メソッド
    async list(tableName, params = {}) {
        await this.simulateDelay();
        
        const limit = params.limit || 100;
        const page = params.page || 1;
        const search = params.search || '';
        
        let data = [];
        
        switch (tableName) {
            case 'employees':
                data = this.mockEmployees;
                break;
            case 'applications':
                data = this.mockApplications;
                break;
            case 'documents':
                data = this.mockDocuments;
                break;
            case 'users':
                data = this.mockUsers;
                break;
            case 'audit_logs':
                data = this.mockAuditLogs;
                break;
            default:
                throw new Error(`未知のテーブル: ${tableName}`);
        }

        // 検索フィルタリング
        if (search) {
            data = data.filter(item => 
                JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
            );
        }

        // ページネーション
        const offset = (page - 1) * limit;
        const paginatedData = data.slice(offset, offset + limit);

        return {
            data: paginatedData,
            total: data.length,
            page: page,
            limit: limit,
            table: tableName
        };
    }

    async get(tableName, id) {
        await this.simulateDelay();
        
        let data = [];
        
        switch (tableName) {
            case 'employees':
                data = this.mockEmployees;
                break;
            case 'applications':
                data = this.mockApplications;
                break;
            case 'documents':
                data = this.mockDocuments;
                break;
            case 'users':
                data = this.mockUsers;
                break;
            case 'audit_logs':
                data = this.mockAuditLogs;
                break;
            default:
                throw new Error(`未知のテーブル: ${tableName}`);
        }

        const item = data.find(item => item.id === id);
        if (!item) {
            throw new Error(`レコードが見つかりません: ${id}`);
        }

        return item;
    }

    async create(tableName, itemData) {
        await this.simulateDelay();
        
        const newItem = {
            id: this.generateId(),
            ...itemData,
            created_at: Date.now(),
            updated_at: Date.now()
        };

        switch (tableName) {
            case 'employees':
                this.mockEmployees.push(newItem);
                break;
            case 'applications':
                this.mockApplications.push(newItem);
                break;
            case 'documents':
                this.mockDocuments.push(newItem);
                break;
            case 'users':
                this.mockUsers.push(newItem);
                break;
            case 'audit_logs':
                this.mockAuditLogs.push(newItem);
                break;
            default:
                throw new Error(`未知のテーブル: ${tableName}`);
        }

        console.log(`✅ ${tableName} に新しいレコードを作成しました:`, newItem.id);
        return newItem;
    }

    async update(tableName, id, updateData) {
        await this.simulateDelay();
        
        let data = [];
        
        switch (tableName) {
            case 'employees':
                data = this.mockEmployees;
                break;
            case 'applications':
                data = this.mockApplications;
                break;
            case 'documents':
                data = this.mockDocuments;
                break;
            case 'users':
                data = this.mockUsers;
                break;
            case 'audit_logs':
                data = this.mockAuditLogs;
                break;
            default:
                throw new Error(`未知のテーブル: ${tableName}`);
        }

        const itemIndex = data.findIndex(item => item.id === id);
        if (itemIndex === -1) {
            throw new Error(`レコードが見つかりません: ${id}`);
        }

        data[itemIndex] = {
            ...data[itemIndex],
            ...updateData,
            updated_at: Date.now()
        };

        console.log(`✅ ${tableName} のレコードを更新しました:`, id);
        return data[itemIndex];
    }

    async delete(tableName, id) {
        await this.simulateDelay();
        
        let data = [];
        
        switch (tableName) {
            case 'employees':
                data = this.mockEmployees;
                break;
            case 'applications':
                data = this.mockApplications;
                break;
            case 'documents':
                data = this.mockDocuments;
                break;
            case 'users':
                data = this.mockUsers;
                break;
            case 'audit_logs':
                data = this.mockAuditLogs;
                break;
            default:
                throw new Error(`未知のテーブル: ${tableName}`);
        }

        const itemIndex = data.findIndex(item => item.id === id);
        if (itemIndex === -1) {
            throw new Error(`レコードが見つかりません: ${id}`);
        }

        const deletedItem = data.splice(itemIndex, 1)[0];
        console.log(`✅ ${tableName} のレコードを削除しました:`, id);
        return deletedItem;
    }

    // ダッシュボード用統計データ
    async getDashboardStats() {
        await this.simulateDelay();
        
        const activeEmployees = this.mockEmployees.filter(emp => emp.status === 'active');
        const scholarshipEligible = activeEmployees.filter(emp => emp.scholarship_eligible);
        const pendingApplications = this.mockApplications.filter(app => app.status === 'pending');
        const approvedApplications = this.mockApplications.filter(app => app.status === 'approved');
        
        return {
            totalEmployees: activeEmployees.length,
            scholarshipEligible: scholarshipEligible.length,
            totalApplications: this.mockApplications.length,
            pendingApplications: pendingApplications.length,
            approvedApplications: approvedApplications.length,
            totalMonthlySupport: scholarshipEligible.reduce((sum, emp) => sum + (emp.current_scholarship_amount || 0), 0),
            averageSupport: scholarshipEligible.length > 0 ? 
                Math.round(scholarshipEligible.reduce((sum, emp) => sum + (emp.current_scholarship_amount || 0), 0) / scholarshipEligible.length) : 0
        };
    }

    // 検索用メソッド
    async searchEmployees(query) {
        await this.simulateDelay();
        
        return this.mockEmployees.filter(emp => 
            emp.full_name.includes(query) ||
            emp.employee_id.includes(query) ||
            emp.department.includes(query) ||
            emp.email.includes(query)
        );
    }

    async searchApplications(query) {
        await this.simulateDelay();
        
        return this.mockApplications.filter(app => 
            app.application_number.includes(query) ||
            app.scholarship_type.includes(query) ||
            app.status.includes(query)
        );
    }

    async getDocuments(params = {}) {
        await this.simulateDelay();
        
        let documents = [...this.mockDocuments];
        
        if (params.employee_id) {
            documents = documents.filter(doc => doc.employee_id === params.employee_id);
        }
        
        if (params.application_id) {
            documents = documents.filter(doc => doc.application_id === params.application_id);
        }
        
        return documents;
    }

    // ユーティリティメソッド
    async simulateDelay() {
        // 実際のAPI呼び出しをシミュレート（100-300msの遅延）
        const delay = Math.random() * 200 + 100;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    generateId() {
        return 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    // 統計・分析用メソッド
    getStatistics() {
        return {
            employees: {
                total: this.mockEmployees.length,
                active: this.mockEmployees.filter(emp => emp.status === 'active').length,
                scholarship_eligible: this.mockEmployees.filter(emp => emp.scholarship_eligible).length
            },
            applications: {
                total: this.mockApplications.length,
                pending: this.mockApplications.filter(app => app.status === 'pending').length,
                approved: this.mockApplications.filter(app => app.status === 'approved').length,
                draft: this.mockApplications.filter(app => app.status === 'draft').length
            },
            documents: {
                total: this.mockDocuments.length,
                verified: this.mockDocuments.filter(doc => doc.verification_status === 'verified').length,
                pending: this.mockDocuments.filter(doc => doc.verification_status === 'pending').length
            }
        };
    }
}

// グローバルインスタンス作成（scholarshipAPIの代替）
window.scholarshipAPI = new MockDataLoader();

// reportManagerの代替
window.reportManager = {
    async generateDashboardReport() {
        const stats = await window.scholarshipAPI.getDashboardStats();
        return {
            summary: stats,
            generated_at: new Date().toISOString(),
            type: 'dashboard'
        };
    },
    
    async generatePeriodReport(startDate, endDate, type) {
        const data = await window.scholarshipAPI.list(type);
        return {
            data: data.data,
            period: { start: startDate, end: endDate },
            generated_at: new Date().toISOString(),
            type: 'period'
        };
    },
    
    async generateJassoReport(startDate, endDate, format) {
        const applications = await window.scholarshipAPI.list('applications');
        return {
            applications: applications.data,
            format: format,
            period: { start: startDate, end: endDate },
            generated_at: new Date().toISOString(),
            type: 'jasso'
        };
    }
};

console.log('🎯 モックデータローダーが初期化されました');
console.log('💡 これで全ての機能がデモンストレーション可能です');