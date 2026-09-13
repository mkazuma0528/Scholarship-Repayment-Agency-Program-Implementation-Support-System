/**
 * 奨学金代理返還情報管理システム - エラーハンドリング・検証システム
 * 企業レベルの信頼性とセキュリティを確保する包括的なエラー管理
 */

class ErrorHandler {
    constructor() {
        this.errorHistory = [];
        this.maxHistorySize = 1000;
        this.errorCounts = new Map();
        this.criticalErrors = [];
        this.initializeErrorTypes();
    }

    initializeErrorTypes() {
        this.errorTypes = {
            VALIDATION_ERROR: {
                code: 'VAL_001',
                severity: 'warning',
                category: '入力検証エラー'
            },
            API_ERROR: {
                code: 'API_001',
                severity: 'error',
                category: 'API通信エラー'
            },
            NETWORK_ERROR: {
                code: 'NET_001',
                severity: 'error',
                category: 'ネットワークエラー'
            },
            PERMISSION_ERROR: {
                code: 'PERM_001',
                severity: 'critical',
                category: '権限エラー'
            },
            DATA_ERROR: {
                code: 'DATA_001',
                severity: 'error',
                category: 'データ整合性エラー'
            },
            SECURITY_ERROR: {
                code: 'SEC_001',
                severity: 'critical',
                category: 'セキュリティエラー'
            },
            JASSO_ERROR: {
                code: 'JASSO_001',
                severity: 'error',
                category: 'JASSO連携エラー'
            }
        };
    }

    /**
     * エラーをログに記録し、適切な処理を実行
     */
    async handleError(error, context = {}) {
        const errorRecord = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack,
            type: this.determineErrorType(error),
            context: context,
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            severity: this.determineSeverity(error)
        };

        // エラー履歴に追加
        this.addToHistory(errorRecord);

        // エラー統計を更新
        this.updateErrorCounts(errorRecord.type);

        // 重大なエラーの場合は特別処理
        if (errorRecord.severity === 'critical') {
            await this.handleCriticalError(errorRecord);
        }

        // ユーザーに表示するエラーメッセージを生成
        const userMessage = this.generateUserMessage(errorRecord);

        // エラーログをサーバーに送信（監査ログ）
        await this.logToAuditSystem(errorRecord);

        // UI にエラーを表示
        this.displayError(userMessage, errorRecord.severity);

