/**
 * 高度な検索・フィルター・ソート機能
 * 
 * 複雑な検索条件とデータ操作を提供
 */

class AdvancedSearchManager {
    constructor() {
        this.currentFilters = new Map();
        this.sortConfig = { field: null, direction: 'asc' };
        this.searchHistory = [];
        this.savedSearches = new Map();
    }

    /**
     * 従業員の高度検索
     */
    async searchEmployees(criteria) {
        try {
            showLoadingSpinner();
            
            const searchParams = this.buildEmployeeSearchParams(criteria);
            const results = await window.scholarshipAPI.searchEmployees(searchParams);
            
            // 検索履歴に追加
            this.addToSearchHistory('employees', criteria);
            
            hideLoadingSpinner();
            return results;
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('従業員検索エラー:', error);
            showToast('検索処理でエラーが発生しました', 'error');
            return [];
        }
    }

    /**
     * 申請の高度検索
     */
    async searchApplications(criteria) {
        try {
            showLoadingSpinner();
            
            const searchParams = this.buildApplicationSearchParams(criteria);
            const results = await window.scholarshipAPI.searchApplications(searchParams);
            
            this.addToSearchHistory('applications', criteria);
            
            hideLoadingSpinner();
            return results;
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('申請検索エラー:', error);
            showToast('検索処理でエラーが発生しました', 'error');
            return [];
        }
    }

    /**
     * 書類の高度検索
     */
    async searchDocuments(criteria) {
        try {
            showLoadingSpinner();
            
            const searchParams = this.buildDocumentSearchParams(criteria);
            const results = await window.scholarshipAPI.getDocuments(searchParams);
            
            this.addToSearchHistory('documents', criteria);
            
            hideLoadingSpinner();
            return results.data;
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('書類検索エラー:', error);
            showToast('検索処理でエラーが発生しました', 'error');
            return [];
        }
    }

    /**
     * 従業員検索パラメータ構築
     */
    buildEmployeeSearchParams(criteria) {
        const params = {
            limit: criteria.limit || 50,
            page: criteria.page || 1
        };

        // テキスト検索
        if (criteria.search) {
            params.search = criteria.search;
        }

        // 部署フィルター
        if (criteria.department) {
            params.department = criteria.department;
        }

        // 奨学金種別フィルター
        if (criteria.scholarship_type) {
            params.scholarship_type = criteria.scholarship_type;
        }

        // 月次返還額範囲
        if (criteria.amount_min) {
            params.monthly_repayment_amount_min = parseInt(criteria.amount_min);
        }
        if (criteria.amount_max) {
            params.monthly_repayment_amount_max = parseInt(criteria.amount_max);
        }

        // 入社日範囲
        if (criteria.hire_date_from) {
            params.hire_date_from = criteria.hire_date_from;
        }
        if (criteria.hire_date_to) {
            params.hire_date_to = criteria.hire_date_to;
        }

        // ステータス
        if (criteria.status) {
            params.is_active = criteria.status === 'active';
        }

        // ソート設定
        if (this.sortConfig.field) {
            params.sort = this.sortConfig.field;
            params.order = this.sortConfig.direction;
        }

        return params;
    }

    /**
     * 申請検索パラメータ構築
     */
    buildApplicationSearchParams(criteria) {
        const params = {
            limit: criteria.limit || 50,
            page: criteria.page || 1
        };

        // テキスト検索
        if (criteria.search) {
            params.search = criteria.search;
        }

        // ステータスフィルター
        if (criteria.status) {
            params.status = criteria.status;
        }

        // 申請日範囲
        if (criteria.date_from) {
            params.application_date_from = criteria.date_from;
        }
        if (criteria.date_to) {
            params.application_date_to = criteria.date_to;
        }

        // 金額範囲
        if (criteria.amount_min) {
            params.monthly_amount_min = parseInt(criteria.amount_min);
        }
        if (criteria.amount_max) {
            params.monthly_amount_max = parseInt(criteria.amount_max);
        }

        // 承認者フィルター
        if (criteria.approved_by) {
            params.approved_by = criteria.approved_by;
        }

        return params;
    }

