# プロジェクト共通ルール

## アイコン（絵文字は使わない）

**成果物に絵文字を使わない。** 対象は、このリポジトリで作るもの全般。

- HP・LP・管理画面・提案資料・スライド → アイコンライブラリの SVG を使う
- Markdown ドキュメント・README → 装飾目的の絵文字は付けない（見出しは文字だけで組む）
- コード・ログ出力・コミットメッセージ → 絵文字を入れない（`[OK]` `[NG]` のような文字で書く）

絵文字は OS・ブラウザごとに字形と色が変わり、ブランドカラーに合わせられないため、
成果物の見た目が環境まかせになる。SVG なら `currentColor` でゴールド `#c9a84c` に揃う。

チェック記号のように意味を持つものは、絵文字表現を持たない文字で代替する
（`✓` `✗` `□`）。これらは検査でも許可している。

### 検査

コミット時に `scripts/hooks/pre-commit` が絵文字の混入を検出して止める。
git はフックを自動では有効にしないので、クローン後に1回だけ次を実行する:

```bash
git config core.hooksPath scripts/hooks   # このリポジトリで1回だけ
python3 scripts/check-emoji.py --all      # 全体を手動で走査するとき
```

緊急時は `git commit --no-verify` で回避できる。

### 使うライブラリ

| 優先 | ライブラリ | 使いどころ |
|---|---|---|
| 1 | **Phosphor Icons**（MIT・無料） | 標準。これで足りるなら常にこれ |
| 2 | **Hugeicons 無料版**（MIT・無料） | Phosphor に該当する絵が無いときだけ補う |

どちらも角丸系で、混在させても浮かない。Iconoir は採用しない（語彙が不足）。
太さで階層を付けたいときは Phosphor のウェイトを使い分ける
（本文横 `light` ／ 見出し `bold` ／ 表紙の主役 `duotone`）。

### 取り出し方

```bash
python3 scripts/icons.py search bank                        # 3ライブラリ横断で名前を探す
python3 scripts/icons.py svg graduation-cap -w duotone -s 48 -c "#c9a84c"
python3 scripts/icons.py svg Mortarboard01Icon -l huge       # Phosphor に無いとき
python3 scripts/icons.py sprite house bank users             # 多用するなら <symbol> スプライト
```

初回のみ npm からパッケージを取得してキャッシュする（約 74MB、`~/.cache/placz-icons`）。

### 貼り方

- **インライン SVG で埋め込む。** 外部 CDN の webfont やスタイルシートは参照しない
  （Artifact の CSP で読み込めず、無言で表示が消える）。
- 色は `color` / `currentColor` で親から継承させる。`fill` を直書きしない。
- 同じアイコンを 3 回以上使うなら `sprite` でスプライト化して `<use href="#i-house">`。
- 装飾用途は `aria-hidden="true"`。意味を持つアイコン単体のボタンには `aria-label` を付ける。

### 参考

- 3ライブラリの実物比較資料: `docs/icon-library-comparison.html`（ブラウザで開く）
- 全プロジェクトへの適用手順: `docs/ICON_POLICY.md`
