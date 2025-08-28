# 詳細データベース設計・テーブル定義書
## 奨学金代理返済支援システム

**文書バージョン**: 1.0  
**作成日**: 2025-08-28  
**対象**: データベース設計者、バックエンド開発者、DBA

---

## 1. データベース設計概要

### 1.1 データベース基本方針

#### 採用技術
- **RDBMS**: PostgreSQL 15.x
- **文字コード**: UTF-8
- **照合順序**: ja_JP.UTF-8
- **タイムゾーン**: Asia/Tokyo

#### 設計原則
- **正規化**: 第3正規形までの正規化を基本
- **パフォーマンス**: 適切なインデックス設計
- **拡張性**: 将来の機能拡張を考慮した設計
- **整合性**: 外部キー制約による参照整合性
- **セキュリティ**: 個人情報の暗号化対応

### 1.2 物理設計仕様

#### データベース構成
```sql
-- データベース作成
CREATE DATABASE scholarship_payment_system
  ENCODING 'UTF8'
  LC_COLLATE 'ja_JP.UTF-8'
  LC_CTYPE 'ja_JP.UTF-8'
  TEMPLATE template0;

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID生成
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- 暗号化機能
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- 統計情報
```

#### スキーマ構成
```sql
-- アプリケーションスキーマ
CREATE SCHEMA app;           -- アプリケーションデータ
CREATE SCHEMA audit;         -- 監査ログ
CREATE SCHEMA batch;         -- バッチ処理用
CREATE SCHEMA reporting;     -- レポート用ビュー
```

---

## 2. ER図・テーブル関連図

### 2.1 論理ER図

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │   companies     │
│─────────────────│         │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ email           │         │ name            │
│ password_hash   │         │ registration_no │
│ name            │         │ address         │
│ role            │◆───────┐│ contact_info    │
│ created_at      │        ││ credit_rating   │
│ updated_at      │        ││ status          │
│ is_active       │        │└─────────────────┘
└─────────────────┘        │
                          │
        ┌─────────────────▼┐
        │  applications    │
        │──────────────────│
        │ id (PK)          │
        │ user_id (FK)     │
        │ company_id (FK)  │
        │ status           │
        │ loan_type        │
        │ monthly_amount   │
        │ total_amount     │
        │ loan_period      │
        │ start_date       │
        │ documents        │
        │ created_at       │
        │ updated_at       │
        └─────────┬────────┘
                 │
    ┌────────────▼────────────┐
    │  application_approvals  │
    │─────────────────────────│
    │ id (PK)                 │
    │ application_id (FK)     │
    │ approver_id (FK)        │
    │ status                  │
    │ comment                 │
    │ approved_at             │
    └─────────────────────────┘

┌─────────────────┐         ┌─────────────────┐
│ payment_schedules│◆────────│   payments      │
│─────────────────│         │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ application_id  │         │ schedule_id (FK)│
│ payment_date    │         │ amount          │
│ amount          │         │ status          │
│ status          │         │ jasso_txn_id    │
│ sequence_no     │         │ processed_at    │
└─────────────────┘         │ created_at      │
                           └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   audit_logs    │         │  notifications  │
│─────────────────│         │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ user_id (FK)    │         │ user_id (FK)    │
│ action          │         │ type            │
│ table_name      │         │ title           │
│ record_id       │         │ message         │
│ old_values      │         │ sent_at         │
│ new_values      │         │ read_at         │
│ created_at      │         │ created_at      │
└─────────────────┘         └─────────────────┘
```

---

## 3. テーブル定義

### 3.1 ユーザー管理テーブル

#### 3.1.1 users テーブル
```sql
CREATE TABLE app.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_kana VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin', 'operator', 'super_admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_users_email ON app.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON app.users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON app.users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON app.users(created_at);

