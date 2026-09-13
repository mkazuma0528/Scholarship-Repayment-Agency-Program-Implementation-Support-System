/**
 * レポート機能とJASSO連携モジュール
 * 
 * 各種レポート生成とJASSO提出用データ作成機能を提供
 */

class ReportManager {
    constructor() {
        this.reportTemplates = new Map();
        this.scheduledReports = new Map();
        this.reportHistory = [];
        this.initializeTemplates();
    }

    /**
     * レポートテンプレート初期化
     */
    initializeTemplates() {
        // JASSO提出用レポート
        this.reportTemplates.set('jasso_submission', {
            name: 'JASSO提出用データ',
            description: '日本学生支援機構への提出に必要なデータを生成します',
            fields: [
                'scholarship_number', 'full_name', 'full_name_kana', 'employee_number',
                'department', 'hire_date', 'application_date', 'application_period_start',
                'application_period_end', 'monthly_amount', 'status', 'approved_by', 'approved_date'
            ],
            filters: { status: '承認済み' },
            requiredPermission: 'admin'
        });

        // 月次サマリーレポート
        this.reportTemplates.set('monthly_summary', {
            name: '月次サマリーレポート',
            description: '指定月の申請・承認・返還状況をまとめたレポート',
            fields: ['summary_data', 'statistics', 'trends'],
            filters: { date_range: 'monthly' },
            requiredPermission: 'read'
        });

        // 部署別レポート
        this.reportTemplates.set('department_report', {
            name: '部署別レポート',
            description: '部署ごとの申請状況と返還実績',
            fields: ['department', 'employee_count', 'application_count', 'total_amount'],
            filters: {},
            requiredPermission: 'read'
        });

        // 未処理案件レポート
        this.reportTemplates.set('pending_items', {
            name: '未処理案件レポート',
            description: '確認待ち・承認待ちの案件一覧',
            fields: ['id', 'type', 'employee_name', 'status', 'days_pending'],
            filters: { status: ['申請中', '未確認', '差し戻し'] },
            requiredPermission: 'write'
        });
    }

