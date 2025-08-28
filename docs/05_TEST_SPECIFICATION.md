# テスト項目書
## 奨学金代理返済支援システム

**文書バージョン**: 1.0  
**作成日**: 2025-08-28  
**対象**: QAエンジニア、開発チーム、システム管理者

---

## 1. テスト概要

### 1.1 テスト目的

本テスト項目書は、奨学金代理返済支援システムの品質保証を目的とし、以下の観点からシステムの動作を検証する：

- **機能テスト**: 要件定義書に定められた機能が正しく動作すること
- **非機能テスト**: パフォーマンス、セキュリティ、ユーザビリティの要件を満たすこと
- **統合テスト**: システム間連携が正常に動作すること
- **回帰テスト**: 既存機能に影響を与えないこと

### 1.2 テスト方針

#### 1.2.1 テストレベル
1. **単体テスト (Unit Test)**: 個別のコンポーネント、関数の動作検証
2. **統合テスト (Integration Test)**: コンポーネント間の連携検証
3. **システムテスト (System Test)**: システム全体の動作検証
4. **受入テスト (Acceptance Test)**: ビジネス要件の充足確認

#### 1.2.2 テスト手法
- **自動テスト**: 単体テスト、APIテスト、E2Eテスト
- **手動テスト**: UI/UXテスト、ユーザビリティテスト
- **探索的テスト**: 異常系、境界値の検証

#### 1.2.3 テスト環境
- **開発環境**: 開発者による単体テスト
- **テスト環境**: QAによる結合・システムテスト
- **ステージング環境**: 本番環境相当での受入テスト

### 1.3 テスト完了基準

以下の条件をすべて満たした場合にテスト完了とする：

1. **機能テスト**: 全機能要件の95%以上が正常動作
2. **セキュリティテスト**: 重大な脆弱性が0件
3. **パフォーマンステスト**: 応答時間・スループット要件を充足
4. **ユーザビリティテスト**: SUS（System Usability Scale）スコア70点以上
5. **回帰テスト**: 既存機能の正常動作確認

---

## 2. 機能テスト項目

### 2.1 認証・認可機能

#### T-AUTH-001: ログイン機能
**テスト目的**: ユーザーがシステムに正常にログインできることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-AUTH-001-01 | 正常ログイン | 有効なユーザーアカウントが存在 | 1. ログイン画面を表示<br>2. 正しいメールアドレスとパスワードを入力<br>3. ログインボタンクリック | ダッシュボードにリダイレクト | 高 |
| T-AUTH-001-02 | 無効なメールアドレス | - | 1. ログイン画面を表示<br>2. 存在しないメールアドレスを入力<br>3. 正しいパスワードを入力<br>4. ログインボタンクリック | エラーメッセージ表示「メールアドレスまたはパスワードが間違っています」 | 高 |
| T-AUTH-001-03 | 無効なパスワード | 有効なユーザーアカウントが存在 | 1. ログイン画面を表示<br>2. 正しいメールアドレスを入力<br>3. 間違ったパスワードを入力<br>4. ログインボタンクリック | エラーメッセージ表示「メールアドレスまたはパスワードが間違っています」 | 高 |
| T-AUTH-001-04 | 空欄入力 | - | 1. ログイン画面を表示<br>2. メールアドレス・パスワードを空欄のまま<br>3. ログインボタンクリック | バリデーションエラーメッセージ表示 | 中 |
| T-AUTH-001-05 | アカウントロック | 連続ログイン失敗履歴あり | 1. 同一アカウントで5回連続失敗<br>2. 6回目のログイン試行 | アカウントロック警告表示 | 高 |

#### T-AUTH-002: ログアウト機能
**テスト目的**: ユーザーが安全にログアウトできることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-AUTH-002-01 | 正常ログアウト | ログイン済み | 1. ヘッダーのユーザーメニューをクリック<br>2. ログアウトボタンクリック<br>3. 確認ダイアログでOKクリック | ログイン画面にリダイレクト、セッション削除 | 高 |
| T-AUTH-002-02 | セッションタイムアウト | ログイン後30分経過 | 1. 30分何も操作しない<br>2. 任意のページにアクセス | 自動ログアウト、タイムアウト警告表示 | 中 |

#### T-AUTH-003: パスワード変更機能
**テスト目的**: ユーザーがパスワードを安全に変更できることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-AUTH-003-01 | 正常パスワード変更 | ログイン済み | 1. プロフィール画面を表示<br>2. パスワード変更ボタンクリック<br>3. 現在のパスワード入力<br>4. 新しいパスワード入力<br>5. 確認パスワード入力<br>6. 変更ボタンクリック | 成功メッセージ表示、監査ログ記録 | 高 |
| T-AUTH-003-02 | 現在パスワード不一致 | ログイン済み | 現在のパスワードに間違った値を入力して実行 | エラーメッセージ表示「現在のパスワードが間違っています」 | 高 |
| T-AUTH-003-03 | 弱いパスワード | ログイン済み | 1. パスワード変更画面を表示<br>2. セキュリティ要件を満たさないパスワードを入力 | バリデーションエラー表示、強度インジケーター表示 | 中 |

### 2.2 申請管理機能

