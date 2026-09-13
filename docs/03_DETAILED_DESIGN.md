# 詳細設計書

**奨学金代理返還情報管理システム**

---

## 文書情報

| 項目 | 内容 |
|------|------|
| 文書名 | 詳細設計書 |
| バージョン | 1.0.0 |
| 作成日 | 2025年1月26日 |
| 作成者 | 新規事業立ち上げチーム |
| 承認者 | 松木一真 |
| 前提文書 | 要件定義書 v1.0.0、基本設計書 v1.0.0 |

---

## 1. モジュール詳細設計

### 1.1 システム構成詳細

```
奨学金代理返還情報管理システム
├── フロントエンドモジュール
│   ├── 画面表示モジュール (UI Components)
│   ├── 状態管理モジュール (State Management)
│   ├── API通信モジュール (API Client)
│   ├── 認証モジュール (Authentication)
│   ├── エラーハンドリングモジュール (Error Handler)
│   ├── パフォーマンス最適化モジュール (Performance Optimizer)
│   └── ユーティリティモジュール (Utilities)
├── バックエンドモジュール
│   ├── データアクセス層 (Data Access Layer)
│   ├── ビジネスロジック層 (Business Logic Layer)
│   ├── 認証・認可モジュール (Auth & Authorization)
│   ├── 外部システム連携モジュール (External Integration)
│   └── 監査ログモジュール (Audit Logging)
└── 共通モジュール
    ├── 設定管理モジュール (Configuration)
    ├── ログ出力モジュール (Logging)
    └── 検証モジュール (Validation)
```

---

## 2. フロントエンド詳細設計

### 2.1 UI コンポーネント詳細設計

#### 2.1.1 BaseComponent クラス
```javascript
/**
 * 全UIコンポーネントの基底クラス
 */
class BaseComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      autoRender: true,
      bindEvents: true,
      ...options
    };
    this.state = {};
    this.events = new Map();
    
    if (this.options.autoRender) {
      this.render();
    }
    
    if (this.options.bindEvents) {
      this.bindEvents();
    }
  }
  
  /**
   * コンポーネントの描画
   */
  render() {
    throw new Error('render() method must be implemented');
  }
  
  /**
   * イベントのバインド
   */
  bindEvents() {
    // サブクラスでオーバーライド
  }
  
  /**
   * 状態の更新
   */
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.onStateChange(prevState, this.state);
  }
  
  /**
   * 状態変更時の処理
   */
  onStateChange(prevState, newState) {
    // 状態が変更された場合は再描画
    if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
      this.render();
    }
  }
  
  /**
   * イベントリスナーの追加
   */
  addEventListener(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }
  
  /**
   * イベントの発火
   */
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(handler => handler(data));
    }
  }
  
  /**
   * コンポーネントの破棄
   */
  destroy() {
    this.events.clear();
    if (this.element) {
      this.element.innerHTML = '';
    }
  }
}
```