        return errorRecord;
    }

    /**
     * 入力値の包括的な検証
     */
    validateInput(data, schema) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            // 必須チェック
            if (rules.required && this.isEmpty(value)) {
                errors.push({
                    field: field,
                    message: `${rules.label || field}は必須項目です`,
                    code: 'REQUIRED'
                });
                continue;
            }
            
            if (!this.isEmpty(value)) {
                // 型チェック
                if (rules.type && !this.validateType(value, rules.type)) {
                    errors.push({
                        field: field,
                        message: `${rules.label || field}の形式が正しくありません`,
                        code: 'TYPE_MISMATCH'
                    });
                }
                
                // 長さチェック
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push({
                        field: field,
                        message: `${rules.label || field}は${rules.minLength}文字以上で入力してください`,
                        code: 'MIN_LENGTH'
                    });
                }
                
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push({
                        field: field,
                        message: `${rules.label || field}は${rules.maxLength}文字以内で入力してください`,
                        code: 'MAX_LENGTH'
                    });
                }
                
                // パターンチェック
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push({
                        field: field,
                        message: rules.patternMessage || `${rules.label || field}の形式が正しくありません`,
                        code: 'PATTERN_MISMATCH'
                    });
                }
                
                // カスタム検証
                if (rules.validator && !rules.validator(value)) {
                    errors.push({
                        field: field,
                        message: rules.validatorMessage || `${rules.label || field}が無効です`,
                        code: 'CUSTOM_VALIDATION'
                    });
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            summary: errors.length > 0 ? `${errors.length}件の入力エラーが見つかりました` : '入力検証が完了しました'
        };
    }

    /**
     * 奨学金データ特有の検証ルール
     */
    getScholarshipValidationSchema() {
        return {
            employeeId: {
                required: true,
                type: 'string',
                pattern: /^EMP-\d{6}$/,
                patternMessage: '従業員IDは「EMP-XXXXXX」の形式で入力してください',
                label: '従業員ID'
            },
            fullName: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 50,
                pattern: /^[ぁ-んァ-ヶー一-龯\s]+$/,
                patternMessage: '氏名は日本語で入力してください',
                label: '氏名'
            },
            email: {
                required: true,
                type: 'string',
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                patternMessage: '正しいメールアドレスを入力してください',
                label: 'メールアドレス'
            },
            phoneNumber: {
                required: true,
                type: 'string',
                pattern: /^0\d{1,4}-\d{1,4}-\d{4}$/,
                patternMessage: '電話番号は「XXX-XXXX-XXXX」の形式で入力してください',
                label: '電話番号'
            },
            scholarshipAmount: {
                required: true,
                type: 'number',
                min: 1000,
                max: 10000000,
                label: '奨学金額'
            },
            startDate: {
                required: true,
                type: 'date',
                validator: (value) => new Date(value) >= new Date(),
                validatorMessage: '開始日は今日以降の日付を入力してください',
                label: '開始日'
            }
        };
    }

    /**
     * API レスポンスの検証
     */
    validateApiResponse(response, expectedSchema) {
        try {
            // HTTPステータスコードチェック
            if (response.status && (response.status < 200 || response.status >= 300)) {
                throw new Error(`APIエラー: HTTP ${response.status} - ${response.statusText || '不明なエラー'}`);
            }

            // レスポンスデータの存在チェック
            if (!response.data && expectedSchema.requiresData) {
                throw new Error('APIレスポンスにデータが含まれていません');
            }

            // スキーマ検証
            if (expectedSchema.fields && response.data) {
                for (const field of expectedSchema.fields) {
                    if (field.required && !(field.name in response.data)) {
                        throw new Error(`必須フィールド「${field.name}」がAPIレスポンスに含まれていません`);
                    }
                }
            }

            return { isValid: true, data: response.data };
            
        } catch (error) {
            return {
                isValid: false,
                error: error.message,
                originalResponse: response
            };
        }
    }

    /**
     * セキュリティ関連の検証
     */
    validateSecurity(action, context) {
        const securityChecks = [];

        // 権限チェック
        if (!this.hasPermission(action, context.userId)) {
            securityChecks.push({
                type: 'PERMISSION_DENIED',
                message: 'この操作を実行する権限がありません',
                severity: 'critical'
            });
        }

        // セッション有効性チェック
        if (!this.isValidSession(context.sessionId)) {
            securityChecks.push({
                type: 'INVALID_SESSION',
                message: 'セッションが無効です。再ログインしてください',
                severity: 'critical'
            });
        }

        // レート制限チェック
        if (this.isRateLimited(context.userId, action)) {
            securityChecks.push({
                type: 'RATE_LIMITED',
                message: 'リクエストが多すぎます。しばらくお待ちください',
                severity: 'warning'
            });
        }

        return {
            isSecure: securityChecks.length === 0,
            violations: securityChecks
        };
    }

    /**
     * JASSO データの整合性チェック
     */
    validateJassoData(data) {
        const jassoRules = {
            // JASSO固有の検証ルール
            studentId: {
                required: true,
                pattern: /^\d{10}$/,
                patternMessage: '学籍番号は10桁の数字で入力してください'
            },
            scholarshipType: {
                required: true,
                options: ['第一種', '第二種', '給付型'],
                label: '奨学金種別'
            },
            repaymentAmount: {
                required: true,
                type: 'number',
                min: 1000,
                max: 100000,
                label: '月額返還額'
            },
            jassoId: {
                required: true,
                pattern: /^J\d{8}$/,
                patternMessage: 'JASSO IDは「J」から始まる9文字で入力してください'
            }
        };

        return this.validateInput(data, jassoRules);
    }

    // ユーティリティメソッド
    isEmpty(value) {
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0);
    }

    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'date':
                return !isNaN(Date.parse(value));
            case 'boolean':
                return typeof value === 'boolean';
            default:
                return true;
        }
    }

    determineErrorType(error) {
        if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
        if (error.name === 'TypeError') return 'DATA_ERROR';
        if (error.message && error.message.includes('permission')) return 'PERMISSION_ERROR';
        if (error.message && error.message.includes('network')) return 'NETWORK_ERROR';
        if (error.message && error.message.includes('API')) return 'API_ERROR';
        return 'UNKNOWN_ERROR';
    }

    determineSeverity(error) {
        if (error.name === 'SecurityError' || error.message?.includes('permission')) {
            return 'critical';
        }
        if (error.name === 'TypeError' || error.name === 'ReferenceError') {
            return 'error';
        }
        return 'warning';
    }

    generateErrorId() {
        return 'ERR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'anonymous';
    }

    getSessionId() {
        return localStorage.getItem('sessionId') || 'no-session';
    }

    addToHistory(errorRecord) {
        this.errorHistory.unshift(errorRecord);
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }
    }

    updateErrorCounts(errorType) {
        const count = this.errorCounts.get(errorType) || 0;
        this.errorCounts.set(errorType, count + 1);
    }

    async handleCriticalError(errorRecord) {
        this.criticalErrors.push(errorRecord);
        
        // 重要: 実際の実装では管理者への通知を行う
        console.error('CRITICAL ERROR DETECTED:', errorRecord);
        
        // セキュリティ上の問題の場合は追加の措置
        if (errorRecord.type === 'SECURITY_ERROR') {
            // セッションを無効化
            this.invalidateSession();
        }
    }

    generateUserMessage(errorRecord) {
        const errorType = this.errorTypes[errorRecord.type];
        if (!errorType) {
            return 'システムエラーが発生しました。管理者にお問い合わせください。';
        }

        switch (errorRecord.severity) {
            case 'critical':
                return `セキュリティエラーが発生しました。システム管理者に連絡してください。（エラーID: ${errorRecord.id}）`;
            case 'error':
                return `${errorType.category}が発生しました: ${errorRecord.message}`;
            case 'warning':
                return `入力内容を確認してください: ${errorRecord.message}`;
            default:
                return errorRecord.message;
        }
    }

    async logToAuditSystem(errorRecord) {
        try {
            if (window.scholarshipAPI) {
                await window.scholarshipAPI.create('audit_logs', {
                    action: 'ERROR_OCCURRED',
                    user_id: errorRecord.userId,
                    details: JSON.stringify({
                        errorId: errorRecord.id,
                        type: errorRecord.type,
                        severity: errorRecord.severity,
                        message: errorRecord.message,
                        context: errorRecord.context
                    }),
                    ip_address: 'システム',
                    created_at: Date.now()
                });
            }
        } catch (logError) {
            console.error('監査ログの記録に失敗:', logError);
        }
    }

    displayError(message, severity) {
        // UI にエラーメッセージを表示
        const alertClass = severity === 'critical' ? 'alert-error' :
                          severity === 'error' ? 'alert-warning' : 'alert-info';
        
        this.showAlert(message, alertClass);
    }

    showAlert(message, className = 'alert-info') {
        // 既存のアラートを削除
        const existingAlert = document.querySelector('.error-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // 新しいアラートを作成
        const alert = document.createElement('div');
        alert.className = `alert ${className} error-alert fixed top-4 right-4 z-50 max-w-md`;
        alert.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg">&times;</button>
            </div>
        `;

        document.body.appendChild(alert);

        // 5秒後に自動削除
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // エラー統計の取得
    getErrorStatistics() {
        return {
            totalErrors: this.errorHistory.length,
            errorsByType: Object.fromEntries(this.errorCounts),
            criticalErrors: this.criticalErrors.length,
            recentErrors: this.errorHistory.slice(0, 10),
            errorTrends: this.calculateErrorTrends()
        };
    }

    calculateErrorTrends() {
        const now = new Date();
        const last24Hours = this.errorHistory.filter(error => 
            new Date(error.timestamp) > new Date(now - 24 * 60 * 60 * 1000)
        );
        
        return {
            last24Hours: last24Hours.length,
            hourlyAverage: Math.round(last24Hours.length / 24 * 10) / 10
        };
    }

    // セキュリティ関連のヘルパーメソッド
    hasPermission(action, userId) {
        // 実装: 権限チェックロジック
        return true; // 簡易実装
    }

    isValidSession(sessionId) {
        // 実装: セッション有効性チェック
        return sessionId && sessionId !== 'no-session';
    }

    isRateLimited(userId, action) {
        // 実装: レート制限チェック
        return false; // 簡易実装
    }

    invalidateSession() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUserId');
        // 実装: セッション無効化処理
    }
}

// グローバルなエラーハンドラーとして設定
window.errorHandler = new ErrorHandler();

// グローバルエラーキャッチ
window.addEventListener('error', (event) => {
    window.errorHandler.handleError(event.error, {
        source: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Promise の未処理エラーキャッチ
window.addEventListener('unhandledrejection', (event) => {
    window.errorHandler.handleError(event.reason, {
        source: 'promise',
        type: 'unhandled_rejection'
    });
});

console.log('[OK] 奨学金代理返還システム - エラーハンドリングシステムが初期化されました');