-- コメント
COMMENT ON TABLE app.users IS 'ユーザー情報テーブル';
COMMENT ON COLUMN app.users.id IS 'ユーザーID（UUID）';
COMMENT ON COLUMN app.users.email IS 'メールアドレス（ログインID）';
COMMENT ON COLUMN app.users.password_hash IS 'パスワードハッシュ（bcrypt）';
COMMENT ON COLUMN app.users.name IS '氏名（漢字）';
COMMENT ON COLUMN app.users.name_kana IS '氏名（カナ）';
COMMENT ON COLUMN app.users.role IS 'ユーザーロール';
COMMENT ON COLUMN app.users.failed_login_attempts IS 'ログイン失敗回数';
COMMENT ON COLUMN app.users.locked_until IS 'アカウントロック解除時刻';
```

#### 3.1.2 user_profiles テーブル
```sql
CREATE TABLE app.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    student_id VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address_postal_code VARCHAR(10),
    address_prefecture VARCHAR(20),
    address_city VARCHAR(100),
    address_street VARCHAR(255),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE UNIQUE INDEX idx_user_profiles_user_id ON app.user_profiles(user_id);
CREATE INDEX idx_user_profiles_student_id ON app.user_profiles(student_id);

-- コメント
COMMENT ON TABLE app.user_profiles IS 'ユーザー詳細プロフィール';
COMMENT ON COLUMN app.user_profiles.student_id IS '学生番号';
COMMENT ON COLUMN app.user_profiles.birth_date IS '生年月日';
COMMENT ON COLUMN app.user_profiles.address_postal_code IS '郵便番号（暗号化対象）';
```

### 3.2 企業管理テーブル

#### 3.2.1 companies テーブル
```sql
CREATE TABLE app.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    name_kana VARCHAR(200),
    registration_number VARCHAR(20) UNIQUE,
    address_postal_code VARCHAR(10),
    address_prefecture VARCHAR(20),
    address_city VARCHAR(100),
    address_street VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url VARCHAR(500),
    established_date DATE,
    capital_amount DECIMAL(15,0),
    employee_count INTEGER,
    business_type VARCHAR(100),
    credit_rating VARCHAR(10) CHECK (credit_rating IN ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D')),
    contract_start_date DATE,
    contract_end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_companies_code ON app.companies(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_name ON app.companies(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_status ON app.companies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_credit_rating ON app.companies(credit_rating);

-- コメント
COMMENT ON TABLE app.companies IS '企業情報テーブル';
COMMENT ON COLUMN app.companies.code IS '企業コード（システム内識別子）';
COMMENT ON COLUMN app.companies.registration_number IS '法人番号';
COMMENT ON COLUMN app.companies.credit_rating IS '信用格付け';
```

### 3.3 申請管理テーブル

#### 3.3.1 applications テーブル
```sql
CREATE TABLE app.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES app.users(id),
    company_id UUID NOT NULL REFERENCES app.companies(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'completed')
    ),
    loan_type VARCHAR(50) NOT NULL CHECK (
        loan_type IN ('type1', 'type2', 'combined', 'graduate_school')
    ),
    loan_organization VARCHAR(100) NOT NULL DEFAULT 'JASSO',
    monthly_payment_amount DECIMAL(10,0) NOT NULL CHECK (monthly_payment_amount > 0),
    total_loan_amount DECIMAL(12,0) NOT NULL CHECK (total_loan_amount > 0),
    remaining_amount DECIMAL(12,0) NOT NULL,
    loan_period_months INTEGER NOT NULL CHECK (loan_period_months > 0),
    payment_start_date DATE NOT NULL,
    employment_type VARCHAR(20) NOT NULL CHECK (
        employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'offer')
    ),
    employment_start_date DATE NOT NULL,
    annual_salary DECIMAL(10,0),
    special_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- 制約
    CONSTRAINT chk_remaining_amount CHECK (remaining_amount <= total_loan_amount),
    CONSTRAINT chk_payment_start_date CHECK (payment_start_date >= employment_start_date)
);

-- インデックス
CREATE INDEX idx_applications_number ON app.applications(application_number);
CREATE INDEX idx_applications_user_id ON app.applications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_company_id ON app.applications(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_status ON app.applications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_submitted_at ON app.applications(submitted_at);
CREATE INDEX idx_applications_payment_start_date ON app.applications(payment_start_date);

-- コメント
COMMENT ON TABLE app.applications IS '奨学金返済代理申請テーブル';
COMMENT ON COLUMN app.applications.application_number IS '申請番号（A + 連番）';
COMMENT ON COLUMN app.applications.loan_type IS '奨学金種別';
COMMENT ON COLUMN app.applications.remaining_amount IS '残債額';
```

#### 3.3.2 application_documents テーブル
```sql
CREATE TABLE app.application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES app.applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (
        document_type IN ('student_id', 'employment_contract', 'loan_certificate', 'transcript', 'other')
    ),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES app.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (
        status IN ('uploaded', 'verified', 'rejected', 'expired')
    ),
    rejection_reason TEXT
);