#### T-APP-001: 申請登録機能
**テスト目的**: 奨学金返済代理申請を正常に登録できることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-APP-001-01 | 正常申請登録 | 学生がログイン済み | 1. 申請フォーム画面を表示<br>2. 必須項目をすべて正しく入力<br>3. 必要書類をアップロード<br>4. 申請ボタンクリック | 申請ID発行、確認メール送信、ステータス「審査待ち」 | 高 |
| T-APP-001-02 | 必須項目未入力 | 学生がログイン済み | 1. 申請フォーム画面を表示<br>2. 必須項目を空欄で申請ボタンクリック | バリデーションエラー表示、申請不可 | 高 |
| T-APP-001-03 | 重複申請チェック | 学生が既に申請済み | 1. 申請フォーム画面を表示<br>2. 全項目入力して申請ボタンクリック | 重複申請エラー表示、申請不可 | 中 |
| T-APP-001-04 | ファイルサイズ制限 | 学生がログイン済み | 1. 申請フォーム画面を表示<br>2. 10MB超過ファイルをアップロード | ファイルサイズエラー表示、アップロード不可 | 中 |
| T-APP-001-05 | 不正ファイル形式 | 学生がログイン済み | 1. 申請フォーム画面を表示<br>2. 許可されない形式のファイルをアップロード | ファイル形式エラー表示、アップロード不可 | 中 |

#### T-APP-002: 申請一覧表示機能
**テスト目的**: 申請一覧が正常に表示されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-APP-002-01 | 全申請表示 | 複数の申請データが存在 | 1. 申請一覧画面を表示 | 全申請データが時系列順で表示 | 高 |
| T-APP-002-02 | ステータス別フィルタ | 異なるステータスの申請が存在 | 1. 申請一覧画面を表示<br>2. ステータスフィルタで「承認済み」を選択 | 承認済みの申請のみ表示 | 中 |
| T-APP-002-03 | 検索機能 | 複数の申請データが存在 | 1. 申請一覧画面を表示<br>2. 検索ボックスに申請者名を入力 | 該当する申請のみ表示 | 中 |
| T-APP-002-04 | ページング機能 | 100件以上の申請データが存在 | 1. 申請一覧画面を表示<br>2. 次ページボタンクリック | 次の10件が表示、ページ番号更新 | 低 |
| T-APP-002-05 | ソート機能 | 複数の申請データが存在 | 1. 申請一覧画面を表示<br>2. 申請日列ヘッダーをクリック | 申請日の昇順/降順でソート | 低 |

#### T-APP-003: 申請詳細表示機能
**テスト目的**: 申請の詳細情報が正常に表示されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-APP-003-01 | 申請詳細表示 | 申請データが存在 | 1. 申請一覧から特定の申請をクリック | 申請詳細情報、添付ファイル、処理履歴が表示 | 高 |
| T-APP-003-02 | 添付ファイル表示 | 申請にファイルが添付済み | 1. 申請詳細画面を表示<br>2. 添付ファイル名をクリック | ファイルプレビューまたはダウンロード | 中 |
| T-APP-003-03 | 処理履歴表示 | 申請に処理履歴が存在 | 1. 申請詳細画面を表示 | 時系列順の処理履歴が表示 | 中 |

#### T-APP-004: 申請承認機能
**テスト目的**: 管理者が申請を正常に承認できることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-APP-004-01 | 申請承認 | 管理者がログイン済み、審査待ち申請が存在 | 1. 申請詳細画面を表示<br>2. 承認ボタンクリック<br>3. 承認コメント入力<br>4. 確定ボタンクリック | ステータス「承認済み」に更新、申請者に通知メール送信 | 高 |
| T-APP-004-02 | 申請却下 | 管理者がログイン済み、審査待ち申請が存在 | 1. 申請詳細画面を表示<br>2. 却下ボタンクリック<br>3. 却下理由入力<br>4. 確定ボタンクリック | ステータス「却下」に更新、申請者に通知メール送信 | 高 |
| T-APP-004-03 | 権限なしユーザー | 一般学生がログイン済み | 1. 申請詳細画面を表示 | 承認・却下ボタンが非表示 | 高 |

### 2.3 支払管理機能

#### T-PAY-001: 支払スケジュール表示機能
**テスト目的**: 支払スケジュールが正常に表示されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-PAY-001-01 | スケジュール表示 | 承認済み申請が存在 | 1. 支払スケジュール画面を表示 | 月次支払予定が時系列で表示 | 高 |
| T-PAY-001-02 | 未支払い表示 | 支払期日を過ぎた案件が存在 | 1. 支払スケジュール画面を表示 | 延滞案件が赤色でハイライト表示 | 高 |
| T-PAY-001-03 | フィルタ機能 | 複数の支払データが存在 | 1. 支払スケジュール画面を表示<br>2. 月次フィルタを選択 | 指定月の支払予定のみ表示 | 中 |

#### T-PAY-002: 支払実行機能
**テスト目的**: 支払処理が正常に実行されることを確認  
**注意**: この機能は実際の金融機関連携のため、テスト環境では模擬実行

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-PAY-002-01 | 正常支払実行 | 管理者ログイン済み、支払予定が存在 | 1. 支払スケジュール画面を表示<br>2. 支払対象を選択<br>3. 支払実行ボタンクリック<br>4. 確認ダイアログでOK | 支払ステータス「処理中」に更新、JASSO連携開始 | 高 |
| T-PAY-002-02 | 重複支払防止 | 既に支払済みの案件が存在 | 1. 支払済み案件の支払実行を試行 | エラーメッセージ表示「既に支払済みです」 | 高 |
| T-PAY-002-03 | 権限なしユーザー | 一般学生がログイン済み | 1. 支払スケジュール画面にアクセス | アクセス拒否、エラーページ表示 | 高 |

#### T-PAY-003: 支払履歴表示機能
**テスト目的**: 支払履歴が正常に表示されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-PAY-003-01 | 履歴一覧表示 | 支払履歴が存在 | 1. 支払履歴画面を表示 | 支払履歴が時系列逆順で表示 | 高 |
| T-PAY-003-02 | 詳細表示 | 支払履歴が存在 | 1. 支払履歴一覧から特定履歴をクリック | 支払詳細、領収書データが表示 | 中 |
| T-PAY-003-03 | エクスポート機能 | 支払履歴が存在 | 1. 支払履歴画面を表示<br>2. エクスポートボタンクリック | CSV形式でダウンロード | 中 |