#### 2.1.2 DataTable コンポーネント
```javascript
/**
 * データテーブルコンポーネント
 */
class DataTable extends BaseComponent {
  constructor(element, options = {}) {
    super(element, {
      columns: [],
      data: [],
      pagination: true,
      search: true,
      sort: true,
      pageSize: 20,
      currentPage: 1,
      searchQuery: '',
      sortColumn: null,
      sortDirection: 'asc',
      selectable: false,
      selectedRows: [],
      actions: [],
      ...options
    });
    
    this.setState(this.options);
  }
  
  render() {
    const { columns, data, pagination, search } = this.state;
    
    let html = '<div class="data-table-container">';
    
    // 検索バー
    if (search) {
      html += this.renderSearchBar();
    }
    
    // アクションバー
    if (this.state.actions.length > 0) {
      html += this.renderActionBar();
    }
    
    // テーブル本体
    html += this.renderTable();
    
    // ページネーション
    if (pagination) {
      html += this.renderPagination();
    }
    
    html += '</div>';
    
    this.element.innerHTML = html;
  }
  
  renderSearchBar() {
    return `
      <div class="data-table-search mb-4">
        <div class="flex items-center space-x-2">
          <input type="text" 
                 id="search-input" 
                 class="form-input flex-1" 
                 placeholder="検索..."
                 value="${this.state.searchQuery}">
          <button id="search-btn" class="btn btn-primary">
            <i class="fas fa-search"></i>
          </button>
          <button id="clear-search-btn" class="btn btn-secondary">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
  }
  
  renderActionBar() {
    let html = '<div class="data-table-actions mb-4"><div class="flex space-x-2">';
    
    this.state.actions.forEach(action => {
      html += `
        <button class="btn btn-${action.type}" data-action="${action.id}">
          ${action.icon ? `<i class="${action.icon}"></i>` : ''}
          ${action.label}
        </button>
      `;
    });
    
    html += '</div></div>';
    return html;
  }
  
  renderTable() {
    const { columns, data } = this.state;
    const filteredData = this.getFilteredData();
    const sortedData = this.getSortedData(filteredData);
    const paginatedData = this.getPaginatedData(sortedData);
    
    let html = '<div class="table-wrapper overflow-x-auto">';
    html += '<table class="data-table w-full border-collapse">';
    
    // ヘッダー
    html += '<thead class="bg-gray-50">';
    html += '<tr>';
    
    if (this.state.selectable) {
      html += '<th class="table-header px-4 py-2 border"><input type="checkbox" id="select-all"></th>';
    }
    
    columns.forEach(column => {
      const sortIcon = this.getSortIcon(column.key);
      html += `
        <th class="table-header px-4 py-2 border text-left cursor-pointer" 
            data-sort="${column.key}">
          ${column.label}
          ${column.sortable !== false ? sortIcon : ''}
        </th>
      `;
    });
    
    html += '</tr>';
    html += '</thead>';
    
    // ボディ
    html += '<tbody>';
    
    if (paginatedData.length === 0) {
      html += `
        <tr>
          <td colspan="${columns.length + (this.state.selectable ? 1 : 0)}" 
              class="table-cell px-4 py-8 text-center text-gray-500">
            データがありません
          </td>
        </tr>
      `;
    } else {
      paginatedData.forEach((row, index) => {
        html += `<tr class="table-row hover:bg-gray-50" data-index="${index}">`;
        
        if (this.state.selectable) {
          const isSelected = this.state.selectedRows.includes(row.id);
          html += `
            <td class="table-cell px-4 py-2 border">
              <input type="checkbox" 
                     class="row-checkbox" 
                     data-id="${row.id}"
                     ${isSelected ? 'checked' : ''}>
            </td>
          `;
        }
        
        columns.forEach(column => {
          const value = this.getCellValue(row, column);
          const formattedValue = this.formatCellValue(value, column);
          
          html += `
            <td class="table-cell px-4 py-2 border ${column.className || ''}"
                data-column="${column.key}">
              ${formattedValue}
            </td>
          `;
        });
        
        html += '</tr>';
      });
    }
    
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    
    return html;
  }
  
  renderPagination() {
    const { currentPage, pageSize } = this.state;
    const filteredData = this.getFilteredData();
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredData.length);
    
    let html = '<div class="data-table-pagination mt-4">';
    html += '<div class="flex items-center justify-between">';
    
    // アイテム数表示
    html += `
      <div class="pagination-info text-sm text-gray-600">
        ${startItem}-${endItem} / ${filteredData.length}件
      </div>
    `;
    
    // ページネーションボタン
    html += '<div class="pagination-buttons flex space-x-1">';
    
    // 前のページ
    html += `
      <button class="pagination-btn btn btn-sm btn-secondary" 
              data-page="${currentPage - 1}"
              ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;
    
    // ページ番号
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let page = startPage; page <= endPage; page++) {
      html += `
        <button class="pagination-btn btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-secondary'}" 
                data-page="${page}">
          ${page}
        </button>
      `;
    }
    
    // 次のページ
    html += `
      <button class="pagination-btn btn btn-sm btn-secondary" 
              data-page="${currentPage + 1}"
              ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    return html;
  }
  
  bindEvents() {
    // 検索
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'search-input') {
        this.setState({ searchQuery: e.target.value, currentPage: 1 });
      }
    });
    
    // 検索ボタン
    this.element.addEventListener('click', (e) => {
      if (e.target.id === 'search-btn' || e.target.closest('#search-btn')) {
        const searchQuery = this.element.querySelector('#search-input').value;
        this.setState({ searchQuery, currentPage: 1 });
      }
      
      if (e.target.id === 'clear-search-btn' || e.target.closest('#clear-search-btn')) {
        this.setState({ searchQuery: '', currentPage: 1 });
      }
    });
    
    // ソート
    this.element.addEventListener('click', (e) => {
      const sortHeader = e.target.closest('[data-sort]');
      if (sortHeader) {
        const column = sortHeader.dataset.sort;
        const currentDirection = this.state.sortColumn === column ? this.state.sortDirection : 'asc';
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        
        this.setState({
          sortColumn: column,
          sortDirection: newDirection,
          currentPage: 1
        });
      }
    });
    
    // ページネーション
    this.element.addEventListener('click', (e) => {
      const paginationBtn = e.target.closest('[data-page]');
      if (paginationBtn && !paginationBtn.disabled) {
        const page = parseInt(paginationBtn.dataset.page);
        this.setState({ currentPage: page });
      }
    });
    
    // 行選択
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'select-all') {
        const isChecked = e.target.checked;
        const checkboxes = this.element.querySelectorAll('.row-checkbox');
        checkboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
        });
        
        const selectedRows = isChecked ? 
          this.getPaginatedData(this.getSortedData(this.getFilteredData())).map(row => row.id) : 
          [];
        
        this.setState({ selectedRows });
        this.emit('selectionChange', { selectedRows });
      }
      
      if (e.target.classList.contains('row-checkbox')) {
        const rowId = e.target.dataset.id;
        const selectedRows = [...this.state.selectedRows];
        
        if (e.target.checked) {
          selectedRows.push(rowId);
        } else {
          const index = selectedRows.indexOf(rowId);
          selectedRows.splice(index, 1);
        }
        
        this.setState({ selectedRows });
        this.emit('selectionChange', { selectedRows });
      }
    });
    
    // アクションボタン
    this.element.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const actionId = actionBtn.dataset.action;
        this.emit('actionClick', { actionId, selectedRows: this.state.selectedRows });
      }
    });
    
    // 行クリック
    this.element.addEventListener('click', (e) => {
      const row = e.target.closest('.table-row');
      if (row && !e.target.closest('input, button')) {
        const index = parseInt(row.dataset.index);
        const paginatedData = this.getPaginatedData(this.getSortedData(this.getFilteredData()));
        const rowData = paginatedData[index];
        this.emit('rowClick', { rowData, index });
      }
    });
  }
  
  // データ処理メソッド
  getFilteredData() {
    const { data, searchQuery } = this.state;
    
    if (!searchQuery) {
      return data;
    }
    
    return data.filter(row => {
      return Object.values(row).some(value => {
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }
  
  getSortedData(data) {
    const { sortColumn, sortDirection } = this.state;
    
    if (!sortColumn) {
      return data;
    }
    
    return [...data].sort((a, b) => {
      const aValue = this.getCellValue(a, { key: sortColumn });
      const bValue = this.getCellValue(b, { key: sortColumn });
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  getPaginatedData(data) {
    const { currentPage, pageSize } = this.state;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return data.slice(startIndex, endIndex);
  }
  
  getCellValue(row, column) {
    const keys = column.key.split('.');
    let value = row;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        return '';
      }
    }
    
    return value;
  }
  
  formatCellValue(value, column) {
    if (column.render) {
      return column.render(value);
    }
    
    if (column.type === 'currency') {
      return Number(value).toLocaleString() + '円';
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('ja-JP');
    }
    
    if (column.type === 'status') {
      const statusClass = this.getStatusClass(value);
      return `<span class="status-badge ${statusClass}">${value}</span>`;
    }
    
    return value || '';
  }
  
  getStatusClass(status) {
    const statusMap = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    
    return statusMap[status] || 'status-default';
  }
  
  getSortIcon(columnKey) {
    const { sortColumn, sortDirection } = this.state;
    
    if (sortColumn !== columnKey) {
      return '<i class="fas fa-sort text-gray-400"></i>';
    }
    
    if (sortDirection === 'asc') {
      return '<i class="fas fa-sort-up text-blue-500"></i>';
    } else {
      return '<i class="fas fa-sort-down text-blue-500"></i>';
    }
  }
  
  // パブリックメソッド
  setData(data) {
    this.setState({ data, currentPage: 1 });
  }
  
  getSelectedRows() {
    return this.state.selectedRows;
  }
  
  clearSelection() {
    this.setState({ selectedRows: [] });
  }
  
  refresh() {
    this.render();
  }
}
```

#### 2.1.3 Modal コンポーネント
```javascript
/**
 * モーダルダイアログコンポーネント
 */
class Modal extends BaseComponent {
  constructor(options = {}) {
    // モーダル用の要素を動的作成
    const modalElement = document.createElement('div');
    modalElement.className = 'modal-overlay';
    document.body.appendChild(modalElement);
    
    super(modalElement, {
      title: '',
      content: '',
      size: 'medium', // small, medium, large, full
      closable: true,
      backdrop: true,
      keyboard: true,
      actions: [],
      ...options
    });
    
    this.isOpen = false;
  }
  
  render() {
    const { title, content, size, closable, actions } = this.state;
    
    const sizeClass = this.getSizeClass(size);
    
    let html = `
      <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-40 ${this.isOpen ? '' : 'hidden'}" 
           id="modal-backdrop"></div>
      <div class="modal-container fixed inset-0 z-50 flex items-center justify-center p-4 ${this.isOpen ? '' : 'hidden'}" 
           id="modal-container">
        <div class="modal-content bg-white rounded-lg shadow-xl ${sizeClass}" id="modal-content">
    `;
    
    // ヘッダー
    if (title || closable) {
      html += '<div class="modal-header flex items-center justify-between p-6 border-b">';
      
      if (title) {
        html += `<h2 class="modal-title text-xl font-semibold text-gray-900">${title}</h2>`;
      }
      
      if (closable) {
        html += `
          <button class="modal-close-btn text-gray-400 hover:text-gray-600" id="modal-close">
            <i class="fas fa-times text-xl"></i>
          </button>
        `;
      }
      
      html += '</div>';
    }
    
    // ボディ
    html += `<div class="modal-body p-6">${content}</div>`;
    
    // フッター（アクション）
    if (actions.length > 0) {
      html += '<div class="modal-footer flex justify-end space-x-2 p-6 border-t bg-gray-50">';
      
      actions.forEach(action => {
        html += `
          <button class="btn btn-${action.type || 'secondary'}" 
                  id="modal-action-${action.id}"
                  data-action="${action.id}">
            ${action.icon ? `<i class="${action.icon}"></i>` : ''}
            ${action.label}
          </button>
        `;
      });
      
      html += '</div>';
    }
    
    html += `
        </div>
      </div>
    `;
    
    this.element.innerHTML = html;
  }
  
  bindEvents() {
    // 背景クリックで閉じる
    this.element.addEventListener('click', (e) => {
      if (this.state.backdrop && e.target.id === 'modal-backdrop') {
        this.close();
      }
    });
    
    // 閉じるボタン
    this.element.addEventListener('click', (e) => {
      if (e.target.id === 'modal-close' || e.target.closest('#modal-close')) {
        this.close();
      }
    });
    
    // アクションボタン
    this.element.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const actionId = actionBtn.dataset.action;
        this.emit('actionClick', { actionId, modal: this });
      }
    });
    
    // キーボードイベント
    if (this.state.keyboard) {
      document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }
  
  handleKeydown(e) {
    if (this.isOpen && e.key === 'Escape') {
      this.close();
    }
  }
  
  getSizeClass(size) {
    const sizeMap = {
      small: 'w-full max-w-md',
      medium: 'w-full max-w-lg',
      large: 'w-full max-w-2xl',
      xlarge: 'w-full max-w-4xl',
      full: 'w-full max-w-none m-4'
    };
    
    return sizeMap[size] || sizeMap.medium;
  }
  
  // パブリックメソッド
  open() {
    this.isOpen = true;
    this.render();
    document.body.style.overflow = 'hidden';
    this.emit('open');
  }
  
  close() {
    this.isOpen = false;
    this.render();
    document.body.style.overflow = '';
    this.emit('close');
  }
  
  setTitle(title) {
    this.setState({ title });
  }
  
  setContent(content) {
    this.setState({ content });
  }
  
  setActions(actions) {
    this.setState({ actions });
  }
  
  destroy() {
    super.destroy();
    document.body.removeChild(this.element);
    document.body.style.overflow = '';
  }
}
```

### 2.2 状態管理詳細設計

#### 2.2.1 StateManager クラス
```javascript
/**
 * アプリケーション状態管理クラス
 */
class StateManager {
  constructor(initialState = {}) {
    this.state = {
      // ユーザー関連
      user: {
        currentUser: null,
        isAuthenticated: false,
        permissions: [],
        loginTime: null
      },
      
      // データ関連
      data: {
        employees: [],
        applications: [],
        documents: [],
        users: [],
        statistics: {}
      },
      
      // UI関連
      ui: {
        loading: false,
        currentPage: 'dashboard',
        selectedEmployeeId: null,
        selectedApplicationId: null,
        filters: {},
        searchQuery: '',
        notifications: [],
        modals: {}
      },
      
      // 設定関連
      settings: {
        pageSize: 20,
        theme: 'light',
        language: 'ja',
        autoRefresh: true,
        refreshInterval: 30000
      },
      
      ...initialState
    };
    
    this.listeners = new Map();
    this.history = [];
    this.maxHistorySize = 100;
  }
  
  /**
   * 状態の取得
   */
  getState(path) {
    if (!path) {
      return this.state;
    }
    
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }
  
  /**
   * 状態の更新
   */
  setState(path, value) {
    // 履歴に保存
    this.saveToHistory();
    
    if (typeof path === 'string') {
      this.setNestedState(path, value);
    } else if (typeof path === 'object') {
      // オブジェクト形式での一括更新
      Object.keys(path).forEach(key => {
        this.setNestedState(key, path[key]);
      });
    }
    
    // リスナーに通知
    this.notifyListeners();
  }
  
  /**
   * ネストした状態の更新
   */
  setNestedState(path, value) {
    const keys = path.split('.');
    let current = this.state;
    
    // 最後のキー以外をたどる
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // 最後のキーに値を設定
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }
  
  /**
   * 配列状態の操作
   */
  pushToArray(path, item) {
    const currentArray = this.getState(path) || [];
    this.setState(path, [...currentArray, item]);
  }
  
  removeFromArray(path, predicate) {
    const currentArray = this.getState(path) || [];
    const newArray = currentArray.filter(item => !predicate(item));
    this.setState(path, newArray);
  }
  
  updateArrayItem(path, predicate, updater) {
    const currentArray = this.getState(path) || [];
    const newArray = currentArray.map(item => {
      if (predicate(item)) {
        return typeof updater === 'function' ? updater(item) : { ...item, ...updater };
      }
      return item;
    });
    this.setState(path, newArray);
  }
  
  /**
   * リスナーの登録
   */
  subscribe(path, listener) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, []);
    }
    
    this.listeners.get(path).push(listener);
    
    // アンサブスクライブ関数を返す
    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * リスナーへの通知
   */
  notifyListeners() {
    this.listeners.forEach((listeners, path) => {
      const value = this.getState(path);
      listeners.forEach(listener => {
        try {
          listener(value, path);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    });
  }
  
  /**
   * 履歴への保存
   */
  saveToHistory() {
    const snapshot = JSON.parse(JSON.stringify(this.state));
    this.history.push({
      state: snapshot,
      timestamp: Date.now()
    });
    
    // 履歴サイズ制限
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
  
  /**
   * 状態の復元
   */
  restoreFromHistory(index = -1) {
    if (this.history.length === 0) {
      return false;
    }
    
    const historyIndex = index < 0 ? this.history.length + index : index;
    const snapshot = this.history[historyIndex];
    
    if (snapshot) {
      this.state = JSON.parse(JSON.stringify(snapshot.state));
      this.notifyListeners();
      return true;
    }
    
    return false;
  }
  
  /**
   * 状態のリセット
   */
  reset() {
    this.saveToHistory();
    this.state = {
      user: { currentUser: null, isAuthenticated: false, permissions: [], loginTime: null },
      data: { employees: [], applications: [], documents: [], users: [], statistics: {} },
      ui: { loading: false, currentPage: 'dashboard', selectedEmployeeId: null, selectedApplicationId: null, filters: {}, searchQuery: '', notifications: [], modals: {} },
      settings: { pageSize: 20, theme: 'light', language: 'ja', autoRefresh: true, refreshInterval: 30000 }
    };
    this.notifyListeners();
  }
  
  /**
   * デバッグ用メソッド
   */
  debug() {
    return {
      state: this.state,
      history: this.history,
      listeners: Array.from(this.listeners.keys())
    };
  }
}
```

### 2.3 API通信モジュール詳細設計

#### 2.3.1 ApiClient クラス
```javascript
/**
 * API通信クライアントクラス
 */
class ApiClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 30000;
    this.retryCount = config.retryCount || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.interceptors = {
      request: [],
      response: []
    };
    
    // デフォルトヘッダー
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers
    };
    
    // レスポンスキャッシュ
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5分
  }
  
  /**
   * リクエストインターセプターの追加
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }
  
  /**
   * レスポンスインターセプターの追加
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }
  
  /**
   * HTTP リクエストの実行
   */
  async request(config) {
    // リクエスト設定の準備
    const requestConfig = {
      method: 'GET',
      headers: { ...this.defaultHeaders },
      timeout: this.timeout,
      ...config
    };
    
    // URLの構築
    const url = this.buildUrl(requestConfig.url, requestConfig.params);
    
    // キャッシュチェック（GETリクエストのみ）
    if (requestConfig.method === 'GET') {
      const cachedResponse = this.getFromCache(url);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // リクエストインターセプターの実行
    for (const interceptor of this.interceptors.request) {
      requestConfig = await interceptor(requestConfig);
    }
    
    // リクエストの実行（リトライ付き）
    let lastError;
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const response = await this.executeRequest(url, requestConfig);
        
        // レスポンスインターセプターの実行
        let processedResponse = response;
        for (const interceptor of this.interceptors.response) {
          processedResponse = await interceptor(processedResponse);
        }
        
        // キャッシュに保存（GETリクエストのみ）
        if (requestConfig.method === 'GET' && processedResponse.success) {
          this.saveToCache(url, processedResponse);
        }
        
        return processedResponse;
      } catch (error) {
        lastError = error;
        
        // リトライしない条件
        if (attempt === this.retryCount || this.shouldNotRetry(error)) {
          break;
        }
        
        // リトライ前の待機
        await this.delay(this.retryDelay * Math.pow(2, attempt));
      }
    }
    
    throw lastError;
  }
  
  /**
   * 実際のHTTPリクエストの実行
   */
  async executeRequest(url, config) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), config.timeout);
    
    try {
      const fetchConfig = {
        method: config.method,
        headers: config.headers,
        signal: abortController.signal
      };
      
      // リクエストボディの設定
      if (config.data && config.method !== 'GET') {
        if (config.headers['Content-Type'] === 'application/json') {
          fetchConfig.body = JSON.stringify(config.data);
        } else {
          fetchConfig.body = config.data;
        }
      }
      
      const response = await fetch(url, fetchConfig);
      
      clearTimeout(timeoutId);
      
      // レスポンスの解析
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // エラーレスポンスのチェック
      if (!response.ok) {
        throw new ApiError(
          responseData.message || `HTTP ${response.status}`,
          response.status,
          responseData
        );
      }
      
      return {
        success: true,
        data: responseData,
        status: response.status,
        headers: this.parseHeaders(response.headers)
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Network error', 0, error);
    }
  }
  
  /**
   * URL の構築
   */
  buildUrl(path, params) {
    let url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }
  
  /**
   * レスポンスヘッダーの解析
   */
  parseHeaders(headers) {
    const parsed = {};
    headers.forEach((value, key) => {
      parsed[key] = value;
    });
    return parsed;
  }
  
  /**
   * キャッシュからの取得
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }
  
  /**
   * キャッシュへの保存
   */
  saveToCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }
  
  /**
   * キャッシュのクリア
   */
  clearCache(pattern) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
  
  /**
   * リトライしない条件の判定
   */
  shouldNotRetry(error) {
    // 4xx エラー（クライアントエラー）はリトライしない
    return error.status >= 400 && error.status < 500;
  }
  
  /**
   * 待機処理
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // HTTP メソッドのショートカット
  get(url, params, config = {}) {
    return this.request({ ...config, method: 'GET', url, params });
  }
  
  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }
  
  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }
  
  patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
  }
  
  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

/**
 * API エラークラス
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
```

---

## 3. データベース詳細設計

### 3.1 ストアドプロシージャ設計

#### 3.1.1 統計情報取得プロシージャ
```sql
-- ダッシュボード統計情報取得
CREATE OR REPLACE FUNCTION get_dashboard_statistics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_employees INTEGER;
    scholarship_eligible INTEGER;
    total_applications INTEGER;
    pending_applications INTEGER;
    approved_applications INTEGER;
    total_monthly_support INTEGER;
    avg_support INTEGER;
    current_month_applications INTEGER;
    previous_month_applications INTEGER;
BEGIN
    -- 従業員統計
    SELECT COUNT(*) INTO total_employees 
    FROM employees 
    WHERE status = 'active';
    
    SELECT COUNT(*) INTO scholarship_eligible 
    FROM employees 
    WHERE status = 'active' AND scholarship_eligible = true;
    
    -- 申請統計
    SELECT COUNT(*) INTO total_applications 
    FROM applications;
    
    SELECT COUNT(*) INTO pending_applications 
    FROM applications 
    WHERE status = 'pending';
    
    SELECT COUNT(*) INTO approved_applications 
    FROM applications 
    WHERE status = 'approved';
    
    -- 支援額統計
    SELECT COALESCE(SUM(current_scholarship_amount), 0) INTO total_monthly_support
    FROM employees 
    WHERE status = 'active' AND scholarship_eligible = true;
    
    SELECT COALESCE(AVG(current_scholarship_amount), 0)::INTEGER INTO avg_support
    FROM employees 
    WHERE status = 'active' AND scholarship_eligible = true;
    
    -- 月次比較
    SELECT COUNT(*) INTO current_month_applications
    FROM applications
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
    
    SELECT COUNT(*) INTO previous_month_applications
    FROM applications
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    
    -- 結果のJSON構築
    result := jsonb_build_object(
        'employees', jsonb_build_object(
            'total', total_employees,
            'scholarship_eligible', scholarship_eligible,
            'eligibility_rate', CASE 
                WHEN total_employees > 0 THEN ROUND((scholarship_eligible::DECIMAL / total_employees * 100), 1)
                ELSE 0 
            END
        ),
        'applications', jsonb_build_object(
            'total', total_applications,
            'pending', pending_applications,
            'approved', approved_applications,
            'approval_rate', CASE 
                WHEN total_applications > 0 THEN ROUND((approved_applications::DECIMAL / total_applications * 100), 1)
                ELSE 0 
            END,
            'monthly_change', CASE
                WHEN previous_month_applications > 0 THEN ROUND(((current_month_applications - previous_month_applications)::DECIMAL / previous_month_applications * 100), 1)
                ELSE 0
            END
        ),
        'support', jsonb_build_object(
            'total_monthly', total_monthly_support,
            'average', avg_support,
            'total_annual', total_monthly_support * 12
        ),
        'generated_at', EXTRACT(EPOCH FROM NOW()) * 1000
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### 3.1.2 月次レポート生成プロシージャ
```sql
-- 月次レポート生成
CREATE OR REPLACE FUNCTION generate_monthly_report(
    target_year INTEGER,
    target_month INTEGER
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    period_start DATE;
    period_end DATE;
    department_stats JSONB;
    status_stats JSONB;
    new_applications INTEGER;
    completed_applications INTEGER;
    total_support_amount INTEGER;
BEGIN
    -- 対象期間の設定
    period_start := DATE(target_year || '-' || LPAD(target_month::TEXT, 2, '0') || '-01');
    period_end := (period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- 部署別統計
    SELECT jsonb_agg(
        jsonb_build_object(
            'department', dept_stats.department,
            'employee_count', dept_stats.employee_count,
            'application_count', dept_stats.application_count,
            'total_amount', dept_stats.total_amount,
            'average_amount', dept_stats.average_amount
        )
    ) INTO department_stats
    FROM (
        SELECT 
            e.department,
            COUNT(DISTINCT e.id) as employee_count,
            COUNT(a.id) as application_count,
            COALESCE(SUM(a.monthly_amount), 0) as total_amount,
            COALESCE(AVG(a.monthly_amount), 0)::INTEGER as average_amount
        FROM employees e
        LEFT JOIN applications a ON e.id = a.employee_id 
            AND a.created_at BETWEEN period_start AND period_end + INTERVAL '1 day'
        WHERE e.status = 'active'
        GROUP BY e.department
        ORDER BY e.department
    ) dept_stats;
    
    -- ステータス別統計
    SELECT jsonb_agg(
        jsonb_build_object(
            'status', status_stats.status,
            'count', status_stats.count,
            'percentage', status_stats.percentage
        )
    ) INTO status_stats
    FROM (
        SELECT 
            status,
            COUNT(*) as count,
            ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER () * 100, 1) as percentage
        FROM applications
        WHERE created_at BETWEEN period_start AND period_end + INTERVAL '1 day'
        GROUP BY status
        ORDER BY count DESC
    ) status_stats;
    
    -- 新規申請数
    SELECT COUNT(*) INTO new_applications
    FROM applications
    WHERE created_at BETWEEN period_start AND period_end + INTERVAL '1 day';
    
    -- 完了申請数
    SELECT COUNT(*) INTO completed_applications
    FROM applications
    WHERE status = 'approved' 
    AND approved_at BETWEEN period_start AND period_end + INTERVAL '1 day';
    
    -- 総支援額
    SELECT COALESCE(SUM(monthly_amount), 0) INTO total_support_amount
    FROM applications
    WHERE status = 'approved'
    AND start_date <= period_end
    AND (end_date IS NULL OR end_date >= period_start);
    
    -- 結果のJSON構築
    result := jsonb_build_object(
        'period', jsonb_build_object(
            'year', target_year,
            'month', target_month,
            'start_date', period_start,
            'end_date', period_end
        ),
        'summary', jsonb_build_object(
            'new_applications', new_applications,
            'completed_applications', completed_applications,
            'total_support_amount', total_support_amount,
            'completion_rate', CASE 
                WHEN new_applications > 0 THEN ROUND((completed_applications::DECIMAL / new_applications * 100), 1)
                ELSE 0 
            END
        ),
        'department_breakdown', department_stats,
        'status_breakdown', status_stats,
        'generated_at', EXTRACT(EPOCH FROM NOW()) * 1000
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 トリガー設計

#### 3.2.1 監査ログ自動記録トリガー
```sql
-- 監査ログ記録関数
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_data JSONB;
    current_user_id TEXT;
BEGIN
    -- 現在のユーザーIDを取得（セッション変数から）
    current_user_id := COALESCE(current_setting('app.current_user_id', true), 'system');
    
    -- 操作種別に応じた処理
    IF TG_OP = 'INSERT' THEN
        audit_data := jsonb_build_object(
            'table_name', TG_TABLE_NAME,
            'operation', 'INSERT',
            'new_values', row_to_json(NEW),
            'record_id', CASE 
                WHEN TG_TABLE_NAME = 'employees' THEN NEW.id::TEXT
                WHEN TG_TABLE_NAME = 'applications' THEN NEW.id::TEXT
                WHEN TG_TABLE_NAME = 'documents' THEN NEW.id::TEXT
                WHEN TG_TABLE_NAME = 'users' THEN NEW.id::TEXT
                ELSE NULL
            END
        );
        
        INSERT INTO audit_logs (action, user_id, details, ip_address)
        VALUES ('DATA_CREATE', current_user_id, audit_data, 'trigger');
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        audit_data := jsonb_build_object(
            'table_name', TG_TABLE_NAME,
            'operation', 'UPDATE',
            'old_values', row_to_json(OLD),
            'new_values', row_to_json(NEW),
            'changed_fields', (
                SELECT jsonb_agg(key)
                FROM jsonb_each(row_to_json(OLD)::jsonb) old_data
                JOIN jsonb_each(row_to_json(NEW)::jsonb) new_data ON old_data.key = new_data.key
                WHERE old_data.value IS DISTINCT FROM new_data.value
            ),
            'record_id', CASE 
                WHEN TG_TABLE_NAME = 'employees' THEN NEW.id::TEXT
                WHEN TG_TABLE_NAME = 'applications' THEN NEW.id::TEXT
                WHEN TG_TABLE_NAME = 'documents' THEN NEW.id::TEXT
                WHEN TG_TABLE_NAME = 'users' THEN NEW.id::TEXT
                ELSE NULL
            END
        );
        
        INSERT INTO audit_logs (action, user_id, details, ip_address)
        VALUES ('DATA_UPDATE', current_user_id, audit_data, 'trigger');
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        audit_data := jsonb_build_object(
            'table_name', TG_TABLE_NAME,
            'operation', 'DELETE',
            'old_values', row_to_json(OLD),
            'record_id', CASE 
                WHEN TG_TABLE_NAME = 'employees' THEN OLD.id::TEXT
                WHEN TG_TABLE_NAME = 'applications' THEN OLD.id::TEXT
                WHEN TG_TABLE_NAME = 'documents' THEN OLD.id::TEXT
                WHEN TG_TABLE_NAME = 'users' THEN OLD.id::TEXT
                ELSE NULL
            END
        );
        
        INSERT INTO audit_logs (action, user_id, details, ip_address)
        VALUES ('DATA_DELETE', current_user_id, audit_data, 'trigger');
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER employees_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER applications_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER documents_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

#### 3.2.2 自動更新タイムスタンプトリガー
```sql
-- 更新タイムスタンプ自動更新関数
CREATE OR REPLACE FUNCTION update_timestamp_function()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER employees_update_timestamp
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_function();

CREATE TRIGGER applications_update_timestamp
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_function();

CREATE TRIGGER documents_update_timestamp
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_function();

CREATE TRIGGER users_update_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_function();
```

---

## 4. セキュリティ詳細設計

### 4.1 暗号化処理詳細設計

#### 4.1.1 データ暗号化クラス
```javascript
/**
 * データ暗号化・復号化クラス
 */