    /**
     * 書類検索パラメータ構築
     */
    buildDocumentSearchParams(criteria) {
        const params = {
            limit: criteria.limit || 50,
            page: criteria.page || 1
        };

        // ファイル名検索
        if (criteria.search) {
            params.search = criteria.search;
        }

        // 書類種別
        if (criteria.document_type) {
            params.document_type = criteria.document_type;
        }

        // 確認状況
        if (criteria.verification_status) {
            params.verification_status = criteria.verification_status;
        }

        // ファイル形式
        if (criteria.file_type) {
            params.file_type = criteria.file_type;
        }

        // アップロード日範囲
        if (criteria.upload_date_from) {
            params.upload_date_from = criteria.upload_date_from;
        }
        if (criteria.upload_date_to) {
            params.upload_date_to = criteria.upload_date_to;
        }

        // ファイルサイズ範囲
        if (criteria.file_size_min) {
            params.file_size_min = parseInt(criteria.file_size_min);
        }
        if (criteria.file_size_max) {
            params.file_size_max = parseInt(criteria.file_size_max);
        }

        return params;
    }

    /**
     * 複合検索（全テーブル横断）
     */
    async globalSearch(query, options = {}) {
        try {
            showLoadingSpinner();
            
            const searchPromises = [];
            
            // 従業員検索
            if (!options.excludeEmployees) {
                searchPromises.push(
                    this.searchEmployees({ search: query, limit: 20 })
                        .then(results => ({ type: 'employees', data: results }))
                );
            }
            
            // 申請検索
            if (!options.excludeApplications) {
                searchPromises.push(
                    this.searchApplications({ search: query, limit: 20 })
                        .then(results => ({ type: 'applications', data: results }))
                );
            }
            
            // 書類検索
            if (!options.excludeDocuments) {
                searchPromises.push(
                    this.searchDocuments({ search: query, limit: 20 })
                        .then(results => ({ type: 'documents', data: results }))
                );
            }
            
            const results = await Promise.all(searchPromises);
            
            hideLoadingSpinner();
            
            return {
                query: query,
                timestamp: new Date().toISOString(),
                results: results
            };
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('グローバル検索エラー:', error);
            showToast('検索処理でエラーが発生しました', 'error');
            return { query: query, results: [] };
        }
    }

    /**
     * 検索条件の保存
     */
    saveSearch(name, criteria, type) {
        const searchData = {
            name: name,
            criteria: criteria,
            type: type,
            created_at: new Date().toISOString(),
            created_by: window.SCHOLARSHIP_SYSTEM.currentUser.name
        };
        
        this.savedSearches.set(name, searchData);
        
        // ローカルストレージに保存
        try {
            const saved = JSON.parse(localStorage.getItem('savedSearches') || '{}');
            saved[name] = searchData;
            localStorage.setItem('savedSearches', JSON.stringify(saved));
            
            showToast(`検索条件「${name}」を保存しました`, 'success');
        } catch (error) {
            console.error('検索条件保存エラー:', error);
            showToast('検索条件の保存に失敗しました', 'error');
        }
    }

    /**
     * 保存された検索条件の読み込み
     */
    loadSavedSearches() {
        try {
            const saved = JSON.parse(localStorage.getItem('savedSearches') || '{}');
            Object.entries(saved).forEach(([name, data]) => {
                this.savedSearches.set(name, data);
            });
        } catch (error) {
            console.error('保存検索読み込みエラー:', error);
        }
    }