### 2.4 ユーザー管理機能

#### T-USER-001: ユーザー登録機能
**テスト目的**: 新規ユーザーを正常に登録できることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-USER-001-01 | 正常ユーザー登録 | システム管理者がログイン済み | 1. ユーザー管理画面を表示<br>2. 新規登録ボタンクリック<br>3. 必須項目を入力<br>4. 登録ボタンクリック | ユーザー作成、初期パスワード通知メール送信 | 高 |
| T-USER-001-02 | 重複メールアドレス | システム管理者がログイン済み、既存ユーザーあり | 1. 新規ユーザー登録画面で既存メールアドレスを入力 | エラーメッセージ表示「このメールアドレスは既に使用されています」 | 高 |
| T-USER-001-03 | 無効メール形式 | システム管理者がログイン済み | 1. 新規ユーザー登録画面で無効なメール形式を入力 | バリデーションエラー表示 | 中 |

#### T-USER-002: ユーザー一覧表示機能
**テスト目的**: ユーザー一覧が正常に表示されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-USER-002-01 | 全ユーザー表示 | システム管理者がログイン済み、複数ユーザーが存在 | 1. ユーザー管理画面を表示 | 全ユーザーが一覧表示、基本情報表示 | 高 |
| T-USER-002-02 | ロール別フィルタ | 異なるロールのユーザーが存在 | 1. ユーザー一覧でロールフィルタを選択 | 指定ロールのユーザーのみ表示 | 中 |
| T-USER-002-03 | 検索機能 | 複数ユーザーが存在 | 1. 検索ボックスにユーザー名を入力 | 該当ユーザーのみ表示 | 中 |

#### T-USER-003: ユーザー編集機能
**テスト目的**: ユーザー情報を正常に編集できることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-USER-003-01 | 基本情報更新 | システム管理者がログイン済み | 1. ユーザー一覧から編集対象を選択<br>2. 基本情報を変更<br>3. 更新ボタンクリック | ユーザー情報更新、変更ログ記録 | 高 |
| T-USER-003-02 | ロール変更 | システム管理者がログイン済み | 1. ユーザー編集画面を表示<br>2. ロールを変更<br>3. 更新ボタンクリック | ロール更新、権限変更反映 | 高 |
| T-USER-003-03 | アカウント無効化 | システム管理者がログイン済み | 1. ユーザー編集画面を表示<br>2. アカウント無効化チェック<br>3. 更新ボタンクリック | ユーザーログイン不可、セッション無効化 | 高 |

### 2.5 システム設定機能

#### T-SYS-001: システム設定表示・更新機能
**テスト目的**: システム設定が正常に表示・更新されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-SYS-001-01 | 設定表示 | システム管理者がログイン済み | 1. システム設定画面を表示 | 現在の設定値が表示 | 高 |
| T-SYS-001-02 | 設定更新 | システム管理者がログイン済み | 1. システム設定画面を表示<br>2. 設定値を変更<br>3. 保存ボタンクリック | 設定値更新、変更ログ記録 | 高 |
| T-SYS-001-03 | 権限なしアクセス | 一般ユーザーがログイン済み | 1. システム設定画面にアクセス | アクセス拒否、エラーページ表示 | 高 |

#### T-SYS-002: 監査ログ表示機能
**テスト目的**: 監査ログが正常に表示されることを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-SYS-002-01 | ログ一覧表示 | システム管理者がログイン済み、ログデータが存在 | 1. 監査ログ画面を表示 | ログエントリが時系列逆順で表示 | 高 |
| T-SYS-002-02 | ログフィルタ | 異なるレベルのログが存在 | 1. 監査ログ画面でレベルフィルタを選択 | 指定レベルのログのみ表示 | 中 |
| T-SYS-002-03 | ログ検索 | 複数ログが存在 | 1. 検索ボックスにキーワードを入力 | 該当するログのみ表示 | 中 |
| T-SYS-002-04 | ログエクスポート | ログデータが存在 | 1. 監査ログ画面でエクスポートボタンクリック | CSV形式でダウンロード | 低 |

---

## 3. 非機能テスト項目

### 3.1 パフォーマンステスト

#### T-PERF-001: レスポンス時間テスト
**テスト目的**: システムが要求されるレスポンス時間を満たすことを確認

| テストケースID | テスト内容 | 負荷条件 | 測定項目 | 合格基準 | 優先度 |
|---|---|---|---|---|---|
| T-PERF-001-01 | ログイン処理 | 同時ユーザー数: 100 | 平均レスポンス時間 | 2秒以内 | 高 |
| T-PERF-001-02 | 申請一覧表示 | 同時ユーザー数: 50 | 平均レスポンス時間 | 3秒以内 | 高 |
| T-PERF-001-03 | 申請登録処理 | 同時ユーザー数: 20 | 平均レスポンス時間 | 5秒以内 | 中 |
| T-PERF-001-04 | 支払履歴表示 | データ件数: 10,000件 | 平均レスポンス時間 | 3秒以内 | 中 |
| T-PERF-001-05 | ファイルアップロード | ファイルサイズ: 5MB | アップロード時間 | 30秒以内 | 低 |

#### T-PERF-002: スループットテスト
**テスト目的**: システムが要求されるスループットを満たすことを確認

