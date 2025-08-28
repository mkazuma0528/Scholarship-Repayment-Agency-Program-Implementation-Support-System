/**
 * 奨学金代理返還情報管理システム - 監査ログシステム
 * 企業レベルのコンプライアンスと監査要件を満たす包括的なログ管理
 */

class AuditLogger {
    constructor() {
        this.logQueue = [];
        this.batchSize = 10;
        this.flushInterval = 5000; // 5秒間隔でフラッシュ
        this.maxQueueSize = 1000;
        this.sessionId = this.generateSessionId();
        this.ipAddress = 'システム'; // 実際の実装ではクライアントIPを取得
        this.userAgent = navigator.userAgent;
        
        this.initializeAuditSystem();
    }

    initializeAuditSystem() {
        // 定期的なログフラッシュ
        setInterval(() => {
            this.flushLogs();
        }, this.flushInterval);

        // ページ離脱時のログフラッシュ
        window.addEventListener('beforeunload', () => {
            this.flushLogs(true);
        });

        // セッション開始をログ
        this.logSessionStart();

        console.log('✅ 監査ログシステムが初期化されました');
    }

    /**
     * 包括的な監査ログの記録
     */
    async log(action, details = {}, severity = 'info') {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            user_id: this.getCurrentUserId(),
            action: action,
            details: this.sanitizeDetails(details),
            severity: severity,
            ip_address: this.ipAddress,
            user_agent: this.userAgent,
            page_url: window.location.href,
            referrer: document.referrer,
            created_at: Date.now()
        };

        // 機密情報のマスキング
        logEntry.details = this.maskSensitiveData(logEntry.details);

        // キューに追加
        this.logQueue.push(logEntry);

        // キューサイズ制限
        if (this.logQueue.length > this.maxQueueSize) {
            await this.flushLogs();
        }

        // 重要なアクションはすぐにフラッシュ
        if (this.isCriticalAction(action)) {
            await this.flushLogs();
        }

