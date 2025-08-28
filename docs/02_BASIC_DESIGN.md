# 🏗️ 基本設計書

**奨学金代理返還情報管理システム**

---

## 📄 文書情報

| 項目 | 内容 |
|------|------|
| 文書名 | 基本設計書 |
| バージョン | 1.0.0 |
| 作成日 | 2025年1月26日 |
| 作成者 | 新規事業立ち上げチーム |
| 承認者 | 松木一真 |
| 前提文書 | 要件定義書 v1.0.0 |

---

## 🎯 1. システム概要

### 1.1 システム構成概要
```
┌─────────────────────────────────────────┐
│              フロントエンド               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 従業員  │ │ 申請    │ │ レポート │  │
│  │ 管理    │ │ 管理    │ │ 分析    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 文書    │ │ ユーザー │ │ ダッシュ │  │
│  │ 管理    │ │ 管理    │ │ ボード  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
                    │ HTTPS
┌─────────────────────────────────────────┐
│              バックエンド                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ REST    │ │ 認証    │ │ ファイル │  │
│  │ API     │ │ サービス │ │ ストレージ│  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
                    │ SQL
┌─────────────────────────────────────────┐
│              データベース                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 従業員  │ │ 申請    │ │ 文書    │  │
│  │ テーブル │ │ テーブル │ │ テーブル │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
                    │ API
┌─────────────────────────────────────────┐
│              外部システム                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ JASSO   │ │ メール  │ │ AD/LDAP │  │
│  │ API     │ │ SMTP    │ │ 認証    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

### 1.2 技術アーキテクチャ
- **アーキテクチャパターン**: SPA (Single Page Application)
- **フロントエンド**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **通信プロトコル**: HTTPS + REST API
- **認証方式**: JWT + Multi-Factor Authentication

---

## 🖥️ 2. フロントエンド設計

### 2.1 画面構成

#### 2.1.1 メイン画面構成
```
┌─────────────────────────────────────────┐
│               ヘッダー                  │
│  ロゴ    ナビゲーション      ユーザー  │
└─────────────────────────────────────────┘
│ サイドバー │        メインコンテンツ   │
│           │                          │
│ ┌─────────┐│ ┌─────────────────────────┐│
│ │ダッシュボ││ │                        ││
│ │ード    ││ │                        ││
│ ├─────────┤│ │                        ││
│ │従業員   ││ │       動的コンテンツ    ││
│ │管理     ││ │                        ││
│ ├─────────┤│ │                        ││
│ │申請管理 ││ │                        ││
│ ├─────────┤│ │                        ││
│ │文書管理 ││ │                        ││
│ ├─────────┤│ │                        ││
│ │レポート ││ │                        ││
│ ├─────────┤│ │                        ││
│ │設定     ││ │                        ││
│ └─────────┘│ └─────────────────────────┘│
└─────────────────────────────────────────┘
│                フッター                 │
└─────────────────────────────────────────┘
```

#### 2.1.2 主要画面一覧

| 画面ID | 画面名 | 説明 |
|--------|--------|------|
| SC-001 | ログイン画面 | ユーザー認証 |
| SC-002 | ダッシュボード | システム概要・統計表示 |
| SC-003 | 従業員管理画面 | 従業員CRUD操作 |
| SC-004 | 従業員詳細画面 | 個別従業員情報管理 |
| SC-005 | 申請管理画面 | 申請一覧・検索 |
| SC-006 | 申請作成画面 | 新規申請作成 |
| SC-007 | 申請詳細画面 | 申請内容確認・承認 |
| SC-008 | 文書管理画面 | ファイル一覧・アップロード |
| SC-009 | レポート画面 | 各種レポート生成 |
| SC-010 | ユーザー管理画面 | システム利用者管理 |

### 2.2 UI/UXデザイン設計

#### 2.2.1 デザインシステム
```css
/* カラーパレット */
:root {
  --primary-color: #1e40af;      /* メインブルー */
  --secondary-color: #64748b;    /* グレー */
  --success-color: #059669;      /* 成功グリーン */
  --warning-color: #d97706;      /* 警告オレンジ */
  --danger-color: #dc2626;       /* エラーレッド */
  --background-color: #f8fafc;   /* 背景色 */
  --text-primary: #1e293b;       /* 主要テキスト */
  --text-secondary: #64748b;     /* 副テキスト */
}