-- インデックス
CREATE INDEX idx_application_documents_application_id ON app.application_documents(application_id);
CREATE INDEX idx_application_documents_type ON app.application_documents(document_type);
CREATE INDEX idx_application_documents_status ON app.application_documents(status);

-- コメント
COMMENT ON TABLE app.application_documents IS '申請添付書類テーブル';
COMMENT ON COLUMN app.application_documents.file_hash IS 'ファイルハッシュ（SHA-256）';
```

#### 3.3.3 application_approvals テーブル
```sql
CREATE TABLE app.application_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES app.applications(id),
    approver_id UUID NOT NULL REFERENCES app.users(id),
    approval_level INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('pending', 'approved', 'rejected', 'cancelled')
    ),
    comment TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_application_approvals_application_id ON app.application_approvals(application_id);
CREATE INDEX idx_application_approvals_approver_id ON app.application_approvals(approver_id);
CREATE INDEX idx_application_approvals_status ON app.application_approvals(status);

-- コメント
COMMENT ON TABLE app.application_approvals IS '申請承認履歴テーブル';
COMMENT ON COLUMN app.application_approvals.approval_level IS '承認レベル（1:一次、2:二次）';
```

### 3.4 支払管理テーブル

#### 3.4.1 payment_schedules テーブル
```sql
CREATE TABLE app.payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES app.applications(id),
    payment_number INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    amount DECIMAL(10,0) NOT NULL CHECK (amount > 0),
    principal_amount DECIMAL(10,0) NOT NULL CHECK (principal_amount >= 0),
    interest_amount DECIMAL(10,0) NOT NULL CHECK (interest_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'processing', 'completed', 'failed', 'cancelled', 'skipped')
    ),
    due_date DATE NOT NULL,
    grace_period_days INTEGER NOT NULL DEFAULT 0,
    late_fee DECIMAL(8,0) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約
    CONSTRAINT chk_payment_amounts CHECK (principal_amount + interest_amount = amount),
    CONSTRAINT chk_due_date CHECK (due_date >= scheduled_date)
);

-- インデックス
CREATE UNIQUE INDEX idx_payment_schedules_app_number ON app.payment_schedules(application_id, payment_number);
CREATE INDEX idx_payment_schedules_scheduled_date ON app.payment_schedules(scheduled_date);
CREATE INDEX idx_payment_schedules_due_date ON app.payment_schedules(due_date);
CREATE INDEX idx_payment_schedules_status ON app.payment_schedules(status);

-- コメント
COMMENT ON TABLE app.payment_schedules IS '支払スケジュールテーブル';
COMMENT ON COLUMN app.payment_schedules.payment_number IS '支払回数（1回目、2回目...）';
COMMENT ON COLUMN app.payment_schedules.grace_period_days IS '支払猶予期間（日数）';
```

#### 3.4.2 payments テーブル
```sql
CREATE TABLE app.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(20) NOT NULL UNIQUE,
    schedule_id UUID NOT NULL REFERENCES app.payment_schedules(id),
    amount DECIMAL(10,0) NOT NULL CHECK (amount > 0),
    transaction_fee DECIMAL(6,0) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,0) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')
    ),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'bank_transfer' CHECK (
        payment_method IN ('bank_transfer', 'credit_card', 'debit', 'other')
    ),
    jasso_transaction_id VARCHAR(50),
    bank_transaction_id VARCHAR(50),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retry_count INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 制約
    CONSTRAINT chk_total_amount CHECK (total_amount = amount + transaction_fee)
);

-- インデックス
CREATE INDEX idx_payments_number ON app.payments(payment_number);
CREATE INDEX idx_payments_schedule_id ON app.payments(schedule_id);
CREATE INDEX idx_payments_status ON app.payments(status);
CREATE INDEX idx_payments_processed_at ON app.payments(processed_at);
CREATE INDEX idx_payments_jasso_txn_id ON app.payments(jasso_transaction_id);