| テストケースID | テスト内容 | 負荷条件 | 測定項目 | 合格基準 | 優先度 |
|---|---|---|---|---|---|
| T-PERF-002-01 | API処理能力 | 継続負荷: 1時間 | 秒間処理数 | 100 TPS以上 | 高 |
| T-PERF-002-02 | 同時ログイン数 | 段階的負荷増加 | 最大同時ユーザー数 | 500ユーザー以上 | 高 |
| T-PERF-002-03 | データベース処理 | 同時クエリ数: 100 | 平均クエリ応答時間 | 1秒以内 | 中 |

#### T-PERF-003: リソース使用量テスト
**テスト目的**: システムリソースの使用量が適切な範囲内であることを確認

| テストケースID | テスト内容 | 負荷条件 | 測定項目 | 合格基準 | 優先度 |
|---|---|---|---|---|---|
| T-PERF-003-01 | CPU使用率 | 定常負荷 | CPU使用率 | 平均70%以下 | 中 |
| T-PERF-003-02 | メモリ使用量 | 継続負荷: 8時間 | メモリ使用量 | 80%以下、メモリリークなし | 中 |
| T-PERF-003-03 | ディスク使用量 | 大量データ処理 | ディスクI/O | 読み込み速度 100MB/s以上 | 低 |

### 3.2 セキュリティテスト

#### T-SEC-001: 認証・認可テスト
**テスト目的**: 認証・認可機能が適切にセキュリティを確保していることを確認

| テストケースID | テスト内容 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-SEC-001-01 | SQL インジェクション対策 | 1. ログインフォームにSQL文を入力<br>2. 申請検索にSQL文を入力 | SQL文が実行されず、エラーハンドリングされる | 高 |
| T-SEC-001-02 | XSS対策 | 1. 入力フォームにJavaScriptコードを入力<br>2. データ表示時の動作確認 | スクリプトが実行されず、エスケープ処理される | 高 |
| T-SEC-001-03 | CSRF対策 | 1. 外部サイトから申請フォーム送信を試行 | CSRFトークンエラーで処理拒否 | 高 |
| T-SEC-001-04 | セッション管理 | 1. 複数ブラウザで同一アカウントログイン<br>2. セッション乗っ取り試行 | 適切なセッション管理、不正アクセス防止 | 高 |
| T-SEC-001-05 | パスワード暗号化 | 1. データベースのパスワード欄を確認 | ハッシュ化されたパスワードが保存 | 高 |

#### T-SEC-002: データ保護テスト
**テスト目的**: 個人情報等の機密データが適切に保護されることを確認

| テストケースID | テスト内容 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-SEC-002-01 | 個人情報暗号化 | 1. データベースの個人情報カラムを確認 | 暗号化されたデータが保存 | 高 |
| T-SEC-002-02 | ファイル保護 | 1. アップロードファイルの保存場所確認<br>2. 直接URL アクセス試行 | 認証なしでアクセス不可 | 高 |
| T-SEC-002-03 | ログ情報保護 | 1. ログファイルの内容確認 | 個人情報がログに出力されない | 中 |
| T-SEC-002-04 | 通信暗号化 | 1. HTTPSでの通信確認<br>2. SSL証明書の有効性確認 | すべての通信がHTTPS | 高 |

#### T-SEC-003: アクセス制御テスト
**テスト目的**: 適切な権限制御が実装されていることを確認

| テストケースID | テスト内容 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-SEC-003-01 | ロールベースアクセス制御 | 1. 異なるロールでログイン<br>2. 各機能へのアクセス試行 | ロールに応じたアクセス制御 | 高 |
| T-SEC-003-02 | URL直接アクセス制御 | 1. 権限なしでURLに直接アクセス | アクセス拒否、ログイン画面リダイレクト | 高 |
| T-SEC-003-03 | API アクセス制御 | 1. 認証トークンなしでAPI呼び出し | 401 Unauthorized エラー | 高 |

### 3.3 ユーザビリティテスト

#### T-UX-001: 操作性テスト
**テスト目的**: システムが使いやすく、直感的に操作できることを確認

| テストケースID | テスト内容 | テスト対象者 | 評価項目 | 合格基準 | 優先度 |
|---|---|---|---|---|---|
| T-UX-001-01 | 初回ログイン操作 | システム未経験者5名 | タスク完了率、所要時間 | 80%以上が3分以内に完了 | 高 |
| T-UX-001-02 | 申請登録操作 | 学生ユーザー10名 | エラー発生率、満足度 | エラー率10%以下、満足度4/5以上 | 高 |
| T-UX-001-03 | 管理機能操作 | 管理者ユーザー5名 | 操作効率、学習コスト | 従来の50%以下の時間で完了 | 中 |

#### T-UX-002: アクセシビリティテスト
**テスト目的**: システムがアクセシビリティ要件を満たすことを確認

| テストケースID | テスト内容 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-UX-002-01 | キーボード操作 | 1. マウスを使わずにキーボードのみで全機能を操作 | すべての機能がキーボードで操作可能 | 中 |
| T-UX-002-02 | スクリーンリーダー対応 | 1. スクリーンリーダーでページを読み上げ | 適切な読み上げ順序、代替テキスト | 中 |
| T-UX-002-03 | 色覚対応 | 1. 色覚シミュレータで画面確認 | 色に依存しない情報伝達 | 低 |
| T-UX-002-04 | フォントサイズ変更 | 1. ブラウザのフォントサイズを150%に変更 | レイアウト崩れなし、機能性維持 | 低 |

#### T-UX-003: レスポンシブデザインテスト
**テスト目的**: 異なるデバイスで適切に表示・動作することを確認