/* タイポグラフィ */
.text-h1 { font-size: 2.25rem; font-weight: 700; }
.text-h2 { font-size: 1.875rem; font-weight: 600; }
.text-h3 { font-size: 1.5rem; font-weight: 600; }
.text-body { font-size: 1rem; font-weight: 400; }
.text-small { font-size: 0.875rem; font-weight: 400; }

/* スペーシング */
.spacing-xs { margin: 0.25rem; }
.spacing-sm { margin: 0.5rem; }
.spacing-md { margin: 1rem; }
.spacing-lg { margin: 1.5rem; }
.spacing-xl { margin: 3rem; }
```

#### 2.2.2 コンポーネント設計
```javascript
// ボタンコンポーネント
class Button {
  constructor(text, type = 'primary', size = 'medium') {
    this.text = text;
    this.type = type; // primary, secondary, success, warning, danger
    this.size = size; // small, medium, large
  }
  
  render() {
    return `
      <button class="btn btn-${this.type} btn-${this.size}">
        ${this.text}
      </button>
    `;
  }
}

// テーブルコンポーネント
class DataTable {
  constructor(data, columns, options = {}) {
    this.data = data;
    this.columns = columns;
    this.options = {
      pagination: true,
      search: true,
      sort: true,
      ...options
    };
  }
}

// モーダルコンポーネント
class Modal {
  constructor(title, content, actions = []) {
    this.title = title;
    this.content = content;
    this.actions = actions;
  }
}
```

### 2.3 状態管理設計

#### 2.3.1 状態管理パターン
```javascript
// アプリケーション状態管理
class StateManager {
  constructor() {
    this.state = {
      user: null,
      employees: [],
      applications: [],
      documents: [],
      ui: {
        loading: false,
        currentPage: 'dashboard',
        selectedEmployee: null,
        filters: {},
        notifications: []
      }
    };
    this.listeners = [];
  }
  
  // 状態更新
  setState(path, value) {
    const keys = path.split('.');
    let current = this.state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.notifyListeners();
  }
  
  // 状態取得
  getState(path) {
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      current = current[key];
      if (current === undefined) return undefined;
    }
    
    return current;
  }
  
  // リスナー登録
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // リスナー通知
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

---

## 🗄️ 3. データベース設計

### 3.1 ER図
```
┌─────────────────┐    ┌─────────────────┐
│     users       │    │   employees     │
├─────────────────┤    ├─────────────────┤
│ * id (UUID)     │    │ * id (UUID)     │
│   username      │    │   employee_id   │
│   full_name     │    │   full_name     │
│   email         │    │   email         │
│   role          │    │   phone_number  │
│   department    │    │   department    │
│   permissions   │    │   position      │
│   last_login    │    │   hire_date     │
│   status        │    │   scholarship_  │
│   created_at    │    │   eligible      │
│   updated_at    │    │   current_      │
└─────────────────┘    │   scholarship_  │
                       │   amount        │
                       │   max_support_  │
                       │   amount        │
                       │   bank_account  │
                       │   emergency_    │
                       │   contact       │
                       │   notes         │
                       │   status        │
                       │   created_at    │
                       │   updated_at    │
                       └─────────────────┘
                               │
                               │ 1:N
                               ▼
┌─────────────────┐    ┌─────────────────┐
│   documents     │    │  applications   │
├─────────────────┤    ├─────────────────┤
│ * id (UUID)     │    │ * id (UUID)     │
│ * employee_id   │◄──│ * employee_id   │
│ * application_id│◄──│   application_  │
│   document_name │    │   number        │
│   document_type │    │   scholarship_  │
│   file_path     │    │   type          │
│   file_size     │    │   monthly_      │
│   mime_type     │    │   amount        │
│   upload_date   │    │   total_amount  │
│   uploaded_by   │    │   start_date    │
│   verification_│    │   end_date      │
│   status        │    │   jasso_id      │
│   expiry_date   │    │   status        │
│   checksum      │    │   submitted_at  │
│   version       │    │   approved_at   │
│   created_at    │    │   approved_by   │
│   updated_at    │    │   comments      │
└─────────────────┘    │   created_at    │
                       │   updated_at    │
                       └─────────────────┘
                               │
                               │ N:1
                               ▼
                       ┌─────────────────┐
                       │   audit_logs    │
                       ├─────────────────┤
                       │ * id (UUID)     │
                       │   action        │
                       │   user_id       │
                       │   details       │
                       │   ip_address    │
                       │   created_at    │
                       └─────────────────┘
```