-- コメント
COMMENT ON TABLE app.payments IS '支払実行履歴テーブル';
COMMENT ON COLUMN app.payments.payment_number IS '支払番号（P + 連番）';
COMMENT ON COLUMN app.payments.jasso_transaction_id IS 'JASSO側トランザクションID';
```

### 3.5 監査・システム管理テーブル

#### 3.5.1 audit_logs テーブル
```sql
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app.users(id),
    session_id VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_url TEXT,
    request_method VARCHAR(10),
    response_status INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- パーティショニング設定（月次）
CREATE TABLE audit.audit_logs_y2025m01 PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- インデックス
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit.audit_logs(ip_address);

-- コメント
COMMENT ON TABLE audit.audit_logs IS '監査ログテーブル';
COMMENT ON COLUMN audit.audit_logs.execution_time_ms IS '処理時間（ミリ秒）';
```

#### 3.5.2 system_settings テーブル
```sql
CREATE TABLE app.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL CHECK (
        data_type IN ('string', 'integer', 'decimal', 'boolean', 'json', 'encrypted')
    ),
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    is_required BOOLEAN NOT NULL DEFAULT false,
    validation_rule TEXT,
    updated_by UUID NOT NULL REFERENCES app.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 複合ユニーク制約
    UNIQUE(category, key)
);

-- インデックス
CREATE INDEX idx_system_settings_category ON app.system_settings(category);

-- コメント
COMMENT ON TABLE app.system_settings IS 'システム設定テーブル';
COMMENT ON COLUMN app.system_settings.validation_rule IS 'バリデーションルール（正規表現等）';
```

#### 3.5.3 notifications テーブル
```sql
CREATE TABLE app.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app.users(id),
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('email', 'sms', 'push', 'system')
    ),
    channel VARCHAR(50) NOT NULL CHECK (
        channel IN ('application', 'payment', 'system', 'marketing')
    ),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    template_name VARCHAR(100),
    template_variables JSONB,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')
    ),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retry_count INTEGER NOT NULL DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_notifications_user_id ON app.notifications(user_id);
CREATE INDEX idx_notifications_type ON app.notifications(type);
CREATE INDEX idx_notifications_status ON app.notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON app.notifications(scheduled_at);
CREATE INDEX idx_notifications_created_at ON app.notifications(created_at);

-- コメント
COMMENT ON TABLE app.notifications IS '通知管理テーブル';
COMMENT ON COLUMN app.notifications.template_variables IS 'テンプレート変数（JSON形式）';
```

---

## 4. ビュー定義

### 4.1 レポート用ビュー

#### 4.1.1 v_application_summary ビュー
```sql
CREATE VIEW reporting.v_application_summary AS
SELECT 
    a.id,
    a.application_number,
    u.name AS applicant_name,
    u.email AS applicant_email,
    c.name AS company_name,
    c.code AS company_code,
    a.status,
    a.loan_type,
    a.monthly_payment_amount,
    a.total_loan_amount,
    a.remaining_amount,
    a.payment_start_date,
    a.submitted_at,
    a.approved_at,
    a.created_at,
    -- 支払状況
    COALESCE(ps.total_scheduled, 0) AS total_scheduled_payments,
    COALESCE(ps.completed_payments, 0) AS completed_payments,
    COALESCE(ps.total_paid_amount, 0) AS total_paid_amount,
    -- 承認者情報
    aa.approver_name,
    aa.approved_date
FROM app.applications a
INNER JOIN app.users u ON a.user_id = u.id
INNER JOIN app.companies c ON a.company_id = c.id
LEFT JOIN (
    SELECT 
        ps.application_id,
        COUNT(*) AS total_scheduled,
        COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) AS completed_payments,
        SUM(CASE WHEN ps.status = 'completed' THEN ps.amount ELSE 0 END) AS total_paid_amount
    FROM app.payment_schedules ps
    GROUP BY ps.application_id
) ps ON a.id = ps.application_id
LEFT JOIN (
    SELECT 
        aa.application_id,
        u.name AS approver_name,
        aa.approved_at AS approved_date,
        ROW_NUMBER() OVER (PARTITION BY aa.application_id ORDER BY aa.approved_at DESC) AS rn
    FROM app.application_approvals aa
    INNER JOIN app.users u ON aa.approver_id = u.id
    WHERE aa.status = 'approved'
) aa ON a.id = aa.application_id AND aa.rn = 1
WHERE a.deleted_at IS NULL;