| テストケースID | テスト内容 | テスト環境 | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-UX-003-01 | スマートフォン表示 | iPhone、Android各種 | 適切なレイアウト、操作可能 | 高 |
| T-UX-003-02 | タブレット表示 | iPad、Android タブレット | 適切なレイアウト、操作可能 | 中 |
| T-UX-003-03 | 異なる解像度 | 1920x1080、1366x768、1024x768 | レイアウト崩れなし | 中 |

### 3.4 互換性テスト

#### T-COMP-001: ブラウザ互換性テスト
**テスト目的**: 主要ブラウザで正常に動作することを確認

| テストケースID | テスト内容 | テスト対象ブラウザ | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-COMP-001-01 | 基本機能動作 | Chrome 最新版 | 全機能正常動作 | 高 |
| T-COMP-001-02 | 基本機能動作 | Firefox 最新版 | 全機能正常動作 | 高 |
| T-COMP-001-03 | 基本機能動作 | Safari 最新版 | 全機能正常動作 | 高 |
| T-COMP-001-04 | 基本機能動作 | Edge 最新版 | 全機能正常動作 | 中 |
| T-COMP-001-05 | レガシーブラウザ | Chrome 1年前バージョン | 基本機能動作（一部制限可） | 低 |

#### T-COMP-002: OS互換性テスト
**テスト目的**: 主要OSで正常に動作することを確認

| テストケースID | テスト内容 | テスト対象OS | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-COMP-002-01 | Windows環境 | Windows 10/11 | 全機能正常動作 | 高 |
| T-COMP-002-02 | macOS環境 | macOS 最新版 | 全機能正常動作 | 中 |
| T-COMP-002-03 | モバイルOS | iOS、Android | 基本機能動作 | 中 |

---

## 4. 統合テスト項目

### 4.1 外部システム連携テスト

#### T-INT-001: JASSO連携テスト
**テスト目的**: JASSO システムとの連携が正常に動作することを確認  
**注意**: テスト環境ではJASSO模擬システムを使用

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-INT-001-01 | 申請データ送信 | 承認済み申請が存在 | 1. 申請データをJASSOに送信<br>2. 送信結果確認 | 正常送信、受付確認レスポンス | 高 |
| T-INT-001-02 | 支払指示送信 | 支払スケジュールが存在 | 1. 支払指示をJASSOに送信<br>2. 送信結果確認 | 正常送信、処理開始通知 | 高 |
| T-INT-001-03 | 支払結果受信 | 支払処理完了通知待ち | 1. JASSO からの結果通知受信<br>2. システム状態更新確認 | 支払ステータス更新、履歴記録 | 高 |
| T-INT-001-04 | エラーハンドリング | JASSO システム停止状態 | 1. JASSOへの送信試行<br>2. エラー処理確認 | 適切なエラー処理、リトライ機能 | 中 |
| T-INT-001-05 | タイムアウト処理 | 応答遅延設定 | 1. JASSOへの送信で30秒待機<br>2. タイムアウト処理確認 | タイムアウト検知、エラーログ記録 | 中 |

#### T-INT-002: メール送信テスト
**テスト目的**: メール送信機能が正常に動作することを確認

| テストケースID | テスト内容 | 事前条件 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|
| T-INT-002-01 | 申請受付メール | 申請が登録された | 1. 申請登録処理実行<br>2. メール送信確認 | 申請者にメール送信、適切な内容 | 高 |
| T-INT-002-02 | 承認通知メール | 申請が承認された | 1. 申請承認処理実行<br>2. メール送信確認 | 申請者にメール送信、承認内容記載 | 高 |
| T-INT-002-03 | 支払完了メール | 支払が完了した | 1. 支払完了処理実行<br>2. メール送信確認 | 申請者にメール送信、支払詳細記載 | 中 |
| T-INT-002-04 | システム管理者通知 | システムエラー発生 | 1. システムエラーを発生<br>2. 管理者メール確認 | 管理者にエラー通知メール | 中 |

### 4.2 データ連携テスト

#### T-INT-003: データベース整合性テスト
**テスト目的**: データベース間でデータの整合性が保たれることを確認

| テストケースID | テスト内容 | テスト手順 | 期待結果 | 優先度 |
|---|---|---|---|---|
| T-INT-003-01 | トランザクション整合性 | 1. 申請登録中にシステム障害発生<br>2. データ状態確認 | ロールバック実行、データ不整合なし | 高 |
| T-INT-003-02 | 外部キー制約 | 1. 存在しないユーザーIDで申請作成試行 | エラー発生、データ作成されない | 高 |
| T-INT-003-03 | 同時更新制御 | 1. 同一データを複数ユーザーが同時更新 | 楽観的ロック動作、競合状態回避 | 中 |

---

## 5. 自動テスト仕様

### 5.1 単体テスト（Unit Test）

#### 5.1.1 JavaScript関数テスト