    /**
     * 検索履歴管理
     */
    addToSearchHistory(type, criteria) {
        const historyItem = {
            type: type,
            criteria: criteria,
            timestamp: new Date().toISOString()
        };
        
        this.searchHistory.unshift(historyItem);
        
        // 最大50件まで保持
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        // ローカルストレージに保存
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('検索履歴保存エラー:', error);
        }
    }

    /**
     * 検索履歴の読み込み
     */
    loadSearchHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            this.searchHistory = history;
        } catch (error) {
            console.error('検索履歴読み込みエラー:', error);
            this.searchHistory = [];
        }
    }

    /**
     * 動的フィルター作成
     */
    createDynamicFilter(tableType, fieldName, operator, value) {
        const filterId = `filter_${tableType}_${fieldName}_${Date.now()}`;
        
        const filter = {
            id: filterId,
            tableType: tableType,
            fieldName: fieldName,
            operator: operator, // eq, ne, gt, lt, gte, lte, like, in, between
            value: value,
            created_at: new Date().toISOString()
        };
        
        this.currentFilters.set(filterId, filter);
        return filter;
    }

    /**
     * フィルターの適用
     */
    applyFilters(data, tableType) {
        const relevantFilters = Array.from(this.currentFilters.values())
            .filter(filter => filter.tableType === tableType);
        
        if (relevantFilters.length === 0) return data;
        
        return data.filter(item => {
            return relevantFilters.every(filter => {
                return this.evaluateFilter(item, filter);
            });
        });
    }

    /**
     * フィルター評価
     */
    evaluateFilter(item, filter) {
        const itemValue = item[filter.fieldName];
        const filterValue = filter.value;
        
        switch (filter.operator) {
            case 'eq':
                return itemValue === filterValue;
            case 'ne':
                return itemValue !== filterValue;
            case 'gt':
                return itemValue > filterValue;
            case 'lt':
                return itemValue < filterValue;
            case 'gte':
                return itemValue >= filterValue;
            case 'lte':
                return itemValue <= filterValue;
            case 'like':
                return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'in':
                return Array.isArray(filterValue) && filterValue.includes(itemValue);
            case 'between':
                return Array.isArray(filterValue) && 
                       itemValue >= filterValue[0] && 
                       itemValue <= filterValue[1];
            default:
                return true;
        }
    }

    /**
     * フィルタークリア
     */
    clearFilters() {
        this.currentFilters.clear();
        showToast('すべてのフィルターをクリアしました', 'info');
    }

    /**
     * ソート設定
     */
    setSort(field, direction = 'asc') {
        this.sortConfig = { field, direction };
    }

    /**
     * データのソート
     */
    sortData(data, field, direction = 'asc') {
        const sortedData = [...data].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            // 日付型の処理
            if (field.includes('date') || field.includes('_at')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // 数値型の処理
            if (typeof aValue === 'string' && !isNaN(aValue)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }
            
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sortedData;
    }

    /**
     * 検索結果のエクスポート
     */
    async exportSearchResults(results, filename, format = 'csv') {
        try {
            showLoadingSpinner();
            
            let exportData;
            let exportFilename;
            
            switch (format) {
                case 'csv':
                    exportData = this.convertToCSV(results);
                    exportFilename = `${filename}.csv`;
                    break;
                case 'json':
                    exportData = JSON.stringify(results, null, 2);
                    exportFilename = `${filename}.json`;
                    break;
                default:
                    throw new Error('Unsupported export format');
            }
            
            const blob = new Blob([exportData], { 
                type: format === 'csv' ? 'text/csv' : 'application/json' 
            });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = exportFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            hideLoadingSpinner();
            showToast('検索結果をエクスポートしました', 'success');
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('エクスポートエラー:', error);
            showToast('エクスポートに失敗しました', 'error');
        }
    }

    /**
     * CSV変換
     */
    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    /**
     * 検索統計情報
     */
    getSearchStatistics() {
        return {
            totalSearches: this.searchHistory.length,
            savedSearches: this.savedSearches.size,
            activeFilters: this.currentFilters.size,
            searchesByType: this.groupSearchesByType(),
            mostUsedCriteria: this.getMostUsedCriteria()
        };
    }

    /**
     * 検索タイプ別グループ化
     */
    groupSearchesByType() {
        return this.searchHistory.reduce((groups, search) => {
            const type = search.type;
            if (!groups[type]) groups[type] = 0;
            groups[type]++;
            return groups;
        }, {});
    }

    /**
     * 最も使用された検索条件
     */
    getMostUsedCriteria() {
        const criteriaCount = {};
        
        this.searchHistory.forEach(search => {
            Object.keys(search.criteria).forEach(key => {
                if (!criteriaCount[key]) criteriaCount[key] = 0;
                criteriaCount[key]++;
            });
        });
        
        return Object.entries(criteriaCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([criteria, count]) => ({ criteria, count }));
    }
}

// グローバルインスタンス作成
window.advancedSearchManager = new AdvancedSearchManager();

// 初期化時に履歴を読み込み
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearchManager.loadSearchHistory();
    window.advancedSearchManager.loadSavedSearches();
});

console.log('高度検索機能初期化完了');