-- コメント
COMMENT ON VIEW reporting.v_application_summary IS '申請サマリービュー（レポート用）';
```

#### 4.1.2 v_payment_status ビュー
```sql
CREATE VIEW reporting.v_payment_status AS
SELECT 
    ps.id,
    a.application_number,
    u.name AS applicant_name,
    c.name AS company_name,
    ps.payment_number,
    ps.scheduled_date,
    ps.due_date,
    ps.amount,
    ps.status AS schedule_status,
    p.payment_number AS payment_ref,
    p.status AS payment_status,
    p.processed_at,
    p.completed_at,
    p.jasso_transaction_id,
    -- 遅延計算
    CASE 
        WHEN ps.status = 'completed' THEN 0
        WHEN CURRENT_DATE > ps.due_date THEN CURRENT_DATE - ps.due_date
        ELSE 0
    END AS days_overdue,
    -- ステータス判定
    CASE 
        WHEN ps.status = 'completed' THEN '完了'
        WHEN CURRENT_DATE > ps.due_date THEN '延滞'
        WHEN CURRENT_DATE > ps.scheduled_date THEN '期限内'
        ELSE '予定'
    END AS status_label
FROM app.payment_schedules ps
INNER JOIN app.applications a ON ps.application_id = a.id
INNER JOIN app.users u ON a.user_id = u.id
INNER JOIN app.companies c ON a.company_id = c.id
LEFT JOIN app.payments p ON ps.id = p.schedule_id AND p.status = 'completed'
WHERE a.deleted_at IS NULL;