```javascript
// tests/unit/utils/dateHelper.test.js
describe('DateHelper', () => {
    test('formatDate should format date correctly', () => {
        const date = new Date('2025-01-15');
        const result = DateHelper.formatDate(date);
        expect(result).toBe('2025/01/15');
    });
    
    test('addMonths should add months correctly', () => {
        const date = new Date('2025-01-15');
        const result = DateHelper.addMonths(date, 3);
        expect(result.getMonth()).toBe(3); // April (0-indexed)
    });
    
    test('isBusinessDay should identify business days', () => {
        const weekday = new Date('2025-01-15'); // Wednesday
        const weekend = new Date('2025-01-18'); // Saturday
        
        expect(DateHelper.isBusinessDay(weekday)).toBe(true);
        expect(DateHelper.isBusinessDay(weekend)).toBe(false);
    });
});

// tests/unit/services/validation/FormValidator.test.js
describe('FormValidator', () => {
    test('validateEmail should validate email format', () => {
        expect(FormValidator.validateEmail('test@example.com')).toBe(true);
        expect(FormValidator.validateEmail('invalid-email')).toBe(false);
        expect(FormValidator.validateEmail('')).toBe(false);
    });
    
    test('validatePassword should check password strength', () => {
        const strongPassword = 'StrongPass123!';
        const weakPassword = '123';
        
        expect(FormValidator.validatePassword(strongPassword).isValid).toBe(true);
        expect(FormValidator.validatePassword(weakPassword).isValid).toBe(false);
    });
    
    test('validateRequired should check required fields', () => {
        expect(FormValidator.validateRequired('test')).toBe(true);
        expect(FormValidator.validateRequired('')).toBe(false);
        expect(FormValidator.validateRequired(null)).toBe(false);
    });
});

// tests/unit/components/base/BaseComponent.test.js
describe('BaseComponent', () => {
    let container;
    let component;
    
    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        component = new BaseComponent('test-container');
    });
    
    afterEach(() => {
        document.body.removeChild(container);
    });
    
    test('should initialize with correct container', () => {
        expect(component.containerId).toBe('test-container');
        expect(component.container).toBe(container);
    });
    
    test('should show and hide loading correctly', () => {
        component.showLoading();
        const loadingDiv = document.getElementById('test-container-loading');
        expect(loadingDiv).not.toBeNull();
        
        component.hideLoading();
        const hiddenLoadingDiv = document.getElementById('test-container-loading');
        expect(hiddenLoadingDiv).toBeNull();
    });
    
    test('should handle errors correctly', () => {
        const error = new Error('Test error');
        component.handleError(error);
        
        const errorDiv = container.querySelector('.error');
        expect(errorDiv).not.toBeNull();
        expect(errorDiv.textContent).toContain('Test error');
    });
});
```

#### 5.1.2 APIクライアントテスト

```javascript
// tests/unit/services/api/ApiClient.test.js
describe('ApiClient', () => {
    let apiClient;
    
    beforeEach(() => {
        apiClient = new ApiClient();
        // Mock fetch
        global.fetch = jest.fn();
    });
    
    afterEach(() => {
        jest.resetAllMocks();
    });
    
    test('should make GET request correctly', async () => {
        const mockResponse = { success: true, data: { id: 1 } };
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse),
            headers: new Map([['content-type', 'application/json']])
        });
        
        const result = await apiClient.get('test-endpoint');
        
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('test-endpoint'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
        expect(result).toEqual(mockResponse);
    });
    
    test('should handle API errors correctly', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ message: 'Bad Request' })
        });
        
        await expect(apiClient.get('test-endpoint')).rejects.toThrow(ApiError);
    });
    
    test('should retry on server errors', async () => {
        fetch
            .mockResolvedValueOnce({ ok: false, status: 500 })
            .mockResolvedValueOnce({ ok: false, status: 500 })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true })
            });
        
        const result = await apiClient.get('test-endpoint');
        
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
    });
});
```

### 5.2 統合テスト（Integration Test）

#### 5.2.1 コンポーネント統合テスト

```javascript
// tests/integration/components/ApplicationForm.test.js
describe('ApplicationForm Integration', () => {
    let container;
    let applicationForm;
    
    beforeEach(async () => {
        container = document.createElement('div');
        container.id = 'application-form-container';
        document.body.appendChild(container);
        
        // Mock API responses
        global.fetch = jest.fn();
        
        applicationForm = new ApplicationForm('application-form-container');
        await applicationForm.render();
    });
    
    afterEach(() => {
        document.body.removeChild(container);
        jest.resetAllMocks();
    });
    
    test('should submit application successfully', async () => {
        // Mock successful API response
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: () => Promise.resolve({
                success: true,
                data: { id: 123, status: 'pending' }
            })
        });
        
        // Fill form fields
        const nameInput = container.querySelector('[name="applicant_name"]');
        const emailInput = container.querySelector('[name="email"]');
        const submitButton = container.querySelector('[type="submit"]');
        
        nameInput.value = '田中太郎';
        emailInput.value = 'tanaka@example.com';
        
        // Submit form
        submitButton.click();
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('applications'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('田中太郎')
            })
        );
        
        // Check success message
        const successMessage = container.querySelector('.success');
        expect(successMessage).not.toBeNull();
    });
    
    test('should show validation errors', async () => {
        const submitButton = container.querySelector('[type="submit"]');
        
        // Submit empty form
        submitButton.click();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check validation errors
        const errorMessages = container.querySelectorAll('.error-message');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        // Should not call API
        expect(fetch).not.toHaveBeenCalled();
    });
});
```

### 5.3 E2Eテスト（End-to-End Test）

#### 5.3.1 Playwrightを使用したE2Eテスト