### 3.2 テーブル定義

#### 3.2.1 employees テーブル
```sql
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    scholarship_eligible BOOLEAN DEFAULT false,
    current_scholarship_amount INTEGER DEFAULT 0,
    max_support_amount INTEGER DEFAULT 0,
    bank_account TEXT,
    emergency_contact VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    gs_project_id UUID DEFAULT gen_random_uuid(),
    gs_table_name VARCHAR(50) DEFAULT 'employees',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_scholarship_eligible ON employees(scholarship_eligible);
CREATE INDEX idx_employees_status ON employees(status);
```

#### 3.2.2 applications テーブル
```sql
CREATE TABLE applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    scholarship_type VARCHAR(50) NOT NULL,
    monthly_amount INTEGER NOT NULL,
    total_amount INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    jasso_id VARCHAR(20),
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    comments TEXT,
    gs_project_id UUID DEFAULT gen_random_uuid(),
    gs_table_name VARCHAR(50) DEFAULT 'applications',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_applications_employee_id ON applications(employee_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_scholarship_type ON applications(scholarship_type);
CREATE INDEX idx_applications_application_number ON applications(application_number);
```

#### 3.2.3 documents テーブル
```sql
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID,
    verification_status VARCHAR(20) DEFAULT 'pending',
    expiry_date DATE,
    checksum VARCHAR(255),
    version INTEGER DEFAULT 1,
    gs_project_id UUID DEFAULT gen_random_uuid(),
    gs_table_name VARCHAR(50) DEFAULT 'documents',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_verification_status ON documents(verification_status);
```

#### 3.2.4 users テーブル
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    permissions TEXT[], -- 配列型で権限管理
    last_login TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    gs_project_id UUID DEFAULT gen_random_uuid(),
    gs_table_name VARCHAR(50) DEFAULT 'users',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### 3.2.5 audit_logs テーブル
```sql
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    details JSONB, -- JSON形式で詳細情報格納
    ip_address VARCHAR(45),
    gs_project_id UUID DEFAULT gen_random_uuid(),
    gs_table_name VARCHAR(50) DEFAULT 'audit_logs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3.3 データベースセキュリティ設計

#### 3.3.1 Row Level Security (RLS)
```sql
-- RLS有効化
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみアクセス可能
CREATE POLICY "認証済みユーザーのみアクセス" ON employees 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "認証済みユーザーのみアクセス" ON applications 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "認証済みユーザーのみアクセス" ON documents 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "認証済みユーザーのみアクセス" ON users 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "認証済みユーザーのみアクセス" ON audit_logs 
    FOR ALL TO authenticated USING (true);
```

---

## 🔌 4. API設計

### 4.1 REST API 設計

#### 4.1.1 APIエンドポイント一覧

| メソッド | エンドポイント | 説明 | 認証 |
|----------|----------------|------|------|
| GET | /api/v1/employees | 従業員一覧取得 | 必要 |
| GET | /api/v1/employees/{id} | 従業員詳細取得 | 必要 |
| POST | /api/v1/employees | 従業員作成 | 必要 |
| PUT | /api/v1/employees/{id} | 従業員更新 | 必要 |
| DELETE | /api/v1/employees/{id} | 従業員削除 | 必要 |
| GET | /api/v1/applications | 申請一覧取得 | 必要 |
| GET | /api/v1/applications/{id} | 申請詳細取得 | 必要 |
| POST | /api/v1/applications | 申請作成 | 必要 |
| PUT | /api/v1/applications/{id} | 申請更新 | 必要 |
| DELETE | /api/v1/applications/{id} | 申請削除 | 必要 |
| POST | /api/v1/applications/{id}/approve | 申請承認 | 必要 |
| POST | /api/v1/applications/{id}/reject | 申請却下 | 必要 |
| GET | /api/v1/documents | 文書一覧取得 | 必要 |
| POST | /api/v1/documents | 文書アップロード | 必要 |
| GET | /api/v1/documents/{id} | 文書ダウンロード | 必要 |
| DELETE | /api/v1/documents/{id} | 文書削除 | 必要 |
| GET | /api/v1/reports/dashboard | ダッシュボード統計 | 必要 |
| GET | /api/v1/reports/monthly | 月次レポート | 必要 |
| POST | /api/v1/jasso/submit | JASSO申請送信 | 必要 |
| GET | /api/v1/users | ユーザー一覧取得 | 管理者 |
| POST | /api/v1/users | ユーザー作成 | 管理者 |
| PUT | /api/v1/users/{id} | ユーザー更新 | 管理者 |

#### 4.1.2 APIレスポンス形式
```javascript
// 成功レスポンス
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-26T12:00:00Z"
  }
}

