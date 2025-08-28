# 🗄️ バックエンドデータベース構築ガイド

> **奨学金代理返還システム - 本番環境構築手順**

## 🎯 構築戦略

### **推奨アプローチ: Supabase + PostgreSQL**
```
理由:
✅ 最速構築（1-3日で本番運用開始）
✅ 最小コスト（月額0円から開始可能）
✅ エンタープライズ対応（セキュリティ・スケール）
✅ 自動API生成（開発工数削減）
✅ 認証システム内蔵（セキュリティ強化）
```

---

## 🚀 Phase 1: Supabase構築（推奨）

### **Step 1: アカウント作成・プロジェクト設定**

#### **1.1 Supabaseアカウント作成**
```
1. https://supabase.com にアクセス
2. "Start your project" をクリック
3. GitHub/Google アカウントでサインアップ
4. 新規プロジェクト作成: "scholarship-management-system"
5. リージョン選択: "Asia Pacific (Tokyo)" - 日本向け最適化
```

#### **1.2 基本設定**
```
プロジェクト名: 奨学金代理返還管理システム
データベース名: scholarship_db
組織名: [会社名]
料金プラン: Free（開始時）→ Pro（本格運用時）
```

### **Step 2: データベーススキーマ作成**

#### **2.1 テーブル作成SQL**
```sql
-- 従業員テーブル
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

-- 申請テーブル  
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

-- 文書テーブル
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

-- ユーザーテーブル
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

-- 監査ログテーブル
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
```

#### **2.2 インデックス作成（パフォーマンス最適化）**
```sql
-- 検索性能向上用インデックス
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_scholarship_eligible ON employees(scholarship_eligible);
CREATE INDEX idx_applications_employee_id ON applications(employee_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_scholarship_type ON applications(scholarship_type);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 全文検索用インデックス
CREATE INDEX idx_employees_search ON employees USING gin(to_tsvector('japanese', full_name || ' ' || email || ' ' || department));
CREATE INDEX idx_applications_search ON applications USING gin(to_tsvector('japanese', application_number || ' ' || scholarship_type));
```

#### **2.3 RLS（Row Level Security）設定**
```sql
-- セキュリティポリシー設定
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみアクセス可能
CREATE POLICY "認証済みユーザーのみアクセス" ON employees FOR ALL TO authenticated USING (true);
CREATE POLICY "認証済みユーザーのみアクセス" ON applications FOR ALL TO authenticated USING (true);
CREATE POLICY "認証済みユーザーのみアクセス" ON documents FOR ALL TO authenticated USING (true);
CREATE POLICY "認証済みユーザーのみアクセス" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "認証済みユーザーのみアクセス" ON audit_logs FOR ALL TO authenticated USING (true);
```

### **Step 3: 初期データ投入**

#### **3.1 サンプルデータ投入SQL**
```sql
-- 初期ユーザー作成
INSERT INTO users (username, full_name, email, role, department, permissions) VALUES
('admin', '松木一真', 'matsuki.kazuma@company.com', 'システム管理者', '新規事業部', ARRAY['read', 'write', 'admin']),
('hr_manager', '人事部長', 'hr.manager@company.com', '人事管理者', '人事部', ARRAY['read', 'write']);

-- サンプル従業員データ
INSERT INTO employees (employee_id, full_name, email, phone_number, department, position, hire_date, scholarship_eligible, current_scholarship_amount, max_support_amount, bank_account, emergency_contact, notes, status) VALUES
('EMP-202501-001', '山田太郎', 'yamada.taro@company.com', '03-1234-5678', '人事部', '主任', '2024-04-01', true, 30000, 50000, '三菱UFJ銀行 普通 1234567', '090-1234-5678', '第一種奨学金利用者', 'active'),
('EMP-202501-002', '佐藤花子', 'sato.hanako@company.com', '03-2345-6789', '営業部', '係長', '2023-10-01', true, 25000, 40000, 'みずほ銀行 普通 7890123', '090-2345-6789', '第二種奨学金利用者', 'active'),
('EMP-202501-003', '田中一郎', 'tanaka.ichiro@company.com', '03-3456-7890', '開発部', '主任', '2024-01-15', false, 0, 0, '', '090-3456-7890', '奨学金利用なし', 'active');
```

---

## 🔧 Phase 2: フロントエンド接続

### **Step 4: API接続設定**

#### **4.1 環境変数設定**
```javascript
// js/config.js（新規作成）
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anon_key: 'your-anon-key', // Supabaseダッシュボードから取得
    service_role_key: 'your-service-role-key' // 管理者用
};

// 本番環境では環境変数から取得
const getConfig = () => {
    return {
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL || SUPABASE_CONFIG.url,
        supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anon_key
    };
};
```

#### **4.2 Supabase クライアント初期化**
```javascript
// js/supabase-client.js（新規作成）
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 認証状態管理
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// 自動ログイン処理
export const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
};
```

