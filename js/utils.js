/**
 * ユーティリティ関数集
 * 
 * システム全体で使用する汎用的な機能を提供
 */

/**
 * ローディングスピナー表示
 */
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

/**
 * ローディングスピナー非表示
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

/**
 * トースト通知表示
 * @param {string} message - 表示メッセージ
 * @param {string} type - 通知タイプ (success, error, warning, info)
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toastId = 'toast-' + Date.now();
    const iconMap = {
        success: 'fas fa-check-circle text-green-600',
        error: 'fas fa-exclamation-circle text-red-600',
        warning: 'fas fa-exclamation-triangle text-yellow-600',
        info: 'fas fa-info-circle text-blue-600'
    };
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="${iconMap[type]} text-xl mr-3"></i>
            <div class="flex-1">
                <p class="font-medium text-gray-900">${message}</p>
            </div>
            <button onclick="closeToast('${toastId}')" class="ml-4 text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(toast);
    
    // 自動削除
    setTimeout(() => {
        closeToast(toastId);
    }, duration);
}

/**
 * トースト通知を閉じる
 */
function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

/**
 * モーダル表示
 * @param {Object} options - モーダル設定
 */
function showModal(options = {}) {
    const {
        title = '',
        content = '',
        showCloseButton = true,
        size = 'medium', // small, medium, large
        onClose = null
    } = options;
    
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    
    if (!overlay || !container) return null;
    
    // サイズクラス設定
    const sizeClasses = {
        small: 'w-11/12 md:w-1/3',
        medium: 'w-11/12 md:w-1/2 lg:w-2/3',
        large: 'w-11/12 md:w-3/4 lg:w-5/6'
    };
    
    container.className = `relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white ${sizeClasses[size]}`;
    
    container.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${showCloseButton ? '<button class="modal-close" onclick="closeActiveModal()"><i class="fas fa-times"></i></button>' : ''}
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;
    
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // フォーカス管理
    const firstFocusable = container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
        firstFocusable.focus();
    }
    
    return {
        isVisible: () => !overlay.classList.contains('hidden'),
        close: () => closeActiveModal(),
        updateContent: (newContent) => {
            const body = container.querySelector('.modal-body');
            if (body) body.innerHTML = newContent;
        }
    };
}

/**
 * アクティブモーダルを閉じる
 */
function closeActiveModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * 確認ダイアログ表示
 * @param {string} title - タイトル
 * @param {string} message - メッセージ
 * @param {string} type - タイプ (info, warning, danger)
 */
function showConfirmDialog(title, message, type = 'info') {
    return new Promise((resolve) => {
        const typeConfig = {
            info: { icon: 'fas fa-info-circle text-blue-500', confirmClass: 'btn-primary' },
            warning: { icon: 'fas fa-exclamation-triangle text-yellow-500', confirmClass: 'btn-secondary' },
            danger: { icon: 'fas fa-exclamation-circle text-red-500', confirmClass: 'btn-danger' }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        const modal = showModal({
            title: title,
            content: `
                <div class="text-center">
                    <i class="${config.icon} text-4xl mb-4"></i>
                    <p class="mb-6 text-gray-700">${message}</p>
                    <div class="flex justify-center space-x-3">
                        <button onclick="confirmDialogResponse(true)" class="btn ${config.confirmClass}">はい</button>
                        <button onclick="confirmDialogResponse(false)" class="btn btn-outline">キャンセル</button>
                    </div>
                </div>
            `,
            showCloseButton: false
        });
        
        // グローバル関数として一時的にレスポンス処理を定義
        window.confirmDialogResponse = (response) => {
            delete window.confirmDialogResponse;
            closeActiveModal();
            resolve(response);
        };
    });
}

/**
 * ドロップダウン初期化
 */
function initializeDropdowns() {
    // ユーザーメニュードロップダウン
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
    }
}

/**
 * 全ドロップダウンを閉じる
 */
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu, #userDropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
}

/**
 * モーダル初期化
 */
function initializeModals() {
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeActiveModal();
        }
    });
}

/**
 * フォームバリデーション初期化
 */
function initializeFormValidation() {
    // リアルタイムバリデーション
    document.addEventListener('input', function(event) {
        const input = event.target;
        if (input.hasAttribute('data-validate')) {
            validateField(input);
        }
    });
    
    // フォーム送信時のバリデーション
    document.addEventListener('submit', function(event) {
        const form = event.target;
        if (!validateForm(form)) {
            event.preventDefault();
        }
    });
}

/**
 * フィールドバリデーション
 */
