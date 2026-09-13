#!/usr/bin/env python3
"""PLACZ アイコンヘルパー / Phosphor Icons・Hugeicons(無料版) の SVG を取り出す。

絵文字の代わりに使う実アイコンを、配布パッケージ(npm)から直接取得してインライン SVG で返します。
外部 CDN を参照しないので、Artifact・社内 HTML・スライドのどれにそのまま貼っても表示が崩れません。

  python3 scripts/icons.py search bank          # 3ライブラリから候補名を探す
  python3 scripts/icons.py svg house            # Phosphor regular の <svg> を出力
  python3 scripts/icons.py svg house -w duotone -s 48 -c "#c9a84c"
  python3 scripts/icons.py svg Home01Icon -l huge
  python3 scripts/icons.py sprite house bank users   # <symbol> スプライトを出力

初回だけ npm からパッケージを取得してキャッシュします(既定 ~/.cache/placz-icons)。
"""
import argparse, os, re, subprocess, sys, tarfile, tempfile

PKGS = {
    "phosphor": ("@phosphor-icons/core", "2.1.1", "package/assets/"),
    "iconoir":  ("iconoir", "7.12.1", "package/icons/"),
    "huge":     ("@hugeicons/core-free-icons", "4.3.2", "package/dist/esm/"),
}
WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"]
CACHE = os.environ.get("PLACZ_ICON_CACHE", os.path.expanduser("~/.cache/placz-icons"))


def ensure(lib):
    """パッケージをキャッシュに展開する(既にあれば何もしない)。"""
    dest = os.path.join(CACHE, lib)
    if os.path.exists(os.path.join(dest, ".ok")):
        return dest
    name, ver, prefix = PKGS[lib]
    url = f"https://registry.npmjs.org/{name}/-/{os.path.basename(name)}-{ver}.tgz"
    print(f"[icons] {name}@{ver} を取得中...", file=sys.stderr)
    os.makedirs(dest, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".tgz") as tmp:
        subprocess.run(["curl", "-sSL", "-o", tmp.name, url], check=True)
        with tarfile.open(tmp.name) as tf:
            for m in tf.getmembers():
                if not m.isfile() or not m.name.startswith(prefix) or m.name.endswith(".map"):
                    continue
                m.name = m.name[len(prefix):]
                tf.extract(m, dest, filter="data")
    open(os.path.join(dest, ".ok"), "w").close()
    return dest


def names(lib):
    root = ensure(lib)
    if lib == "phosphor":
        return sorted(f[:-4] for f in os.listdir(os.path.join(root, "regular")) if f.endswith(".svg"))
    if lib == "iconoir":
        return sorted(f[:-4] for f in os.listdir(os.path.join(root, "regular")) if f.endswith(".svg"))
    return sorted(f[:-3] for f in os.listdir(root) if f.endswith("Icon.js"))


def inner(lib, name, weight="regular", solid=False):
    """SVG の中身(パス群)と viewBox・fill を返す。"""
    root = ensure(lib)
    if lib == "phosphor":
        fn = name + (".svg" if weight == "regular" else f"-{weight}.svg")
        path = os.path.join(root, weight, fn)
        if not os.path.exists(path):
            return None
        body = re.search(r"<svg[^>]*>(.*)</svg>", open(path, encoding="utf-8").read(), re.S).group(1)
        return re.sub(r"\s+", " ", body).strip(), "0 0 256 256", "currentColor", None
    if lib == "iconoir":
        path = os.path.join(root, "solid" if solid else "regular", name + ".svg")
        if not os.path.exists(path):
            return None
        body = re.search(r"<svg[^>]*>(.*)</svg>", open(path, encoding="utf-8").read(), re.S).group(1)
        return re.sub(r"\s+", " ", body).strip(), "0 0 24 24", "none", "1.5"
    path = os.path.join(root, name + ".js")
    if not os.path.exists(path):
        return None
    src = open(path, encoding="utf-8").read()
    attr = {"strokeWidth": "stroke-width", "strokeLinecap": "stroke-linecap",
            "strokeLinejoin": "stroke-linejoin", "fillRule": "fill-rule", "clipRule": "clip-rule",
            "strokeDasharray": "stroke-dasharray", "fillOpacity": "fill-opacity"}
    body = ""
    for tag, props in re.findall(r'\["(\w+)",\s*\{(.*?)\}\]', src, re.S):
        pairs = re.findall(r'(\w+):\s*"([^"]*)"', props)
        a = " ".join(f'{attr.get(k, k)}="{v}"' for k, v in pairs if k != "key")
        body += f"<{tag} {a}/>"
    return body, "0 0 24 24", "none", "1.5"


def render(lib, name, weight, size, color, solid):
    got = inner(lib, name, weight, solid)
    if not got:
        return None
    body, vb, fill, sw = got
    sws = f' stroke-width="{sw}"' if sw else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{size}" height="{size}" '
            f'fill="{fill}" color="{color}"{sws} aria-hidden="true">{body}</svg>')


def cmd_search(a):
    term = a.term.lower()
    for lib in ("phosphor", "iconoir", "huge"):
        hits = [n for n in names(lib) if term in n.lower()]
        print(f"\n## {lib}  ({len(hits)}件)")
        print("  " + ("  ".join(hits[:a.limit]) if hits else "(該当なし)"))
        if len(hits) > a.limit:
            print(f"  ...ほか {len(hits) - a.limit} 件")


def cmd_svg(a):
    out = render(a.lib, a.name, a.weight, a.size, a.color, a.solid)
    if not out:
        sys.exit(f"[icons] {a.lib} に '{a.name}' がありません。search で名前を確認してください。")
    print(out)


def cmd_sprite(a):
    syms = []
    for name in a.names:
        got = inner(a.lib, name, a.weight, a.solid)
        if not got:
            print(f"[icons] 見つかりません: {name}", file=sys.stderr)
            continue
        body, vb, fill, sw = got
        sws = f' stroke-width="{sw}"' if sw else ""
        syms.append(f'<symbol id="i-{name}" viewBox="{vb}" fill="{fill}"{sws}>{body}</symbol>')
    print('<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
          + "".join(syms) + "</svg>")
    print('<!-- 使い方: <svg width="24" height="24"><use href="#i-house"/></svg> -->')


p = argparse.ArgumentParser(description="Phosphor / Iconoir / Hugeicons から SVG を取り出す")
sub = p.add_subparsers(dest="cmd", required=True)

s = sub.add_parser("search", help="アイコン名を3ライブラリ横断で検索")
s.add_argument("term")
s.add_argument("--limit", type=int, default=40)
s.set_defaults(func=cmd_search)

for nm, fn in (("svg", cmd_svg), ("sprite", cmd_sprite)):
    s = sub.add_parser(nm, help="単体SVGを出力" if nm == "svg" else "<symbol>スプライトを出力")
    s.add_argument("name" if nm == "svg" else "names", nargs=None if nm == "svg" else "+")
    s.add_argument("-l", "--lib", choices=list(PKGS), default="phosphor")
    s.add_argument("-w", "--weight", choices=WEIGHTS, default="regular", help="Phosphorのみ")
    s.add_argument("-s", "--size", default="24")
    s.add_argument("-c", "--color", default="currentColor")
    s.add_argument("--solid", action="store_true", help="Iconoirのみ: 塗りスタイル")
    s.set_defaults(func=fn)

a = p.parse_args()
a.func(a)
