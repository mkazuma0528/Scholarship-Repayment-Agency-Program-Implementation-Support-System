#!/usr/bin/env python3
"""成果物に絵文字が混ざっていないか検査する。

pre-commit フックから呼ばれ、ステージされたファイルだけを見る。
`--all` を付けるとリポジトリ全体を走査する（CI や棚卸し用）。

絵文字表現を持たない記号（✓ ✗ □ → ⇒ ─ など）は通す。
止めたいのは OS ごとに字形と色が変わるカラー絵文字だけなので。
"""
import argparse
import pathlib
import re
import subprocess
import sys

# カラー絵文字として描かれる範囲。
# この行自体が検査に引っかからないよう、範囲はエスケープ表記で書く。
EMOJI = re.compile("[\U0001F000-\U0001FAFF\u2600-\u26FF\u2700-\u27BF\u2B00-\u2BFF]\uFE0F?")
# 上の範囲に入るが、文字として描かれるので許可する記号
ALLOW = {"✓", "✗", "☐", "☑", "✔", "✘", "➜"}
EXTS = {".md", ".html", ".js", ".css", ".py", ".json", ".yml", ".yaml", ".txt", ".sh"}
# アイコン比較資料は各ライブラリの実物カタログなので対象外
EXCLUDE = {"docs/icon-library-comparison.html"}


def staged_files():
    out = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True, check=True).stdout
    return [pathlib.Path(f) for f in out.split("\n") if f]


def all_files():
    out = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True).stdout
    return [pathlib.Path(f) for f in out.split("\n") if f]


def scan(paths):
    hits = []
    for p in paths:
        if p.suffix not in EXTS or p.as_posix() in EXCLUDE or not p.is_file():
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for lineno, line in enumerate(text.split("\n"), 1):
            for m in EMOJI.finditer(line):
                if m.group().rstrip("\ufe0f") in ALLOW:
                    continue
                hits.append((p, lineno, m.start() + 1, m.group(), line.strip()[:70]))
    return hits


def main():
    ap = argparse.ArgumentParser(description="絵文字の混入を検査する")
    ap.add_argument("--all", action="store_true", help="リポジトリ全体を走査する")
    args = ap.parse_args()

    hits = scan(all_files() if args.all else staged_files())
    if not hits:
        return 0

    print("絵文字が含まれています。アイコン（インライン SVG）か文字記号に置き換えてください。\n",
          file=sys.stderr)
    for path, lineno, col, char, line in hits:
        print(f"  {path}:{lineno}:{col}  {char}  {line}", file=sys.stderr)
    print(f"\n  合計 {len(hits)} 箇所。方針は CLAUDE.md の「アイコン」節を参照。", file=sys.stderr)
    print("  SVG の取り出し: python3 scripts/icons.py search <キーワード>", file=sys.stderr)
    print("  どうしても通したいときだけ: git commit --no-verify", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