        return logEntry.id;
    }

    /**
     * ユーザー操作の監査ログ
     */
    async logUserAction(action, target, oldValue = null, newValue = null, metadata = {}) {
        const details = {
            target: target,
            old_value: oldValue,
            new_value: newValue,
            metadata: metadata,
            timestamp_detail: Date.now()
        };

        return await this.log(`USER_${action.toUpperCase()}`, details, 'info');
    }

    /**
     * データ変更の監査ログ
     */
    async logDataChange(table, recordId, operation, changes = {}, userId = null) {
        const details = {
            table: table,
            record_id: recordId,
            operation: operation,
            changes: changes,
            affected_fields: Object.keys(changes),
            change_count: Object.keys(changes).length
        };

        const action = `DATA_${operation.toUpperCase()}`;
        return await this.log(action, details, 'warning');
    }

    /**
     * 認証・認可の監査ログ
     */
    async logAuthEvent(event, userId = null, success = true, reason = null) {
        const details = {
            event: event,
            success: success,
            reason: reason,
            failed_attempts: this.getFailedAttempts(userId),
            auth_method: 'password' // 実際の実装では動的に設定
        };

        const severity = success ? 'info' : 'warning';
        const action = `AUTH_${event.toUpperCase()}`;
        
        return await this.log(action, details, severity);
    }

    /**
     * システムエラーの監査ログ
     */
    async logSystemError(error, context = {}) {
        const details = {
            error_message: error.message,
            error_stack: error.stack,
            error_type: error.name,
            context: context,
            browser_info: this.getBrowserInfo(),
            performance_info: this.getPerformanceInfo()
        };

        return await this.log('SYSTEM_ERROR', details, 'error');
    }

    /**
     * セキュリティイベントの監査ログ
     */
    async logSecurityEvent(event, severity = 'critical', details = {}) {
        const auditDetails = {
            security_event: event,
            threat_level: severity,
            detection_method: 'system',
            ...details
        };

        return await this.log(`SECURITY_${event.toUpperCase()}`, auditDetails, severity);
    }

    /**
     * JASSO連携の監査ログ
     */
    async logJassoIntegration(action, data = {}, success = true) {
        const details = {
            jasso_action: action,
            success: success,
            data_summary: this.createDataSummary(data),
            integration_version: '1.0',
            jasso_endpoint: data.endpoint || 'unknown'
        };

        const severity = success ? 'info' : 'error';
        return await this.log(`JASSO_${action.toUpperCase()}`, details, severity);
    }

    /**
     * レポート生成の監査ログ
     */
    async logReportGeneration(reportType, parameters, success = true, recordCount = 0) {
        const details = {
            report_type: reportType,
            parameters: parameters,
            success: success,
            record_count: recordCount,
            generation_time: Date.now(),
            format: parameters.format || 'unknown'
        };

        return await this.log('REPORT_GENERATED', details, 'info');
    }

    /**
     * ファイル操作の監査ログ
     */
    async logFileOperation(operation, fileName, fileSize = null, success = true) {
        const details = {
            operation: operation,
            file_name: fileName,
            file_size: fileSize,
            success: success,
            file_type: this.getFileType(fileName)
        };

        return await this.log(`FILE_${operation.toUpperCase()}`, details, 'info');
    }

    /**
     * 承認プロセスの監査ログ
     */
    async logApprovalProcess(applicationId, action, approverId, comments = null) {
        const details = {
            application_id: applicationId,
            approval_action: action,
            approver_id: approverId,
            comments: comments,
            approval_level: this.getApprovalLevel(approverId),
            workflow_stage: await this.getWorkflowStage(applicationId)
        };

        return await this.log(`APPROVAL_${action.toUpperCase()}`, details, 'warning');
    }

    /**
     * 設定変更の監査ログ
     */
    async logConfigurationChange(setting, oldValue, newValue, userId) {
        const details = {
            setting: setting,
            old_value: oldValue,
            new_value: newValue,
            changed_by: userId,
            impact_assessment: this.assessConfigImpact(setting)
        };

        return await this.log('CONFIG_CHANGED', details, 'warning');
    }

    /**
     * ログのバッチフラッシュ
     */
    async flushLogs(force = false) {
        if (this.logQueue.length === 0) return;

        if (!force && this.logQueue.length < this.batchSize) return;

        const logsToFlush = this.logQueue.splice(0, this.batchSize);
        
        try {
            // データベースに一括保存
            if (window.scholarshipAPI) {
                for (const logEntry of logsToFlush) {
                    await window.scholarshipAPI.create('audit_logs', logEntry);
                }
            }

            console.log(`✅ ${logsToFlush.length}件の監査ログを保存しました`);
        } catch (error) {
            console.error('監査ログの保存に失敗:', error);
            
            // 失敗したログを再度キューに戻す（先頭に）
            this.logQueue.unshift(...logsToFlush);
            
            // 失敗をローカルストレージにバックアップ
            this.backupToLocalStorage(logsToFlush);
        }
    }

    /**
     * ローカルストレージへのバックアップ
     */
    backupToLocalStorage(logs) {
        try {
            const existingBackup = JSON.parse(localStorage.getItem('audit_log_backup') || '[]');
            const updatedBackup = [...existingBackup, ...logs];
            
            // 最大1000件まで保持
            if (updatedBackup.length > 1000) {
                updatedBackup.splice(0, updatedBackup.length - 1000);
            }
            
            localStorage.setItem('audit_log_backup', JSON.stringify(updatedBackup));
        } catch (error) {
            console.error('ローカルストレージへのバックアップに失敗:', error);
        }
    }

    /**
     * 監査ログの検索
     */
    async searchLogs(criteria = {}) {
        try {
            const searchParams = {
                page: criteria.page || 1,
                limit: criteria.limit || 100,
                sort: criteria.sort || 'created_at',
                search: this.buildSearchQuery(criteria)
            };

            const response = await window.scholarshipAPI.list('audit_logs', searchParams);
            return this.processSearchResults(response);
        } catch (error) {
            console.error('監査ログの検索に失敗:', error);
            throw error;
        }
    }

    buildSearchQuery(criteria) {
        const conditions = [];
        
        if (criteria.userId) {
            conditions.push(`user_id:${criteria.userId}`);
        }
        
        if (criteria.action) {
            conditions.push(`action:${criteria.action}`);
        }
        
        if (criteria.dateFrom) {
            conditions.push(`created_at:>=${new Date(criteria.dateFrom).getTime()}`);
        }
        
        if (criteria.dateTo) {
            conditions.push(`created_at:<=${new Date(criteria.dateTo).getTime()}`);
        }
        
        if (criteria.severity) {
            conditions.push(`severity:${criteria.severity}`);
        }
        
        return conditions.join(' AND ');
    }

    processSearchResults(response) {
        return {
            logs: response.data.map(log => ({
                ...log,
                details: this.parseLogDetails(log.details),
                timestamp_formatted: new Date(log.timestamp).toLocaleString('ja-JP')
            })),
            total: response.total,
            page: response.page,
            totalPages: Math.ceil(response.total / response.limit)
        };
    }

    /**
     * コンプライアンスレポートの生成
     */
    async generateComplianceReport(startDate, endDate, reportType = 'full') {
        const criteria = {
            dateFrom: startDate,
            dateTo: endDate,
            limit: 10000 // 大きな値を設定
        };

        const logs = await this.searchLogs(criteria);
        
        const report = {
            period: { start: startDate, end: endDate },
            summary: this.generateLogSummary(logs.logs),
            details: reportType === 'full' ? logs.logs : null,
            compliance_indicators: this.calculateComplianceIndicators(logs.logs),
            generated_at: new Date().toISOString(),
            generated_by: this.getCurrentUserId()
        };

        // レポート生成をログ
        await this.logReportGeneration('COMPLIANCE_REPORT', criteria, true, logs.logs.length);

        return report;
    }

    generateLogSummary(logs) {
        const summary = {
            total_events: logs.length,
            events_by_action: {},
            events_by_severity: {},
            events_by_user: {},
            events_by_day: {},
            security_events: 0,
            data_changes: 0,
            authentication_events: 0
        };

        logs.forEach(log => {
            // アクション別
            summary.events_by_action[log.action] = (summary.events_by_action[log.action] || 0) + 1;
            
            // 重要度別
            summary.events_by_severity[log.severity] = (summary.events_by_severity[log.severity] || 0) + 1;
            
            // ユーザー別
            summary.events_by_user[log.user_id] = (summary.events_by_user[log.user_id] || 0) + 1;
            
            // 日別
            const day = log.timestamp.split('T')[0];
            summary.events_by_day[day] = (summary.events_by_day[day] || 0) + 1;
            
            // カテゴリ別
            if (log.action.startsWith('SECURITY_')) summary.security_events++;
            if (log.action.startsWith('DATA_')) summary.data_changes++;
            if (log.action.startsWith('AUTH_')) summary.authentication_events++;
        });

        return summary;
    }

    calculateComplianceIndicators(logs) {
        const indicators = {
            data_integrity_score: this.calculateDataIntegrityScore(logs),
            security_compliance_score: this.calculateSecurityComplianceScore(logs),
            audit_completeness_score: this.calculateAuditCompletenessScore(logs),
            risk_indicators: this.identifyRiskIndicators(logs)
        };

        indicators.overall_compliance_score = (
            indicators.data_integrity_score +
            indicators.security_compliance_score +
            indicators.audit_completeness_score
        ) / 3;

        return indicators;
    }

    calculateDataIntegrityScore(logs) {
        const dataChanges = logs.filter(log => log.action.startsWith('DATA_'));
        const unauthorizedChanges = dataChanges.filter(log => 
            log.severity === 'error' || log.severity === 'critical'
        );
        
        if (dataChanges.length === 0) return 100;
        return Math.max(0, 100 - (unauthorizedChanges.length / dataChanges.length * 100));
    }

    calculateSecurityComplianceScore(logs) {
        const securityEvents = logs.filter(log => log.action.startsWith('SECURITY_'));
        const criticalSecurityEvents = securityEvents.filter(log => log.severity === 'critical');
        
        if (securityEvents.length === 0) return 100;
        return Math.max(0, 100 - (criticalSecurityEvents.length / securityEvents.length * 100));
    }

    calculateAuditCompletenessScore(logs) {
        // 監査ログの完全性スコア（実際の実装では更に詳細な基準を使用）
        const expectedLogTypes = ['USER_LOGIN', 'DATA_CREATE', 'DATA_UPDATE', 'DATA_DELETE'];
        const presentLogTypes = [...new Set(logs.map(log => log.action))];
        
        const completeness = expectedLogTypes.filter(type => 
            presentLogTypes.some(present => present.includes(type.split('_')[1]))
        ).length / expectedLogTypes.length;
        
        return completeness * 100;
    }

    identifyRiskIndicators(logs) {
        const risks = [];
        
        // 頻繁な失敗した認証試行
        const failedAuth = logs.filter(log => 
            log.action.includes('AUTH_') && JSON.parse(log.details || '{}').success === false
        );
        if (failedAuth.length > 10) {
            risks.push({
                type: 'AUTHENTICATION_FAILURES',
                severity: 'high',
                count: failedAuth.length,
                description: '認証失敗が多数発生しています'
            });
        }
        
        // 異常な時間帯でのアクセス
        const nightAccess = logs.filter(log => {
            const hour = new Date(log.timestamp).getHours();
            return hour < 6 || hour > 22;
        });
        if (nightAccess.length > 0) {
            risks.push({
                type: 'UNUSUAL_HOURS_ACCESS',
                severity: 'medium',
                count: nightAccess.length,
                description: '異常な時間帯でのアクセスが検出されました'
            });
        }
        
        // 大量データのエクスポート
        const dataExports = logs.filter(log => 
            log.action.includes('EXPORT') || log.action.includes('DOWNLOAD')
        );
        if (dataExports.length > 50) {
            risks.push({
                type: 'EXCESSIVE_DATA_EXPORT',
                severity: 'high',
                count: dataExports.length,
                description: '大量のデータエクスポートが発生しています'
            });
        }
        
        return risks;
    }

    // ユーティリティメソッド
    generateLogId() {
        return 'LOG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    generateSessionId() {
        return 'SES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'anonymous';
    }

    sanitizeDetails(details) {
        if (typeof details === 'string') {
            return details;
        }
        return JSON.stringify(details);
    }

    maskSensitiveData(details) {
        if (typeof details !== 'string') return details;
        
        try {
            const parsed = JSON.parse(details);
            const sensitiveFields = ['password', 'ssn', 'credit_card', '個人番号', 'マイナンバー'];
            
            const masked = { ...parsed };
            for (const field of sensitiveFields) {
                if (masked[field]) {
                    masked[field] = '***MASKED***';
                }
            }
            
            return JSON.stringify(masked);
        } catch {
            return details;
        }
    }

    isCriticalAction(action) {
        const criticalActions = [
            'SECURITY_BREACH',
            'DATA_DELETE',
            'AUTH_FAILED',
            'PERMISSION_DENIED',
            'SYSTEM_ERROR'
        ];
        return criticalActions.some(critical => action.includes(critical));
    }

    parseLogDetails(details) {
        try {
            return JSON.parse(details);
        } catch {
            return details;
        }
    }

    getFailedAttempts(userId) {
        // 実装: 失敗した認証試行回数を取得
        return 0; // 簡易実装
    }

    getBrowserInfo() {
        return {
            user_agent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    getPerformanceInfo() {
        if ('performance' in window && 'memory' in performance) {
            return {
                memory_used: performance.memory.usedJSHeapSize,
                memory_total: performance.memory.totalJSHeapSize,
                memory_limit: performance.memory.jsHeapSizeLimit
            };
        }
        return {};
    }

    createDataSummary(data) {
        return {
            record_count: Array.isArray(data) ? data.length : (data ? 1 : 0),
            data_types: this.identifyDataTypes(data),
            data_size_estimate: JSON.stringify(data).length
        };
    }

    identifyDataTypes(data) {
        if (Array.isArray(data)) {
            return data.length > 0 ? Object.keys(data[0]) : [];
        }
        return data ? Object.keys(data) : [];
    }

    getFileType(fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension || 'unknown';
    }

    getApprovalLevel(approverId) {
        // 実装: 承認者のレベルを取得
        return 'level1'; // 簡易実装
    }

    async getWorkflowStage(applicationId) {
        // 実装: ワークフローの段階を取得
        return 'pending'; // 簡易実装
    }

    assessConfigImpact(setting) {
        const highImpactSettings = ['security', 'permissions', 'database'];
        return highImpactSettings.some(impact => setting.includes(impact)) ? 'high' : 'low';
    }

    async logSessionStart() {
        return await this.log('SESSION_START', {
            session_id: this.sessionId,
            browser_info: this.getBrowserInfo(),
            timestamp: Date.now()
        });
    }

    // パブリックAPI
    async exportLogs(criteria, format = 'csv') {
        const logs = await this.searchLogs(criteria);
        
        if (format === 'csv') {
            return this.exportToCSV(logs.logs);
        } else if (format === 'json') {
            return this.exportToJSON(logs.logs);
        }
        
        throw new Error(`未対応の形式: ${format}`);
    }

    exportToCSV(logs) {
        const headers = ['タイムスタンプ', 'ユーザーID', 'アクション', '重要度', '詳細'];
        const rows = logs.map(log => [
            log.timestamp,
            log.user_id,
            log.action,
            log.severity,
            log.details
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    exportToJSON(logs) {
        return JSON.stringify(logs, null, 2);
    }

    getStatistics() {
        return {
            queue_size: this.logQueue.length,
            session_id: this.sessionId,
            logs_flushed: this.logsFlushed || 0,
            backup_count: this.getBackupCount()
        };
    }

    getBackupCount() {
        try {
            const backup = JSON.parse(localStorage.getItem('audit_log_backup') || '[]');
            return backup.length;
        } catch {
            return 0;
        }
    }
}

// グローバルインスタンス作成
window.auditLogger = new AuditLogger();

console.log('✅ 奨学金代理返還システム - 監査ログシステムが初期化されました');