function validateField(field) {
    const value = field.value.trim();
    const validationType = field.getAttribute('data-validate');
    let isValid = true;
    let message = '';
    
    // 必須チェック
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'この項目は必須です';
    }
    
    // バリデーションタイプ別チェック
    if (value && validationType) {
        switch (validationType) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                message = isValid ? '' : '有効なメールアドレスを入力してください';
                break;
                
            case 'phone':
                const phoneRegex = /^[\d-+()]{10,15}$/;
                isValid = phoneRegex.test(value.replace(/[^0-9-+()]/g, ''));
                message = isValid ? '' : '有効な電話番号を入力してください';
                break;
                
            case 'postal-code':
                const postalRegex = /^\d{3}-\d{4}$/;
                isValid = postalRegex.test(value);
                message = isValid ? '' : '郵便番号は000-0000の形式で入力してください';
                break;
                
            case 'scholarship-number':
                const scholarshipRegex = /^\d{10}$/;
                isValid = scholarshipRegex.test(value);
                message = isValid ? '' : '奨学生番号は10桁の数字で入力してください';
                break;
        }
    }
    
    // バリデーション結果の表示
    showFieldValidation(field, isValid, message);
    
    return isValid;
}

/**
 * フィールドバリデーション結果表示
 */
function showFieldValidation(field, isValid, message) {
    // 既存のエラーメッセージを削除
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // スタイル更新
    if (isValid) {
        field.classList.remove('border-red-500');
        field.classList.add('border-green-500');
    } else {
        field.classList.remove('border-green-500');
        field.classList.add('border-red-500');
        
        // エラーメッセージ表示
        if (message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
    }
}

/**
 * フォームバリデーション
 */
function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('[data-validate], [required]');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * テーブルソート初期化
 */
function initializeTableSorting() {
    document.querySelectorAll('table[data-sortable] th[data-sort]').forEach(header => {
        header.addEventListener('click', function() {
            sortTable(this);
        });
        header.style.cursor = 'pointer';
        header.innerHTML += ' <i class="fas fa-sort text-gray-400 ml-1"></i>';
    });
}

/**
 * テーブルソート実行
 */
function sortTable(header) {
    const table = header.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
    const sortType = header.getAttribute('data-sort');
    const currentDirection = header.getAttribute('data-direction') || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // ソート実行
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        let result = 0;
        
        switch (sortType) {
            case 'number':
                result = parseFloat(aValue) - parseFloat(bValue);
                break;
            case 'date':
                result = new Date(aValue) - new Date(bValue);
                break;
            default: // text
                result = aValue.localeCompare(bValue, 'ja');
        }
        
        return newDirection === 'asc' ? result : -result;
    });
    
    // DOM更新
    rows.forEach(row => tbody.appendChild(row));
    
    // ソート状態更新
    table.querySelectorAll('th[data-sort]').forEach(th => {
        th.removeAttribute('data-direction');
        th.querySelector('i').className = 'fas fa-sort text-gray-400 ml-1';
    });
    
    header.setAttribute('data-direction', newDirection);
    const icon = header.querySelector('i');
    icon.className = `fas fa-sort-${newDirection === 'asc' ? 'up' : 'down'} text-blue-500 ml-1`;
}

/**
 * ファイルサイズフォーマット
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 日付フォーマット
 */
function formatDate(date, format = 'YYYY/MM/DD') {
    const d = new Date(date);
    
    const formats = {
        'YYYY/MM/DD': `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
        'YYYY-MM-DD': `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        'MM/DD': `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
        'YYYY/MM/DD HH:mm': `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    };
    
    return formats[format] || formats['YYYY/MM/DD'];
}

/**
 * 数値フォーマット
 */
function formatNumber(number, locale = 'ja-JP') {
    return new Intl.NumberFormat(locale).format(number);
}

/**
 * CSV出力
 */
function exportToCSV(data, filename = 'export.csv') {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * CSV変換
 */
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // 値にカンマや改行が含まれる場合はダブルクォートで囲む
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * デバウンス関数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 最終更新時刻を更新
 */
function updateLastUpdated() {
    const element = document.getElementById('last-updated');
    if (element) {
        element.textContent = formatDate(new Date(), 'YYYY/MM/DD HH:mm');
    }
}

// グローバル関数として公開
window.showLoadingSpinner = showLoadingSpinner;
window.hideLoadingSpinner = hideLoadingSpinner;
window.showToast = showToast;
window.closeToast = closeToast;
window.showModal = showModal;
window.closeActiveModal = closeActiveModal;
window.showConfirmDialog = showConfirmDialog;
window.formatFileSize = formatFileSize;
window.formatDate = formatDate;
window.formatNumber = formatNumber;
window.exportToCSV = exportToCSV;
window.updateLastUpdated = updateLastUpdated;