    /**
     * 概要レポート画面生成
     */
    async generateReportOverviewContent() {
        try {
            const stats = await this.getReportStatistics();
            const recentReports = await this.getRecentReports();
            
            return `
                ${generateBreadcrumb('report-overview')}
                
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">概要レポート</h2>
                    <p class="text-gray-600">システムの統計情報と各種レポートを生成できます。</p>
                </div>
                
                <!-- 統計サマリー -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    ${this.generateStatisticsCards(stats)}
                </div>
                
                <!-- レポートアクション -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- クイックレポート -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900">クイックレポート</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-4">
                                <button onclick="generateQuickReport('monthly_summary')" class="w-full btn btn-outline">
                                    <i class="fas fa-calendar-alt mr-2"></i>月次サマリー
                                </button>
                                <button onclick="generateQuickReport('department_report')" class="w-full btn btn-outline">
                                    <i class="fas fa-building mr-2"></i>部署別レポート
                                </button>
                                <button onclick="generateQuickReport('pending_items')" class="w-full btn btn-outline">
                                    <i class="fas fa-clock mr-2"></i>未処理案件
                                </button>
                                <button onclick="generateQuickReport('jasso_submission')" class="w-full btn btn-primary">
                                    <i class="fas fa-file-export mr-2"></i>JASSO提出用データ
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- カスタムレポート -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900">カスタムレポート</h3>
                        </div>
                        <div class="card-body">
                            <form id="custom-report-form">
                                <div class="space-y-4">
                                    <div class="form-group">
                                        <label class="form-label" for="report-type">レポート種別</label>
                                        <select id="report-type" class="form-input form-select">
                                            <option value="employees">従業員レポート</option>
                                            <option value="applications">申請レポート</option>
                                            <option value="documents">書類レポート</option>
                                            <option value="combined">統合レポート</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" for="date-range">対象期間</label>
                                        <select id="date-range" class="form-input form-select">
                                            <option value="current_month">今月</option>
                                            <option value="last_month">先月</option>
                                            <option value="current_quarter">今四半期</option>
                                            <option value="last_quarter">前四半期</option>
                                            <option value="current_year">今年</option>
                                            <option value="custom">カスタム期間</option>
                                        </select>
                                    </div>
                                    <div id="custom-date-range" class="hidden space-y-2">
                                        <input type="date" id="start-date" class="form-input" placeholder="開始日">
                                        <input type="date" id="end-date" class="form-input" placeholder="終了日">
                                    </div>
                                    <button type="button" onclick="generateCustomReport()" class="w-full btn btn-primary">
                                        <i class="fas fa-chart-bar mr-2"></i>レポート生成
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <!-- 最近のレポート -->
                <div class="card">
                    <div class="card-header">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-900">最近のレポート</h3>
                            <button onclick="clearReportHistory()" class="btn btn-outline btn-sm">
                                <i class="fas fa-trash mr-1"></i>履歴クリア
                            </button>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        ${this.generateRecentReportsTable(recentReports)}
                    </div>
                </div>
                
                <!-- レポート設定 -->
                <div class="mt-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900">レポート設定</h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-medium text-gray-900 mb-3">自動レポート</h4>
                                    <div class="space-y-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" class="form-checkbox" checked>
                                            <span class="ml-2 text-sm">月次サマリーの自動生成</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" class="form-checkbox">
                                            <span class="ml-2 text-sm">週次未処理案件レポート</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" class="form-checkbox">
                                            <span class="ml-2 text-sm">四半期統計レポート</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-900 mb-3">通知設定</h4>
                                    <div class="space-y-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" class="form-checkbox" checked>
                                            <span class="ml-2 text-sm">レポート生成完了通知</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" class="form-checkbox" checked>
                                            <span class="ml-2 text-sm">JASSO提出期限アラート</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" class="form-checkbox">
                                            <span class="ml-2 text-sm">異常値検出通知</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('レポート概要生成エラー:', error);
            return `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">レポートデータの読み込みに失敗しました</h3>
                    <p class="text-gray-600 mb-4">システムエラーが発生しました。</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh mr-2"></i>再読み込み
                    </button>
                </div>
            `;
        }
    }

    /**
     * JASSO提出用データ画面生成
     */
    async generateReportJassoContent() {
        return `
            ${generateBreadcrumb('report-jasso')}
            
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">JASSO提出用データ</h2>
                <p class="text-gray-600">日本学生支援機構への提出に必要なデータを生成・出力します。</p>
            </div>
            
            <!-- JASSO提出ウィザード -->
            <div class="card mb-8">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">提出データ生成ウィザード</h3>
                </div>
                <div class="card-body">
                    <div class="mb-6">
                        <!-- ステップインジケーター -->
                        <div class="flex items-center justify-center mb-8">
                            <div class="flex items-center">
                                <div class="flex items-center text-blue-600">
                                    <div class="rounded-full h-8 w-8 bg-blue-600 text-white flex items-center justify-center text-sm">1</div>
                                    <span class="ml-2 font-medium">対象期間選択</span>
                                </div>
                                <div class="flex-auto border-t-2 border-blue-600 mx-4"></div>
                                <div class="flex items-center text-gray-400">
                                    <div class="rounded-full h-8 w-8 bg-gray-200 text-gray-600 flex items-center justify-center text-sm">2</div>
                                    <span class="ml-2">データ確認</span>
                                </div>
                                <div class="flex-auto border-t-2 border-gray-200 mx-4"></div>
                                <div class="flex items-center text-gray-400">
                                    <div class="rounded-full h-8 w-8 bg-gray-200 text-gray-600 flex items-center justify-center text-sm">3</div>
                                    <span class="ml-2">出力</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- ステップ1: 対象期間選択 -->
                        <div id="jasso-step-1">
                            <h4 class="font-medium text-gray-900 mb-4">提出対象期間を選択してください</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label class="form-label required" for="jasso-period-start">対象期間（開始）</label>
                                    <input type="date" id="jasso-period-start" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label required" for="jasso-period-end">対象期間（終了）</label>
                                    <input type="date" id="jasso-period-end" class="form-input" required>
                                </div>
                                <div class="form-group md:col-span-2">
                                    <label class="form-label" for="jasso-notes">備考・特記事項</label>
                                    <textarea id="jasso-notes" class="form-input" rows="3" 
                                              placeholder="提出に関する特記事項があれば記入してください"></textarea>
                                </div>
                            </div>
                            <div class="flex justify-end mt-6">
                                <button onclick="jassoWizardNext(2)" class="btn btn-primary">
                                    次へ <i class="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- ステップ2: データ確認 -->
                        <div id="jasso-step-2" class="hidden">
                            <h4 class="font-medium text-gray-900 mb-4">提出データを確認してください</h4>
                            <div id="jasso-preview-data">
                                <!-- プレビューデータがここに表示される -->
                            </div>
                            <div class="flex justify-between mt-6">
                                <button onclick="jassoWizardNext(1)" class="btn btn-outline">
                                    <i class="fas fa-arrow-left mr-2"></i>戻る
                                </button>
                                <button onclick="jassoWizardNext(3)" class="btn btn-primary">
                                    次へ <i class="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- ステップ3: 出力 -->
                        <div id="jasso-step-3" class="hidden">
                            <h4 class="font-medium text-gray-900 mb-4">出力形式を選択してください</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div class="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onclick="selectJassoFormat('csv')">
                                    <div class="text-center">
                                        <i class="fas fa-file-csv text-green-600 text-3xl mb-2"></i>
                                        <h5 class="font-medium">CSV形式</h5>
                                        <p class="text-sm text-gray-600">Excel等で編集可能</p>
                                    </div>
                                </div>
                                <div class="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onclick="selectJassoFormat('excel')">
                                    <div class="text-center">
                                        <i class="fas fa-file-excel text-green-600 text-3xl mb-2"></i>
                                        <h5 class="font-medium">Excel形式</h5>
                                        <p class="text-sm text-gray-600">Microsoft Excel形式</p>
                                    </div>
                                </div>
                                <div class="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onclick="selectJassoFormat('pdf')">
                                    <div class="text-center">
                                        <i class="fas fa-file-pdf text-red-600 text-3xl mb-2"></i>
                                        <h5 class="font-medium">PDF形式</h5>
                                        <p class="text-sm text-gray-600">印刷・提出用</p>
                                    </div>
                                </div>
                            </div>
                            <div id="jasso-format-options" class="hidden mb-6">
                                <!-- フォーマット固有のオプション -->
                            </div>
                            <div class="flex justify-between">
                                <button onclick="jassoWizardNext(2)" class="btn btn-outline">
                                    <i class="fas fa-arrow-left mr-2"></i>戻る
                                </button>
                                <button onclick="generateJassoReport()" class="btn btn-success">
                                    <i class="fas fa-download mr-2"></i>ダウンロード
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- JASSO提出履歴 -->
            <div class="card">
                <div class="card-header">
                    <h3 class="text-lg font-semibold text-gray-900">提出履歴</h3>
                </div>
                <div class="card-body p-0">
                    <div id="jasso-history-table">
                        <!-- 提出履歴テーブルがここに表示される -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * レポート統計取得
     */
    async getReportStatistics() {
        try {
            const stats = await window.scholarshipAPI.getDashboardStats();
            
            return {
                totalEmployees: stats.totalEmployees,
                activeApplications: stats.activeApplications,
                monthlyRepayment: stats.monthlyRepayment,
                completedApplications: stats.completedApplications,
                pendingDocuments: stats.pendingDocuments || 0,
                reportsGenerated: this.reportHistory.length
            };
        } catch (error) {
            console.error('レポート統計取得エラー:', error);
            return {
                totalEmployees: 0,
                activeApplications: 0,
                monthlyRepayment: 0,
                completedApplications: 0,
                pendingDocuments: 0,
                reportsGenerated: 0
            };
        }
    }

    /**
     * 統計カード生成
     */
    generateStatisticsCards(stats) {
        const cards = [
            {
                title: '登録従業員数',
                value: formatNumber(stats.totalEmployees),
                icon: 'fas fa-users',
                color: 'from-blue-500 to-blue-600'
            },
            {
                title: '進行中申請',
                value: formatNumber(stats.activeApplications),
                icon: 'fas fa-file-alt',
                color: 'from-green-500 to-green-600'
            },
            {
                title: '月次代理返還額',
                value: '¥' + formatNumber(stats.monthlyRepayment),
                icon: 'fas fa-yen-sign',
                color: 'from-purple-500 to-purple-600'
            },
            {
                title: '生成レポート数',
                value: formatNumber(stats.reportsGenerated),
                icon: 'fas fa-chart-bar',
                color: 'from-orange-500 to-orange-600'
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
     * 最近のレポート取得
     */
    async getRecentReports() {
        // 実際のシステムでは、レポート履歴テーブルから取得
        return this.reportHistory.slice(0, 10);
    }

    /**
     * 最近のレポートテーブル生成
     */
    generateRecentReportsTable(reports) {
        if (reports.length === 0) {
            return '<div class="p-8 text-center text-gray-500">レポート履歴がありません</div>';
        }
        
        const rows = reports.map(report => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">${report.name}</div>
                    <div class="text-xs text-gray-500">${report.type}</div>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${formatDate(report.generated_at)}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-900">${report.generated_by}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="status-badge status-completed">完了</span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2">
                        <button onclick="downloadReport('${report.id}')" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="viewReport('${report.id}')" class="text-green-600 hover:text-green-800">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        return `
            <table class="min-w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">レポート</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">生成日時</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成者</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${rows}
                </tbody>
            </table>
        `;
    }

    /**
     * JASSO提出用レポート生成
     */
    async generateJassoReport(periodStart, periodEnd, format = 'csv') {
        try {
            showLoadingSpinner();
            
            const report = await window.scholarshipAPI.generateJASSO Report({
                period_start: periodStart,
                period_end: periodEnd
            });
            
            const reportData = {
                id: 'jasso-' + Date.now(),
                name: 'JASSO提出用データ',
                type: 'jasso_submission',
                data: report.data,
                summary: report.summary,
                generated_at: new Date().toISOString(),
                generated_by: window.SCHOLARSHIP_SYSTEM.currentUser.name,
                format: format,
                period: { start: periodStart, end: periodEnd }
            };
            
            // レポート履歴に追加
            this.reportHistory.unshift(reportData);
            
            // ファイル出力
            await this.exportReport(reportData, format);
            
            hideLoadingSpinner();
            showToast('JASSO提出用データを生成しました', 'success');
            
            return reportData;
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('JASSOレポート生成エラー:', error);
            showToast('レポート生成に失敗しました', 'error');
            throw error;
        }
    }

    /**
     * レポートエクスポート
     */
    async exportReport(reportData, format) {
        let content, mimeType, extension;
        
        switch (format) {
            case 'csv':
                content = this.convertToCSV(reportData.data);
                mimeType = 'text/csv;charset=utf-8;';
                extension = 'csv';
                break;
            case 'json':
                content = JSON.stringify(reportData, null, 2);
                mimeType = 'application/json;charset=utf-8;';
                extension = 'json';
                break;
            case 'excel':
                // 実際のシステムでは Excel 形式のライブラリを使用
                content = this.convertToCSV(reportData.data);
                mimeType = 'application/vnd.ms-excel;charset=utf-8;';
                extension = 'csv';
                break;
            default:
                throw new Error('Unsupported export format');
        }
        
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${reportData.name}_${formatDate(new Date(), 'YYYY-MM-DD')}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
     * クイックレポート生成
     */
    async generateQuickReport(templateType) {
        try {
            const template = this.reportTemplates.get(templateType);
            if (!template) {
                throw new Error('Unknown report template');
            }
            
            showLoadingSpinner();
            
            let reportData;
            switch (templateType) {
                case 'monthly_summary':
                    reportData = await this.generateMonthlySummaryReport();
                    break;
                case 'department_report':
                    reportData = await this.generateDepartmentReport();
                    break;
                case 'pending_items':
                    reportData = await this.generatePendingItemsReport();
                    break;
                case 'jasso_submission':
                    // JASSO レポートは別途ウィザードで処理
                    hideLoadingSpinner();
                    navigateToPage('report-jasso');
                    return;
                default:
                    throw new Error('Unsupported quick report type');
            }
            
            await this.exportReport(reportData, 'csv');
            this.reportHistory.unshift(reportData);
            
            hideLoadingSpinner();
            showToast(`${template.name}を生成しました`, 'success');
            
        } catch (error) {
            hideLoadingSpinner();
            console.error('クイックレポート生成エラー:', error);
            showToast('レポート生成に失敗しました', 'error');
        }
    }

    /**
     * 月次サマリーレポート生成
     */
    async generateMonthlySummaryReport() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const [applications, employees, documents] = await Promise.all([
            window.scholarshipAPI.getApplications({ 
                application_date_from: startOfMonth.toISOString().split('T')[0],
                application_date_to: endOfMonth.toISOString().split('T')[0],
                limit: 1000 
            }),
            window.scholarshipAPI.getEmployees({ limit: 1000 }),
            window.scholarshipAPI.getDocuments({ 
                upload_date_from: startOfMonth.toISOString().split('T')[0],
                upload_date_to: endOfMonth.toISOString().split('T')[0],
                limit: 1000 
            })
        ]);
        
        const summary = {
            period: `${now.getFullYear()}年${now.getMonth() + 1}月`,
            new_applications: applications.data.length,
            approved_applications: applications.data.filter(app => app.status === '承認済み').length,
            completed_applications: applications.data.filter(app => app.status === '完了').length,
            total_monthly_amount: applications.data.reduce((sum, app) => sum + (app.monthly_amount || 0), 0),
            new_employees: employees.data.filter(emp => {
                const hireDate = new Date(emp.hire_date);
                return hireDate >= startOfMonth && hireDate <= endOfMonth;
            }).length,
            uploaded_documents: documents.data.length,
            verified_documents: documents.data.filter(doc => doc.verification_status === '確認済み').length
        };
        
        return {
            id: 'monthly-summary-' + Date.now(),
            name: '月次サマリーレポート',
            type: 'monthly_summary',
            data: [summary],
            generated_at: new Date().toISOString(),
            generated_by: window.SCHOLARSHIP_SYSTEM.currentUser.name
        };
    }

    /**
     * 部署別レポート生成
     */
    async generateDepartmentReport() {
        const [employees, applications] = await Promise.all([
            window.scholarshipAPI.getEmployees({ limit: 1000 }),
            window.scholarshipAPI.getApplications({ limit: 1000 })
        ]);
        
        const departmentStats = {};
        
        employees.data.forEach(emp => {
            const dept = emp.department || '不明';
            if (!departmentStats[dept]) {
                departmentStats[dept] = {
                    department: dept,
                    employee_count: 0,
                    application_count: 0,
                    total_amount: 0,
                    avg_amount: 0
                };
            }
            departmentStats[dept].employee_count++;
        });
        
        applications.data.forEach(app => {
            const dept = app.department || '不明';
            if (departmentStats[dept]) {
                departmentStats[dept].application_count++;
                departmentStats[dept].total_amount += app.monthly_amount || 0;
            }
        });
        
        // 平均額を計算
        Object.values(departmentStats).forEach(stat => {
            stat.avg_amount = stat.application_count > 0 ? 
                Math.round(stat.total_amount / stat.application_count) : 0;
        });
        
        return {
            id: 'department-report-' + Date.now(),
            name: '部署別レポート',
            type: 'department_report',
            data: Object.values(departmentStats),
            generated_at: new Date().toISOString(),
            generated_by: window.SCHOLARSHIP_SYSTEM.currentUser.name
        };
    }

    /**
     * 未処理案件レポート生成
     */
    async generatePendingItemsReport() {
        const [pendingApplications, pendingDocuments] = await Promise.all([
            window.scholarshipAPI.getApplications({ status: '申請中', limit: 1000 }),
            window.scholarshipAPI.getDocuments({ verification_status: '未確認', limit: 1000 })
        ]);
        
        const pendingItems = [];
        
        // 申請中の案件
        pendingApplications.data.forEach(app => {
            const daysPending = Math.floor((Date.now() - new Date(app.application_date).getTime()) / (1000 * 60 * 60 * 24));
            pendingItems.push({
                id: app.id,
                type: '申請',
                employee_name: app.employee_name || '不明',
                status: app.status,
                days_pending: daysPending,
                created_date: app.application_date
            });
        });
        
        // 未確認書類
        pendingDocuments.data.forEach(doc => {
            const daysPending = Math.floor((Date.now() - new Date(doc.upload_date).getTime()) / (1000 * 60 * 60 * 24));
            pendingItems.push({
                id: doc.id,
                type: '書類',
                employee_name: doc.employee_name || '不明',
                status: doc.verification_status,
                days_pending: daysPending,
                created_date: doc.upload_date
            });
        });
        
        // 未処理日数でソート
        pendingItems.sort((a, b) => b.days_pending - a.days_pending);
        
        return {
            id: 'pending-items-' + Date.now(),
            name: '未処理案件レポート',
            type: 'pending_items',
            data: pendingItems,
            generated_at: new Date().toISOString(),
            generated_by: window.SCHOLARSHIP_SYSTEM.currentUser.name
        };
    }
}

// グローバルインスタンス作成
window.reportManager = new ReportManager();

// グローバル関数公開
window.generateReportOverviewContent = () => window.reportManager.generateReportOverviewContent();
window.generateReportJassoContent = () => window.reportManager.generateReportJassoContent();
window.generateQuickReport = (type) => window.reportManager.generateQuickReport(type);
window.generateJassoReport = () => window.reportManager.generateJassoReport(
    document.getElementById('jasso-period-start').value,
    document.getElementById('jasso-period-end').value,
    window.selectedJassoFormat || 'csv'
);

console.log('レポート機能初期化完了');