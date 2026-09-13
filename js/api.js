/**
 * RESTful Table API統合モジュール
 * 
 * データベースとの完全な連携機能を提供
 */

class ScholarshipAPI {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5分間のキャッシュ
    }

    /**
     * HTTP リクエスト基盤メソッド
     */
    async request(url, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${this.baseUrl}${url}`, config);
            
            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * 従業員データ操作
     */
    async getEmployees(params = {}) {
        const cacheKey = `employees_${JSON.stringify(params)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const queryString = new URLSearchParams(params).toString();
        const data = await this.request(`/tables/employees${queryString ? '?' + queryString : ''}`);
        
        this.setCache(cacheKey, data);
        return data;
    }

    async getEmployee(id) {
        const cacheKey = `employee_${id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const data = await this.request(`/tables/employees/${id}`);
        this.setCache(cacheKey, data);
        return data;
    }

    async createEmployee(employeeData) {
        const data = await this.request('/tables/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
        
        // キャッシュクリア
        this.clearCacheByPattern('employees_');
        await this.logAction('CREATE', 'employees', data.id, null, employeeData);
        
        return data;
    }

    async updateEmployee(id, employeeData) {
        const oldData = await this.getEmployee(id);
        
        const data = await this.request(`/tables/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
        
        // キャッシュクリア
        this.clearCacheByPattern('employee');
        await this.logAction('UPDATE', 'employees', id, oldData, employeeData);
        
        return data;
    }

    async deleteEmployee(id) {
        const oldData = await this.getEmployee(id);
        
        await this.request(`/tables/employees/${id}`, {
            method: 'DELETE'
        });
        
        // キャッシュクリア
        this.clearCacheByPattern('employee');
        await this.logAction('DELETE', 'employees', id, oldData, null);
        
        return { success: true };
    }

    /**
     * 申請データ操作
     */
    async getApplications(params = {}) {
        const cacheKey = `applications_${JSON.stringify(params)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const queryString = new URLSearchParams(params).toString();
        const data = await this.request(`/tables/applications${queryString ? '?' + queryString : ''}`);
        
        this.setCache(cacheKey, data);
        return data;
    }

    async getApplication(id) {
        const cacheKey = `application_${id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const data = await this.request(`/tables/applications/${id}`);
        this.setCache(cacheKey, data);
        return data;
    }

    async createApplication(applicationData) {
        const data = await this.request('/tables/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
        
        this.clearCacheByPattern('application');
        await this.logAction('CREATE', 'applications', data.id, null, applicationData);
        
        return data;
    }

    async updateApplication(id, applicationData) {
        const oldData = await this.getApplication(id);
        
        const data = await this.request(`/tables/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(applicationData)
        });
        
        this.clearCacheByPattern('application');
        await this.logAction('UPDATE', 'applications', id, oldData, applicationData);
        
        return data;
    }

    async updateApplicationStatus(id, status, reason = '') {
        const oldData = await this.getApplication(id);
        const updateData = {
            ...oldData,
            status: status,
            updated_at: new Date().toISOString()
        };

        if (status === '承認済み') {
            updateData.approved_by = window.SCHOLARSHIP_SYSTEM.currentUser.name;
            updateData.approved_date = new Date().toISOString();
        }

        const data = await this.updateApplication(id, updateData);
        
        // ステータス変更の特別ログ
        await this.logAction('STATUS_UPDATE', 'applications', id, 
            { status: oldData.status }, 
            { status: status, reason: reason }
        );
        
        return data;
    }

    /**
     * 書類データ操作
     */
    async getDocuments(params = {}) {
        const cacheKey = `documents_${JSON.stringify(params)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const queryString = new URLSearchParams(params).toString();
        const data = await this.request(`/tables/documents${queryString ? '?' + queryString : ''}`);
        
        this.setCache(cacheKey, data);
        return data;
    }

    async getDocument(id) {
        const data = await this.request(`/tables/documents/${id}`);
        return data;
    }

    async createDocument(documentData) {
        const data = await this.request('/tables/documents', {
            method: 'POST',
            body: JSON.stringify(documentData)
        });
        
        this.clearCacheByPattern('document');
        await this.logAction('CREATE', 'documents', data.id, null, documentData);
        
        return data;
    }

    async updateDocumentStatus(id, status, reason = '') {
        const oldData = await this.getDocument(id);
        const updateData = {
            ...oldData,
            verification_status: status,
            verified_by: window.SCHOLARSHIP_SYSTEM.currentUser.name,
            verified_date: new Date().toISOString()
        };

        const data = await this.request(`/tables/documents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        this.clearCacheByPattern('document');
        await this.logAction('VERIFY', 'documents', id, 
            { verification_status: oldData.verification_status }, 
            { verification_status: status, reason: reason }
        );
        
        return data;
    }

    /**
     * ユーザー管理
     */
    async getUsers(params = {}) {
        const data = await this.request(`/tables/users?${new URLSearchParams(params)}`);
        return data;
    }

    async createUser(userData) {
        const data = await this.request('/tables/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        await this.logAction('CREATE', 'users', data.id, null, userData);
        return data;
    }

    /**
     * 監査ログ記録
     */
    async logAction(action, targetTable, targetId, oldValues, newValues) {
        try {
            const logData = {
                user_id: window.SCHOLARSHIP_SYSTEM.currentUser.id || 'system',
                action: action,
                target_table: targetTable,
                target_id: targetId,
                old_values: oldValues ? JSON.stringify(oldValues) : null,
                new_values: newValues ? JSON.stringify(newValues) : null,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            await this.request('/tables/audit_logs', {
                method: 'POST',
                body: JSON.stringify(logData)
            });
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    }

    /**
     * 統計データ取得
     */
    async getDashboardStats() {
        try {
            const [employees, applications, documents] = await Promise.all([
                this.getEmployees({ limit: 1000 }),
                this.getApplications({ limit: 1000 }),
                this.getDocuments({ limit: 1000 })
            ]);

            return {
                totalEmployees: employees.total || employees.data.length,
                activeApplications: applications.data.filter(app => app.status === '申請中').length,
                monthlyRepayment: applications.data
                    .filter(app => app.status === '返還中')
                    .reduce((sum, app) => sum + (app.monthly_amount || 0), 0),
                completedApplications: applications.data.filter(app => app.status === '完了').length,
                pendingDocuments: documents.data.filter(doc => doc.verification_status === '未確認').length,
                applicationsByStatus: this.groupByStatus(applications.data),
                documentsByStatus: this.groupByStatus(documents.data, 'verification_status')
            };
        } catch (error) {
            console.error('Failed to get dashboard stats:', error);
            throw error;
        }
    }

    /**
     * 高度な検索機能
     */
    async searchEmployees(searchCriteria) {
        const params = {
            search: searchCriteria.search || '',
            limit: searchCriteria.limit || 50,
            page: searchCriteria.page || 1
        };

        // 部署フィルター
        if (searchCriteria.department) {
            params.department = searchCriteria.department;
        }

        // 奨学金種別フィルター
        if (searchCriteria.scholarship_type) {
            params.scholarship_type = searchCriteria.scholarship_type;
        }

        // 日付範囲フィルター
        if (searchCriteria.hire_date_from) {
            params.hire_date_from = searchCriteria.hire_date_from;
        }
        if (searchCriteria.hire_date_to) {
            params.hire_date_to = searchCriteria.hire_date_to;
        }

        return await this.getEmployees(params);
    }

    async searchApplications(searchCriteria) {
        const params = {
            search: searchCriteria.search || '',
            limit: searchCriteria.limit || 50,
            page: searchCriteria.page || 1
        };

        if (searchCriteria.status) {
            params.status = searchCriteria.status;
        }

        if (searchCriteria.date_from) {
            params.application_date_from = searchCriteria.date_from;
        }
        if (searchCriteria.date_to) {
            params.application_date_to = searchCriteria.date_to;
        }

        return await this.getApplications(params);
    }

    /**
     * レポート生成
     */
    async generateJASSO Report(params = {}) {
        const applications = await this.getApplications({ 
            status: '承認済み',
            limit: 1000 
        });

        const reportData = applications.data.map(app => ({
            '申請ID': app.id,
            '社員番号': app.employee_number || '',
            '氏名': app.employee_name || '',
            '奨学生番号': app.scholarship_number || '',
            '申請対象期間開始': this.formatDate(app.application_period_start),
            '申請対象期間終了': this.formatDate(app.application_period_end),
            '月次代理返還額': app.monthly_amount,
            '承認日': this.formatDate(app.approved_date),
            '承認者': app.approved_by
        }));

        return {
            data: reportData,
            summary: {
                total_applications: reportData.length,
                total_amount: reportData.reduce((sum, item) => sum + (item['月次代理返還額'] || 0), 0),
                generated_at: this.formatDate(new Date()),
                generated_by: window.SCHOLARSHIP_SYSTEM.currentUser.name
            }
        };
    }

    /**
     * キャッシュ管理
     */
    getFromCache(key) {
        const item = this.cache.get(key);
        if (item && Date.now() - item.timestamp < this.cacheTTL) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCacheByPattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    clearAllCache() {
        this.cache.clear();
    }

    /**
     * ユーティリティメソッド
     */
    groupByStatus(items, statusField = 'status') {
        return items.reduce((groups, item) => {
            const status = item[statusField];
            if (!groups[status]) groups[status] = [];
            groups[status].push(item);
            return groups;
        }, {});
    }

    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ja-JP');
    }

    async getClientIP() {
        try {
            // 実際のシステムでは適切なIP取得方法を使用
            return '127.0.0.1';
        } catch {
            return 'unknown';
        }
    }

    /**
     * バッチ操作
     */
    async bulkUpdateApplicationStatus(applicationIds, newStatus, reason = '') {
        const results = [];
        
        for (const id of applicationIds) {
            try {
                const result = await this.updateApplicationStatus(id, newStatus, reason);
                results.push({ id, success: true, data: result });
            } catch (error) {
                results.push({ id, success: false, error: error.message });
            }
        }

        return {
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results: results
        };
    }

    /**
     * データ整合性チェック
     */
    async validateDataIntegrity() {
        const issues = [];

        try {
            // 従業員と申請の整合性チェック
            const employees = await this.getEmployees({ limit: 1000 });
            const applications = await this.getApplications({ limit: 1000 });

            const employeeIds = new Set(employees.data.map(emp => emp.id));
            
            applications.data.forEach(app => {
                if (app.employee_id && !employeeIds.has(app.employee_id)) {
                    issues.push({
                        type: 'MISSING_EMPLOYEE',
                        table: 'applications',
                        id: app.id,
                        message: `Application ${app.id} references non-existent employee ${app.employee_id}`
                    });
                }
            });

            // 書類と申請の整合性チェック
            const documents = await this.getDocuments({ limit: 1000 });
            const applicationIds = new Set(applications.data.map(app => app.id));

            documents.data.forEach(doc => {
                if (doc.application_id && !applicationIds.has(doc.application_id)) {
                    issues.push({
                        type: 'MISSING_APPLICATION',
                        table: 'documents',
                        id: doc.id,
                        message: `Document ${doc.id} references non-existent application ${doc.application_id}`
                    });
                }
            });

        } catch (error) {
            issues.push({
                type: 'VALIDATION_ERROR',
                message: `Validation failed: ${error.message}`
            });
        }

        return {
            isValid: issues.length === 0,
            issues: issues,
            checkedAt: new Date().toISOString()
        };
    }
}

/**
 * API エラークラス
 */
class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

// グローバルAPIインスタンス
window.scholarshipAPI = new ScholarshipAPI();

// API関数をグローバルに公開
window.ScholarshipAPI = ScholarshipAPI;
window.APIError = APIError;

console.log('RESTful Table API統合モジュール初期化完了');