// エラーレスポンス
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値に誤りがあります",
    "details": [
      {
        "field": "email",
        "message": "正しいメールアドレスを入力してください"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-26T12:00:00Z",
    "request_id": "req_123456789"
  }
}
```

### 4.2 認証・認可設計

#### 4.2.1 JWT認証フロー
```javascript
// ログイン処理
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// レスポンス
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "hr_manager",
      "permissions": ["read", "write"]
    }
  }
}

// APIリクエスト時のヘッダー
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4.2.2 権限管理設計
```javascript
// ロール定義
const ROLES = {
  SYSTEM_ADMIN: {
    name: 'システム管理者',
    permissions: ['*'] // 全権限
  },
  HR_MANAGER: {
    name: '人事管理者',
    permissions: [
      'employees:read',
      'employees:write',
      'applications:read',
      'applications:write',
      'applications:approve',
      'documents:read',
      'documents:write',
      'reports:read'
    ]
  },
  HR_STAFF: {
    name: '人事担当者',
    permissions: [
      'employees:read',
      'employees:write',
      'applications:read',
      'applications:write',
      'documents:read',
      'documents:write'
    ]
  },
  APPROVER: {
    name: '承認者',
    permissions: [
      'employees:read',
      'applications:read',
      'applications:approve',
      'documents:read'
    ]
  },
  VIEWER: {
    name: '閲覧者',
    permissions: [
      'employees:read',
      'applications:read',
      'documents:read',
      'reports:read'
    ]
  }
};

// 権限チェック関数
function hasPermission(userRole, resource, action) {
  const role = ROLES[userRole];
  if (!role) return false;
  
  if (role.permissions.includes('*')) return true;
  
  const permission = `${resource}:${action}`;
  return role.permissions.includes(permission);
}
```

---

## ⚡ 5. パフォーマンス設計

### 5.1 フロントエンド最適化

#### 5.1.1 キャッシュ戦略
```javascript
// キャッシュ管理クラス
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5分
  }
  
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttlMap.set(key, Date.now() + ttl);
  }
  
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const ttl = this.ttlMap.get(key);
    if (Date.now() > ttl) {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }
  
  clear() {
    this.cache.clear();
    this.ttlMap.clear();
  }
}
```

#### 5.1.2 仮想スクロール実装
```javascript
// 大量データ表示用の仮想スクロール
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.data = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    
    this.init();
  }
  
  init() {
    this.container.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }
  
  setData(data) {
    this.data = data;
    this.render();
  }
  
  onScroll() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.min(
      this.visibleStart + Math.ceil(containerHeight / this.itemHeight) + 1,
      this.data.length
    );
    
    this.render();
  }
  
  render() {
    const visibleData = this.data.slice(this.visibleStart, this.visibleEnd);
    
    // 上部の空白
    const spacerTop = document.createElement('div');
    spacerTop.style.height = `${this.visibleStart * this.itemHeight}px`;
    
    // 表示アイテム
    const items = visibleData.map((item, index) => 
      this.renderItem(item, this.visibleStart + index)
    );
    
    // 下部の空白
    const spacerBottom = document.createElement('div');
    spacerBottom.style.height = `${(this.data.length - this.visibleEnd) * this.itemHeight}px`;
    
    // DOM更新
    this.container.innerHTML = '';
    this.container.appendChild(spacerTop);
    items.forEach(item => this.container.appendChild(item));
    this.container.appendChild(spacerBottom);
  }
}
```

### 5.2 データベース最適化