-- コメント
COMMENT ON VIEW reporting.v_payment_status IS '支払状況ビュー（レポート用）';
```

---

## 5. インデックス設計

### 5.1 パフォーマンス最適化インデックス

```sql
-- 複合インデックス（よく使用される検索条件）
CREATE INDEX idx_applications_status_created ON app.applications(status, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_applications_company_status ON app.applications(company_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_payment_schedules_date_status ON app.payment_schedules(scheduled_date, status);

-- 部分インデックス（特定条件のみ）
CREATE INDEX idx_users_active_email ON app.users(email) 
WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX idx_notifications_pending ON app.notifications(scheduled_at) 
WHERE status = 'pending';

-- 関数インデックス（検索機能用）
CREATE INDEX idx_users_name_lower ON app.users(LOWER(name)) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_companies_name_trigram ON app.companies 
USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL;
```

### 5.2 統計情報・実行計画最適化

```sql
-- 統計情報の更新頻度設定
ALTER TABLE app.applications SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE app.payments SET (autovacuum_analyze_scale_factor = 0.05);

-- よく使用されるクエリの実行計画キャッシュ
PREPARE get_user_applications AS
SELECT * FROM reporting.v_application_summary 
WHERE applicant_email = $1 AND status = $2 
ORDER BY created_at DESC;
```

---

## 6. ストアドプロシージャ・関数

### 6.1 業務ロジック関数

#### 6.1.1 申請番号生成関数
```sql
CREATE OR REPLACE FUNCTION app.generate_application_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    current_year INTEGER;
    sequence_num INTEGER;
    application_number VARCHAR(20);
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- 当年の最大連番を取得
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(application_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM app.applications
    WHERE application_number LIKE 'A' || current_year || '%';
    
    -- 申請番号生成（例：A2025001）
    application_number := 'A' || current_year || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN application_number;
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON FUNCTION app.generate_application_number() IS '申請番号生成関数（A + 年 + 連番）';
```

#### 6.1.2 支払スケジュール生成関数
```sql
CREATE OR REPLACE FUNCTION app.generate_payment_schedule(
    p_application_id UUID,
    p_start_date DATE,
    p_monthly_amount DECIMAL,
    p_total_amount DECIMAL,
    p_period_months INTEGER
)
RETURNS VOID AS $$
DECLARE
    current_date DATE;
    payment_count INTEGER;
    remaining_amount DECIMAL;
    monthly_payment DECIMAL;
    final_payment DECIMAL;
BEGIN
    current_date := p_start_date;
    remaining_amount := p_total_amount;
    monthly_payment := p_monthly_amount;
    
    -- 最終回の調整額計算
    final_payment := remaining_amount - (monthly_payment * (p_period_months - 1));
    
    FOR payment_count IN 1..p_period_months LOOP
        -- 最終回は調整額を使用
        IF payment_count = p_period_months THEN
            monthly_payment := final_payment;
        END IF;
        
        INSERT INTO app.payment_schedules (
            application_id,
            payment_number,
            scheduled_date,
            due_date,
            amount,
            principal_amount,
            interest_amount,
            status
        ) VALUES (
            p_application_id,
            payment_count,
            current_date,
            current_date + INTERVAL '10 days', -- 10日間の支払猶予
            monthly_payment,
            monthly_payment * 0.9, -- 仮の元金割合90%
            monthly_payment * 0.1, -- 仮の利息割合10%
            'scheduled'
        );
        
        -- 次月の支払日を計算
        current_date := current_date + INTERVAL '1 month';
        remaining_amount := remaining_amount - monthly_payment;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON FUNCTION app.generate_payment_schedule IS '支払スケジュール自動生成関数';
```

### 6.2 トリガー関数

#### 6.2.1 更新日時自動設定トリガー
```sql
CREATE OR REPLACE FUNCTION app.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガー設定
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER tr_applications_updated_at
    BEFORE UPDATE ON app.applications
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER tr_companies_updated_at
    BEFORE UPDATE ON app.companies
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();
```

#### 6.2.2 監査ログ記録トリガー
```sql
CREATE OR REPLACE FUNCTION audit.log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values
        ) VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            to_jsonb(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        ) VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            new_values
        ) VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            'INSERT',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 監査対象テーブルにトリガー設定
CREATE TRIGGER tr_users_audit
    AFTER INSERT OR UPDATE OR DELETE ON app.users
    FOR EACH ROW EXECUTE FUNCTION audit.log_data_changes();

CREATE TRIGGER tr_applications_audit
    AFTER INSERT OR UPDATE OR DELETE ON app.applications
    FOR EACH ROW EXECUTE FUNCTION audit.log_data_changes();
```

---

## 7. セキュリティ設計

### 7.1 ロール・権限設定

```sql
-- アプリケーションユーザーロール作成
CREATE ROLE app_readonly LOGIN PASSWORD 'readonly_password_here';
CREATE ROLE app_readwrite LOGIN PASSWORD 'readwrite_password_here';
CREATE ROLE app_admin LOGIN PASSWORD 'admin_password_here';

-- スキーマ権限設定
GRANT USAGE ON SCHEMA app TO app_readonly;
GRANT USAGE ON SCHEMA reporting TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO app_readonly;

GRANT USAGE ON SCHEMA app TO app_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_readwrite;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO app_readwrite;

GRANT ALL PRIVILEGES ON SCHEMA app TO app_admin;
GRANT ALL PRIVILEGES ON SCHEMA audit TO app_admin;
GRANT ALL PRIVILEGES ON SCHEMA batch TO app_admin;
GRANT ALL PRIVILEGES ON SCHEMA reporting TO app_admin;
```

### 7.2 行レベルセキュリティ（RLS）

```sql
-- 行レベルセキュリティ有効化
ALTER TABLE app.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.payments ENABLE ROW LEVEL SECURITY;

-- 学生は自分の申請のみ閲覧可能
CREATE POLICY student_applications_policy ON app.applications
    FOR ALL TO app_readwrite
    USING (
        user_id = COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000')
        AND EXISTS (
            SELECT 1 FROM app.users 
            WHERE id = COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000')
            AND role = 'student'
        )
    );

-- 管理者は全データ閲覧可能
CREATE POLICY admin_full_access_policy ON app.applications
    FOR ALL TO app_readwrite
    USING (
        EXISTS (
            SELECT 1 FROM app.users 
            WHERE id = COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000')
            AND role IN ('admin', 'super_admin')
        )
    );
```

### 7.3 データ暗号化

```sql
-- 暗号化関数
CREATE OR REPLACE FUNCTION app.encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(
            data, 
            current_setting('app.encryption_key')
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 復号化関数
CREATE OR REPLACE FUNCTION app.decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted_data, 'base64'),
        current_setting('app.encryption_key')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 暗号化対象カラムの更新
ALTER TABLE app.user_profiles 
ADD COLUMN address_postal_code_encrypted TEXT;

-- 暗号化トリガー
CREATE OR REPLACE FUNCTION app.encrypt_user_profile_data()
RETURNS TRIGGER AS $$
BEGIN
    NEW.address_postal_code_encrypted = app.encrypt_pii(NEW.address_postal_code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_user_profiles_encrypt
    BEFORE INSERT OR UPDATE ON app.user_profiles
    FOR EACH ROW EXECUTE FUNCTION app.encrypt_user_profile_data();
```

---

## 8. パフォーマンスチューニング

### 8.1 パーティショニング設定

```sql
-- 監査ログテーブルの月次パーティショニング
CREATE TABLE audit.audit_logs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 過去・現在・未来のパーティション作成
CREATE TABLE audit.audit_logs_y2024m12 PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
    
CREATE TABLE audit.audit_logs_y2025m01 PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
    
CREATE TABLE audit.audit_logs_y2025m02 PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 自動パーティション作成用関数
CREATE OR REPLACE FUNCTION audit.create_monthly_partition(target_date DATE)
RETURNS VOID AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    start_date := DATE_TRUNC('month', target_date);
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'audit_logs_y' || EXTRACT(YEAR FROM start_date) || 'm' || LPAD(EXTRACT(MONTH FROM start_date)::TEXT, 2, '0');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS audit.%I PARTITION OF audit.audit_logs FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### 8.2 接続プール・キャッシュ設定

```sql
-- 接続プール設定推奨値
-- postgresql.conf
-- max_connections = 200
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100

-- よく使用されるクエリの準備済みステートメント
PREPARE get_user_by_email AS
SELECT id, name, role, status FROM app.users WHERE email = $1 AND deleted_at IS NULL;

PREPARE get_application_details AS
SELECT * FROM reporting.v_application_summary WHERE id = $1;

PREPARE get_pending_payments AS
SELECT * FROM reporting.v_payment_status 
WHERE schedule_status = 'scheduled' AND scheduled_date <= $1
ORDER BY scheduled_date;
```

---

## 9. バックアップ・復旧設計

### 9.1 バックアップ戦略

```sql
-- バックアップ用ロール
CREATE ROLE backup_user LOGIN PASSWORD 'backup_password_here';
GRANT SELECT ON ALL TABLES IN SCHEMA app TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO backup_user;

-- バックアップスクリプト例
-- フルバックアップ（日次）
-- pg_dump -h localhost -U backup_user -d scholarship_payment_system -f backup_full_$(date +%Y%m%d).sql

-- スキーマのみバックアップ
-- pg_dump -h localhost -U backup_user -d scholarship_payment_system -s -f schema_backup.sql

-- 特定テーブルバックアップ
-- pg_dump -h localhost -U backup_user -d scholarship_payment_system -t app.applications -f applications_backup.sql
```

### 9.2 災害復旧手順

```sql
-- Point-in-Time Recovery用設定
-- postgresql.conf
-- archive_mode = on
-- archive_command = 'cp %p /var/lib/postgresql/archive/%f'
-- wal_level = replica
-- max_wal_senders = 3

-- 復旧用SQLの例
-- 特定時点への復旧
-- pg_ctl stop
-- rm -rf /var/lib/postgresql/data/*
-- pg_basebackup -D /var/lib/postgresql/data -R
-- echo "recovery_target_time = '2025-01-15 12:00:00 JST'" >> /var/lib/postgresql/data/recovery.conf
-- pg_ctl start
```

---

このデータベース設計書により、開発チームは堅牢で拡張性のあるデータベースシステムを構築し、適切なパフォーマンスとセキュリティを確保することができます。次に、開発工程の成果物作成に進みます。