class EncryptionService {
  constructor(config = {}) {
    this.algorithm = config.algorithm || 'AES-GCM';
    this.keyLength = config.keyLength || 256;
    this.ivLength = config.ivLength || 12;
    this.tagLength = config.tagLength || 16;
    this.iterations = config.iterations || 100000;
    this.hash = config.hash || 'SHA-256';
  }
  
  /**
   * マスターキーの生成
   */
  async generateMasterKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);
    
    // パスワードをキーマテリアルとしてインポート
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // PBKDF2でキーを導出
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: this.iterations,
        hash: this.hash
      },
      keyMaterial,
      {
        name: this.algorithm,
        length: this.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
    
    return key;
  }
  
  /**
   * データの暗号化
   */
  async encrypt(plaintext, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // 初期化ベクトル（IV）の生成
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    
    // 暗号化実行
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
        tagLength: this.tagLength * 8
      },
      key,
      data
    );
    
    // IV + 暗号化データを結合
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    
    // Base64エンコードして返す
    return this.arrayBufferToBase64(result.buffer);
  }
  
  /**
   * データの復号化
   */
  async decrypt(encryptedData, key) {
    // Base64デコード
    const data = this.base64ToArrayBuffer(encryptedData);
    const dataArray = new Uint8Array(data);
    
    // IVと暗号化データを分離
    const iv = dataArray.slice(0, this.ivLength);
    const encrypted = dataArray.slice(this.ivLength);
    
    try {
      // 復号化実行
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
          tagLength: this.tagLength * 8
        },
        key,
        encrypted
      );
      
      // 文字列に変換して返す
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }
  
  /**
   * パスワードハッシュ生成
   */
  async hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);
    
    // パスワードをキーマテリアルとしてインポート
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // PBKDF2でハッシュを生成
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: this.iterations,
        hash: this.hash
      },
      keyMaterial,
      this.keyLength
    );
    
    return this.arrayBufferToBase64(hashBuffer);
  }
  
  /**
   * パスワード検証
   */
  async verifyPassword(password, hashedPassword, salt) {
    const computedHash = await this.hashPassword(password, salt);
    
    // 定数時間比較（タイミング攻撃対策）
    return this.constantTimeCompare(computedHash, hashedPassword);
  }
  
  /**
   * 定数時間での文字列比較
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
  
  /**
   * ランダムソルトの生成
   */
  generateSalt(length = 32) {
    const saltArray = crypto.getRandomValues(new Uint8Array(length));
    return this.arrayBufferToBase64(saltArray.buffer);
  }
  
  /**
   * セキュアランダム文字列の生成
   */
  generateSecureRandom(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomArray = crypto.getRandomValues(new Uint8Array(length));
    
    return Array.from(randomArray, byte => chars[byte % chars.length]).join('');
  }
  
  /**
   * ArrayBuffer を Base64 文字列に変換
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chars = Array.from(bytes, byte => String.fromCharCode(byte));
    return btoa(chars.join(''));
  }
  
  /**
   * Base64 文字列を ArrayBuffer に変換
   */
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }
}
```

---

## 5. 承認・変更管理

### 5.1 文書承認
| 承認レベル | 承認者 | 承認日 | 署名 |
|------------|--------|--------|------|
| 作成者 | 新規事業立ち上げチーム | 2025/01/26 | |
| レビュー者 | 技術責任者 | - | - |
| 承認者 | 松木一真（プロジェクトマネージャー） | - | - |

### 5.2 変更履歴
| バージョン | 変更日 | 変更者 | 変更内容 |
|------------|--------|--------|----------|
| 1.0.0 | 2025/01/26 | 新規事業立ち上げチーム | 初版作成 |

---

* *本詳細設計書は、基本設計書に基づいた実装レベルの詳細仕様を定めたものである。**

**バージョン**: 1.0.0  
**最終更新**: 2025年1月26日  
**次回更新予定**: 実装フェーズでの詳細化・修正