#### 5.2.1 クエリ最適化
```sql
-- よく使用されるクエリの最適化
-- 1. 従業員検索クエリ
EXPLAIN ANALYZE
SELECT e.*, COUNT(a.id) as application_count
FROM employees e
LEFT JOIN applications a ON e.id = a.employee_id
WHERE e.status = 'active'
  AND e.scholarship_eligible = true
  AND e.department ILIKE '%人事%'
GROUP BY e.id
ORDER BY e.created_at DESC
LIMIT 20 OFFSET 0;

-- 2. 申請状況集計クエリ
EXPLAIN ANALYZE
SELECT 
  status,
  COUNT(*) as count,
  SUM(monthly_amount) as total_amount
FROM applications
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY status;

-- 3. 月次レポート用クエリ
EXPLAIN ANALYZE
SELECT 
  DATE_TRUNC('month', a.created_at) as month,
  e.department,
  COUNT(a.id) as application_count,
  SUM(a.monthly_amount) as total_amount,
  AVG(a.monthly_amount) as avg_amount
FROM applications a
JOIN employees e ON a.employee_id = e.id
WHERE a.status = 'approved'
  AND a.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', a.created_at), e.department
ORDER BY month DESC, e.department;
```

#### 5.2.2 インデックス戦略
```sql
-- 複合インデックスの作成
CREATE INDEX idx_employees_status_eligible 
ON employees(status, scholarship_eligible);

CREATE INDEX idx_applications_status_created 
ON applications(status, created_at DESC);

CREATE INDEX idx_applications_employee_status 
ON applications(employee_id, status);

-- 部分インデックス（条件付きインデックス）
CREATE INDEX idx_active_employees 
ON employees(department, created_at) 
WHERE status = 'active';

CREATE INDEX idx_pending_applications 
ON applications(created_at DESC) 
WHERE status = 'pending';

-- 全文検索インデックス
CREATE INDEX idx_employees_fulltext 
ON employees 
USING gin(to_tsvector('japanese', full_name || ' ' || email || ' ' || department));
```

---

## 🔒 6. セキュリティ設計

### 6.1 認証セキュリティ

#### 6.1.1 パスワードポリシー
```javascript
// パスワード強度チェック
class PasswordPolicy {
  static validate(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('パスワードは8文字以上である必要があります');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('大文字を1文字以上含める必要があります');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('小文字を1文字以上含める必要があります');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('数字を1文字以上含める必要があります');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('記号を1文字以上含める必要があります');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: this.calculateStrength(password)
    };
  }
  
  static calculateStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}
```

#### 6.1.2 セッション管理
```javascript
// セッション管理クラス
class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30分
    this.maxSessions = 5; // 最大同時セッション数
    this.activeSessions = new Map();
  }
  
  createSession(userId, userAgent, ipAddress) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId: userId,
      userAgent: userAgent,
      ipAddress: ipAddress,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true
    };
    
    // 既存セッション数をチェック
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === userId && s.isActive);
    
    if (userSessions.length >= this.maxSessions) {
      // 最も古いセッションを無効化
      const oldestSession = userSessions.sort((a, b) => a.lastActivity - b.lastActivity)[0];
      this.invalidateSession(oldestSession.id);
    }
    
    this.activeSessions.set(sessionId, session);
    this.startSessionTimer(sessionId);
    
    return sessionId;
  }
  
  validateSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }
    
    // タイムアウトチェック
    if (Date.now() - session.lastActivity > this.sessionTimeout) {
      this.invalidateSession(sessionId);
      return null;
    }
    
    // 最終活動時刻を更新
    session.lastActivity = Date.now();
    
    return session;
  }
  
  invalidateSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      // 監査ログに記録
      this.logSessionEnd(session);
    }
  }
  
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }
  
  startSessionTimer(sessionId) {
    setTimeout(() => {
      const session = this.activeSessions.get(sessionId);
      if (session && Date.now() - session.lastActivity > this.sessionTimeout) {
        this.invalidateSession(sessionId);
      }
    }, this.sessionTimeout);
  }
  
  logSessionEnd(session) {
    // 監査ログへの記録処理
    console.log('Session ended:', {
      sessionId: session.id,
      userId: session.userId,
      duration: Date.now() - session.createdAt
    });
  }
}
```

### 6.2 データ保護