```javascript
// tests/e2e/authentication.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    test('should login and logout successfully', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('[type="submit"]');
        
        // Verify dashboard is loaded
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('h1')).toContainText('ダッシュボード');
        
        // Logout
        await page.click('[data-testid="user-menu"]');
        await page.click('[data-testid="logout-button"]');
        
        // Verify redirect to login
        await expect(page).toHaveURL('/login');
    });
    
    test('should handle login errors', async ({ page }) => {
        await page.goto('/login');
        await page.fill('[name="email"]', 'invalid@example.com');
        await page.fill('[name="password"]', 'wrongpassword');
        await page.click('[type="submit"]');
        
        // Check error message
        await expect(page.locator('.error')).toContainText('メールアドレスまたはパスワードが間違っています');
        
        // Should stay on login page
        await expect(page).toHaveURL('/login');
    });
});

// tests/e2e/application.spec.js
test.describe('Application Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login as student user
        await page.goto('/login');
        await page.fill('[name="email"]', 'student@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });
    
    test('should create new application', async ({ page }) => {
        await page.goto('/applications/new');
        
        // Fill application form
        await page.fill('[name="applicant_name"]', '山田花子');
        await page.fill('[name="student_id"]', '2025001');
        await page.fill('[name="email"]', 'yamada@example.com');
        await page.selectOption('[name="loan_type"]', 'type1');
        await page.fill('[name="monthly_amount"]', '50000');
        
        // Upload file
        await page.setInputFiles('[name="documents"]', 'tests/fixtures/sample.pdf');
        
        // Submit
        await page.click('[type="submit"]');
        
        // Check success
        await expect(page.locator('.success')).toContainText('申請を受け付けました');
        
        // Verify in application list
        await page.goto('/applications');
        await expect(page.locator('tbody tr')).toContainText('山田花子');
    });
    
    test('should validate required fields', async ({ page }) => {
        await page.goto('/applications/new');
        
        // Submit empty form
        await page.click('[type="submit"]');
        
        // Check validation errors
        await expect(page.locator('.error-message')).toHaveCount(5); // Expected number of required fields
    });
});

// tests/e2e/admin.spec.js
test.describe('Admin Functions', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin user
        await page.goto('/login');
        await page.fill('[name="email"]', 'admin@example.com');
        await page.fill('[name="password"]', 'adminpassword');
        await page.click('[type="submit"]');
    });
    
    test('should approve application', async ({ page }) => {
        await page.goto('/applications');
        
        // Find pending application
        const pendingRow = page.locator('tr:has-text("審査待ち")').first();
        await pendingRow.locator('[data-action="view"]').click();
        
        // Approve application
        await page.click('[data-action="approve"]');
        await page.fill('[name="approval_comment"]', '承認します');
        await page.click('[data-testid="confirm-approve"]');
        
        // Check success message
        await expect(page.locator('.success')).toContainText('申請を承認しました');
        
        // Verify status change
        await page.goto('/applications');
        await expect(pendingRow).toContainText('承認済み');
    });
    
    test('should manage users', async ({ page }) => {
        await page.goto('/admin/users');
        
        // Create new user
        await page.click('[data-testid="add-user"]');
        await page.fill('[name="name"]', '新規ユーザー');
        await page.fill('[name="email"]', 'newuser@example.com');
        await page.selectOption('[name="role"]', 'student');
        await page.click('[type="submit"]');
        
        // Check success
        await expect(page.locator('.success')).toContainText('ユーザーを作成しました');
        
        // Verify in user list
        await expect(page.locator('tbody')).toContainText('新規ユーザー');
    });
});
```

### 5.4 パフォーマンステスト自動化

#### 5.4.1 負荷テストスクリプト

```javascript
// tests/performance/load-test.js
const { chromium } = require('playwright');

async function loadTest() {
    const results = [];
    const concurrentUsers = 10;
    const testDuration = 60000; // 1 minute
    
    console.log(`Starting load test with ${concurrentUsers} concurrent users`);
    
    const promises = Array.from({ length: concurrentUsers }, (_, i) => 
        runUserSession(i, testDuration)
    );
    
    const sessionResults = await Promise.all(promises);
    
    // Analyze results
    const totalRequests = sessionResults.reduce((sum, result) => sum + result.requests, 0);
    const totalErrors = sessionResults.reduce((sum, result) => sum + result.errors, 0);
    const avgResponseTime = sessionResults.reduce((sum, result) => sum + result.avgResponseTime, 0) / concurrentUsers;
    
    console.log('Load Test Results:');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Error Rate: ${(totalErrors / totalRequests * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Requests per Second: ${(totalRequests / (testDuration / 1000)).toFixed(2)}`);
}

async function runUserSession(userId, duration) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    let requests = 0;
    let errors = 0;
    const responseTimes = [];
    
    const startTime = Date.now();
    
    try {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', `testuser${userId}@example.com`);
        await page.fill('[name="password"]', 'password123');
        await page.click('[type="submit"]');
        
        while (Date.now() - startTime < duration) {
            try {
                const requestStart = Date.now();
                
                // Simulate user actions
                await page.goto('/applications');
                await page.waitForLoadState('networkidle');
                
                const responseTime = Date.now() - requestStart;
                responseTimes.push(responseTime);
                requests++;
                
                // Random delay between 1-3 seconds
                await page.waitForTimeout(Math.random() * 2000 + 1000);
                
            } catch (error) {
                errors++;
                console.error(`User ${userId} error:`, error.message);
            }
        }
    } catch (error) {
        console.error(`User ${userId} session error:`, error.message);
        errors++;
    } finally {
        await browser.close();
    }
    
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    
    return {
        userId,
        requests,
        errors,
        avgResponseTime: avgResponseTime || 0
    };
}