#### **4.3 API クラス更新**
```javascript
// js/supabase-api.js（ScholarshipAPI の置き換え）
class SupabaseAPI {
    constructor() {
        this.supabase = supabase;
    }

    async list(tableName, params = {}) {
        const { page = 1, limit = 100, search, sort } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from(tableName)
            .select('*', { count: 'exact' });

        // 検索条件
        if (search) {
            switch (tableName) {
                case 'employees':
                    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
                    break;
                case 'applications':
                    query = query.or(`application_number.ilike.%${search}%,scholarship_type.ilike.%${search}%`);
                    break;
            }
        }

        // ソート
        if (sort) {
            query = query.order(sort);
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // ページネーション
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
            page: page,
            limit: limit,
            table: tableName
        };
    }

    async get(tableName, id) {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async create(tableName, itemData) {
        const { data, error } = await this.supabase
            .from(tableName)
            .insert([itemData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(tableName, id, updateData) {
        const { data, error } = await this.supabase
            .from(tableName)
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(tableName, id) {
        const { data, error } = await this.supabase
            .from(tableName)
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ダッシュボード統計
    async getDashboardStats() {
        const [employees, applications] = await Promise.all([
            this.list('employees', { limit: 1000 }),
            this.list('applications', { limit: 1000 })
        ]);

        const activeEmployees = employees.data.filter(emp => emp.status === 'active');
        const scholarshipEligible = activeEmployees.filter(emp => emp.scholarship_eligible);
        const pendingApplications = applications.data.filter(app => app.status === 'pending');
        const approvedApplications = applications.data.filter(app => app.status === 'approved');

        return {
            totalEmployees: activeEmployees.length,
            scholarshipEligible: scholarshipEligible.length,
            totalApplications: applications.data.length,
            pendingApplications: pendingApplications.length,
            approvedApplications: approvedApplications.length,
            totalMonthlySupport: scholarshipEligible.reduce((sum, emp) => sum + (emp.current_scholarship_amount || 0), 0)
        };
    }
}

// グローバルインスタンス作成
window.scholarshipAPI = new SupabaseAPI();
```

---

## 🛡️ Phase 3: セキュリティ・認証

### **Step 5: 認証システム実装**

#### **5.1 ログイン画面作成**
```html
<!-- login.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>奨学金管理システム - ログイン</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 class="text-2xl font-bold text-center mb-6">ログイン</h1>
        <form id="loginForm">
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">
                    メールアドレス
                </label>
                <input type="email" id="email" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2">
                    パスワード
                </label>
                <input type="password" id="password" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                ログイン
            </button>
        </form>
    </div>

    <script type="module">
        import { supabase, signInWithEmail } from './js/supabase-client.js';
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { data, error } = await signInWithEmail(email, password);
            
            if (error) {
                alert('ログインに失敗しました: ' + error.message);
            } else {
                // メインシステムにリダイレクト
                window.location.href = 'index.html';
            }
        });
    </script>
</body>
</html>
```

---

## 💰 Phase 4: 本番環境展開

### **Step 6: 本番環境設定**

#### **6.1 Supabase 本番設定**
```
料金プラン: Pro ($25/月)
データベース: Production
バックアップ: 自動日次バックアップ
監視: Supabase Analytics
ドメイン: カスタムドメイン設定
SSL: 自動SSL証明書
```

#### **6.2 セキュリティ強化**
```sql
-- API制限設定
ALTER DATABASE postgres SET row_security = on;

-- 接続制限
ALTER SYSTEM SET max_connections = '100';

-- ログ設定
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
```

---

## 📊 コスト・期間・工数

### **構築コスト**
```
初期設定: 無料
開発期間: 1-3日（Supabase） / 1-2週間（AWS）
月額運用: $0-25（スタートアップ） / $50-200（エンタープライズ）
保守工数: 月2-4時間（Supabase） / 月8-16時間（AWS）
```

### **スケールアップ計画**
```
Phase 1: 0-100社（Supabase Free/Pro）
Phase 2: 100-500社（Supabase Pro/Team）
Phase 3: 500社+（AWS移行検討）
```

---

## 🚀 実装優先順位

### **最優先（今週実装）**
1. Supabase アカウント作成・プロジェクト設定
2. 基本テーブル作成・サンプルデータ投入
3. フロントエンド接続テスト

### **次優先（来週実装）**
1. 認証システム実装
2. セキュリティ設定強化
3. 本番データ移行

### **継続実装（継続的）**
1. パフォーマンス監視・最適化
2. バックアップ・復旧テスト
3. セキュリティ監査・更新

---

## 📞 サポート・相談先

### **技術サポート**
- **Supabase**: 公式ドキュメント・コミュニティ
- **PostgreSQL**: 豊富な日本語情報・専門家多数
- **認証システム**: Supabase Auth（内蔵）

### **外部協力会社**
```
インフラ専門会社: クラウドエース、サーバーワークス等
セキュリティ監査: 各種セキュリティ会社
データベース設計: PostgreSQL専門コンサル
```

---

> **🎯 成功のポイント**  
> **Supabase を活用することで、最小コスト・最短期間で企業レベルのバックエンドを構築できます。**  
> 
> **松木さんの新規事業にとって、技術リスクを最小化しながら迅速に市場投入することが最重要です。**  
> **まずはSupabaseで開始し、事業拡大に応じてスケールアップすることを強く推奨します！**

**バージョン**: 1.0.0  
**最終更新**: 2025年1月26日  
**作成者**: 新規事業立ち上げチーム