#### 6.2.1 入力値検証
```javascript
// 入力値検証クラス
class InputValidator {
  static validateEmployee(data) {
    const schema = {
      employee_id: {
        required: true,
        pattern: /^EMP-\d{6}$/,
        message: '従業員IDは「EMP-XXXXXX」の形式で入力してください'
      },
      full_name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[ぁ-んァ-ヶー一-龯\s]+$/,
        message: '氏名は日本語で入力してください'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '正しいメールアドレスを入力してください'
      },
      phone_number: {
        pattern: /^0\d{1,4}-\d{1,4}-\d{4}$/,
        message: '電話番号は「XXX-XXXX-XXXX」の形式で入力してください'
      },
      scholarship_amount: {
        type: 'number',
        min: 0,
        max: 100000,
        message: '奨学金額は0円以上100,000円以下で入力してください'
      }
    };
    
    return this.validate(data, schema);
  }
  
  static validate(data, schema) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // 必須チェック
      if (rules.required && this.isEmpty(value)) {
        errors.push({
          field: field,
          message: `${field}は必須項目です`,
          code: 'REQUIRED'
        });
        continue;
      }
      
      if (!this.isEmpty(value)) {
        // 型チェック
        if (rules.type && !this.validateType(value, rules.type)) {
          errors.push({
            field: field,
            message: rules.message || `${field}の形式が正しくありません`,
            code: 'TYPE_MISMATCH'
          });
        }
        
        // 長さチェック
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({
            field: field,
            message: `${field}は${rules.minLength}文字以上で入力してください`,
            code: 'MIN_LENGTH'
          });
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field: field,
            message: `${field}は${rules.maxLength}文字以内で入力してください`,
            code: 'MAX_LENGTH'
          });
        }
        
        // パターンチェック
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({
            field: field,
            message: rules.message || `${field}の形式が正しくありません`,
            code: 'PATTERN_MISMATCH'
          });
        }
        
        // 数値範囲チェック
        if (rules.type === 'number') {
          const numValue = Number(value);
          if (rules.min !== undefined && numValue < rules.min) {
            errors.push({
              field: field,
              message: `${field}は${rules.min}以上で入力してください`,
              code: 'MIN_VALUE'
            });
          }
          
          if (rules.max !== undefined && numValue > rules.max) {
            errors.push({
              field: field,
              message: `${field}は${rules.max}以下で入力してください`,
              code: 'MAX_VALUE'
            });
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static isEmpty(value) {
    return value === null || value === undefined || value === '';
  }
  
  static validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }
}
```

---

## 📱 7. 外部システム連携設計

### 7.1 JASSO API連携

#### 7.1.1 JASSO API仕様
```javascript
// JASSO API連携クラス
class JassoApiClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.companyCode = config.companyCode;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }
  
  // 申請データ送信
  async submitApplication(applicationData) {
    const payload = this.formatApplicationData(applicationData);
    
    const response = await this.makeRequest('POST', '/applications', payload);
    
    if (response.success) {
      return {
        success: true,
        jassoApplicationId: response.data.application_id,
        status: response.data.status
      };
    } else {
      throw new Error(`JASSO申請エラー: ${response.error.message}`);
    }
  }
  
  // 申請状況確認
  async getApplicationStatus(jassoApplicationId) {
    const response = await this.makeRequest('GET', `/applications/${jassoApplicationId}`);
    
    return {
      applicationId: jassoApplicationId,
      status: response.data.status,
      lastUpdated: response.data.updated_at,
      comments: response.data.comments
    };
  }
  
  // 月次報告送信
  async submitMonthlyReport(reportData) {
    const payload = this.formatMonthlyReport(reportData);
    
    const response = await this.makeRequest('POST', '/monthly-reports', payload);
    
    return {
      success: response.success,
      reportId: response.data.report_id,
      submittedAt: response.data.submitted_at
    };
  }
  
  // データフォーマット
  formatApplicationData(data) {
    return {
      company_code: this.companyCode,
      employee: {
        name: data.employee.full_name,
        employee_id: data.employee.employee_id,
        email: data.employee.email
      },
      scholarship: {
        type: data.scholarship_type,
        monthly_amount: data.monthly_amount,
        start_date: data.start_date,
        end_date: data.end_date,
        jasso_id: data.jasso_id
      },
      documents: data.documents.map(doc => ({
        type: doc.document_type,
        file_name: doc.document_name,
        checksum: doc.checksum
      }))
    };
  }
  
  formatMonthlyReport(data) {
    return {
      company_code: this.companyCode,
      report_period: data.period,
      summary: {
        total_employees: data.total_employees,
        total_amount: data.total_amount,
        new_applications: data.new_applications,
        terminated_applications: data.terminated_applications
      },
      details: data.details.map(detail => ({
        employee_id: detail.employee_id,
        jasso_id: detail.jasso_id,
        amount: detail.amount,
        status: detail.status
      }))
    };
  }
  
  // HTTP リクエスト実行
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Company-Code': this.companyCode
    };
    
    const config = {
      method: method,
      headers: headers,
      timeout: this.timeout
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.message}`);
      }
      
      return responseData;
    } catch (error) {
      throw new Error(`JASSO API通信エラー: ${error.message}`);
    }
  }
}
```

### 7.2 メール通知システム

#### 7.2.1 メール送信設計
```javascript
// メール通知クラス
class EmailNotificationService {
  constructor(config) {
    this.smtpConfig = config.smtp;
    this.templates = config.templates;
  }
  