loadTest().catch(console.error);
```

---

## 6. テスト実行計画

### 6.1 テストスケジュール

#### フェーズ1: 単体テスト（1週間）
- **対象**: 個別コンポーネント、ユーティリティ関数
- **実行者**: 開発者
- **成果物**: テストレポート、カバレッジレポート

#### フェーズ2: 統合テスト（1週間）
- **対象**: コンポーネント間連携、API統合
- **実行者**: 開発者、QAエンジニア
- **成果物**: 統合テストレポート

#### フェーズ3: システムテスト（2週間）
- **対象**: 全体機能、非機能要件
- **実行者**: QAエンジニア
- **成果物**: システムテストレポート、不具合管理表

#### フェーズ4: 受入テスト（1週間）
- **対象**: ビジネス要件、ユーザーシナリオ
- **実行者**: ステークホルダー、エンドユーザー代表
- **成果物**: 受入テスト結果報告書

### 6.2 テスト環境構成

#### 開発環境
- **用途**: 開発者による単体テスト
- **データ**: テストデータ（少量）
- **外部連携**: モック使用

#### テスト環境
- **用途**: QAによる統合・システムテスト
- **データ**: テストデータ（中量）
- **外部連携**: スタブ・模擬システム使用

#### ステージング環境
- **用途**: 受入テスト、パフォーマンステスト
- **データ**: 本番相当データ（匿名化）
- **外部連携**: 実際のテスト環境

### 6.3 テストデータ管理

#### テストデータ作成方針
1. **個人情報**: 完全に匿名化されたダミーデータを使用
2. **データ量**: 各テストレベルに応じた適切な量を準備
3. **データ品質**: 本番環境の特性を反映したリアルなデータ
4. **データ更新**: テスト実行前に最新状態にリセット

#### テストデータセット

```sql
-- 基本テストデータ
INSERT INTO users (id, name, email, role, created_at) VALUES
('u001', '管理者太郎', 'admin@test.com', 'admin', '2025-01-01 00:00:00'),
('u002', '学生花子', 'student@test.com', 'student', '2025-01-01 00:00:00'),
('u003', 'オペ次郎', 'operator@test.com', 'operator', '2025-01-01 00:00:00');

-- 申請テストデータ
INSERT INTO applications (id, user_id, status, amount, created_at) VALUES
('a001', 'u002', 'pending', 50000, '2025-01-15 10:00:00'),
('a002', 'u002', 'approved', 60000, '2025-01-10 14:30:00'),
('a003', 'u002', 'rejected', 40000, '2025-01-05 09:15:00');
```

### 6.4 不具合管理

#### 不具合分類
- **Critical**: システム停止、データ損失
- **High**: 主要機能の不具合
- **Medium**: 一部機能の制限
- **Low**: UI/UXの軽微な問題

#### 不具合管理プロセス
1. **発見**: テスト実行時に不具合を発見
2. **記録**: 不具合管理システムに詳細を記録
3. **トリアージ**: 優先度と担当者を決定
4. **修正**: 開発者が修正を実装
5. **検証**: QAエンジニアが修正を確認
6. **クローズ**: 修正完了を確認してクローズ

---

## 7. テスト成果物

### 7.1 テストレポート形式

#### 日次テストレポート
```
# 日次テストレポート
## 実行日: 2025-08-28
## 実行者: QAチーム

### サマリー
- 実行テストケース数: 150
- 成功: 142
- 失敗: 8
- 成功率: 94.7%

### 失敗テストケース
| テストケースID | テスト内容 | 失敗理由 | 担当者 | 対応予定 |
|---|---|---|---|---|
| T-AUTH-001-05 | アカウントロック | タイムアウト発生 | 田中 | 8/29 |

### 次回実行計画
- 修正されたテストケースの再実行
- 新規追加テストケースの実行
```

#### 最終テストレポート
```
# 奨学金代理返済支援システム テスト結果報告書

## 1. テスト実行サマリー
- テスト期間: 2025-08-01 ～ 2025-08-28
- 総テストケース数: 1,250
- 実行テストケース数: 1,245 (99.6%)
- 成功テストケース数: 1,198 (96.2%)
- 失敗テストケース数: 47 (3.8%)

## 2. 品質評価
### 機能品質
- 主要機能: 100% 正常動作確認
- 付加機能: 95% 正常動作確認
- 総合評価: A（優秀）

### 非機能品質
- パフォーマンス: 要件充足率 98%
- セキュリティ: 重大脆弱性 0件
- ユーザビリティ: SUSスコア 75点

## 3. 推奨事項
- 軽微なUI改善を推奨
- パフォーマンス最適化の継続実施
- 定期的なセキュリティ監査の実施

## 4. リリース可否判定
判定: **リリース可** ✅
理由: 全ての重要な機能が正常動作し、品質基準を満たしている
```

### 7.2 テストメトリクス

#### テストカバレッジ目標
- **コードカバレッジ**: 80%以上
- **機能カバレッジ**: 95%以上
- **要件カバレッジ**: 100%

#### テスト効率指標
- **テスト実行効率**: 自動化率 70%以上
- **不具合検出効率**: テスト工程での検出率 90%以上
- **テスト生産性**: 1日あたりのテストケース実行数

---

## 8. テスト改善提案

### 8.1 継続的改善アプローチ

#### テストプロセス改善
1. **レトロスペクティブ**: 各テストフェーズ後に振り返りを実施
2. **メトリクス分析**: テスト効率と品質指標の定期的な分析
3. **ベストプラクティス共有**: チーム内でのナレッジ共有

#### テスト自動化拡大
1. **回帰テスト自動化**: リリース毎の回帰テストを完全自動化
2. **API テスト自動化**: 全APIエンドポイントの自動テスト
3. **パフォーマンステスト自動化**: 継続的なパフォーマンス監視

### 8.2 品質向上施策

#### 予防的品質管理
1. **コードレビュー**: 全コード変更に対するピアレビュー
2. **静的解析**: コーディング規約とセキュリティの自動チェック
3. **設計レビュー**: アーキテクチャとデザインの事前レビュー

#### 継続的監視
1. **本番監視**: リアルタイムの性能・エラー監視
2. **ユーザーフィードバック**: 実際の利用状況の継続的な収集
3. **セキュリティ監査**: 定期的なセキュリティ評価

---

この包括的なテスト項目書により、奨学金代理返済支援システムの品質が確実に保証され、安全で信頼性の高いシステムとしてリリースすることが可能になります。テスト実行時は、この仕様書に従って段階的かつ体系的にテストを実施してください。