  // 申請承認通知
  async sendApplicationApprovalNotification(application, employee) {
    const template = this.templates.applicationApproval;
    const subject = template.subject.replace('{{application_number}}', application.application_number);
    
    const body = template.body
      .replace('{{employee_name}}', employee.full_name)
      .replace('{{application_number}}', application.application_number)
      .replace('{{monthly_amount}}', application.monthly_amount.toLocaleString())
      .replace('{{start_date}}', application.start_date);
    
    await this.sendEmail({
      to: employee.email,
      subject: subject,
      body: body,
      type: 'application_approval'
    });
  }
  
  // 申請却下通知
  async sendApplicationRejectionNotification(application, employee, reason) {
    const template = this.templates.applicationRejection;
    const subject = template.subject.replace('{{application_number}}', application.application_number);
    
    const body = template.body
      .replace('{{employee_name}}', employee.full_name)
      .replace('{{application_number}}', application.application_number)
      .replace('{{reason}}', reason);
    
    await this.sendEmail({
      to: employee.email,
      subject: subject,
      body: body,
      type: 'application_rejection'
    });
  }
  
  // 期限通知
  async sendDeadlineReminder(documents) {
    for (const doc of documents) {
      const template = this.templates.deadlineReminder;
      const subject = template.subject.replace('{{document_type}}', doc.document_type);
      
      const body = template.body
        .replace('{{employee_name}}', doc.employee.full_name)
        .replace('{{document_type}}', doc.document_type)
        .replace('{{expiry_date}}', doc.expiry_date);
      
      await this.sendEmail({
        to: doc.employee.email,
        subject: subject,
        body: body,
        type: 'deadline_reminder'
      });
    }
  }
  
  // メール送信実行
  async sendEmail(emailData) {
    try {
      // 実際の実装では SMTP クライアントを使用
      console.log('メール送信:', emailData);
      
      // 送信ログを記録
      await this.logEmailSent(emailData);
      
      return {
        success: true,
        messageId: this.generateMessageId()
      };
    } catch (error) {
      console.error('メール送信エラー:', error);
      throw error;
    }
  }
  
  async logEmailSent(emailData) {
    // 監査ログにメール送信を記録
    if (window.auditLogger) {
      await window.auditLogger.log('EMAIL_SENT', {
        to: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        timestamp: Date.now()
      });
    }
  }
  
  generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  }
}
```

---

## 📝 8. 承認・変更管理

### 8.1 文書承認
| 承認レベル | 承認者 | 承認日 | 署名 |
|------------|--------|--------|------|
| 作成者 | 新規事業立ち上げチーム | 2025/01/26 | ✓ |
| レビュー者 | 技術責任者 | - | - |
| 承認者 | 松木一真（プロジェクトマネージャー） | - | - |

### 8.2 変更履歴
| バージョン | 変更日 | 変更者 | 変更内容 |
|------------|--------|--------|----------|
| 1.0.0 | 2025/01/26 | 新規事業立ち上げチーム | 初版作成 |

---

**🏗️ 本基本設計書は、要件定義書に基づいたシステムアーキテクチャの基本方針を定めたものである。**

**バージョン**: 1.0.0  
**最終更新**: 2025年1月26日  
**次回更新予定**: 詳細設計フェーズでの詳細化