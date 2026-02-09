# scripts/build_site.py
#
# OPTION 1 (Cleanest): partials live in /partials, output goes to /public
#
# What it does:
# - Reads /partials/header.html and /partials/footer.html (footer optional)
# - Scans your site source HTML files (in repo root by default)
# - Replaces <!--HEADER--> and <!--FOOTER--> placeholders
# - Writes final pages into /public (preserving relative paths)
#
# Usage:
#   python scripts/build_site.py
#
# Notes:
# - Only processes .html files.
# - Skips /public, /scripts, /partials, and hidden folders by default.
# - If a page has no <!--HEADER--> marker, it will NOT inject a header.
#   (So you control which pages get the global header.)

from __future__ import annotations

import argparse
from pathlib import Path


DEFAULT_EXCLUDE_DIRS = {
    "public",
    "scripts",
    "partials",
    ".git",
    ".github",
    ".venv",
    "venv",
    "__pycache__",
    "node_modules",
}


def read_optional(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def should_skip_dir(dir_path: Path, exclude_dirs: set[str]) -> bool:
    name = dir_path.name
    if name.startswith("."):
        return True
    return name in exclude_dirs


def iter_html_files(src_root: Path, exclude_dirs: set[str]) -> list[Path]:
    html_files: list[Path] = []
    for p in src_root.rglob("*.html"):
        # Skip excluded directories anywhere in the path
        if any(part in exclude_dirs or part.startswith(".") for part in p.parts):
            continue
        # Also skip anything under the output folder if it exists
        if "public" in p.parts:
            continue
        html_files.append(p)
    return sorted(html_files)


def inject_partials(content: str, header: str, footer: str) -> str:
    # Only inject if the marker exists (so you can opt-in per page)
    if "<!--HEADER-->" in content:
        content = content.replace("<!--HEADER-->", header)

    if "<!--FOOTER-->" in content:
        content = content.replace("<!--FOOTER-->", footer)

    return content


def write_out(src_path: Path, src_root: Path, out_root: Path, content: str) -> Path:
    rel = src_path.relative_to(src_root)
    out_path = out_root / rel
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(content, encoding="utf-8")
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Build static site into /public with header/footer partial injection.")
    parser.add_argument("--src", default=".", help="Source root (default: repo root)")
    parser.add_argument("--out", default="public", help="Output directory (default: public)")
    parser.add_argument("--partials", default="partials", help="Partials directory (default: partials)")
    parser.add_argument("--header", default="header.html", help="Header partial filename (default: header.html)")
    parser.add_argument("--footer", default="footer.html", help="Footer partial filename (default: footer.html)")
    parser.add_argument(
        "--exclude",
        default=",".join(sorted(DEFAULT_EXCLUDE_DIRS)),
        help="Comma-separated directory names to exclude (default includes public,scripts,partials,...)",
    )
    args = parser.parse_args()

    src_root = Path(args.src).resolve()
    out_root = (src_root / args.out).resolve()
    partials_dir = (src_root / args.partials).resolve()
    exclude_dirs = {x.strip() for x in args.exclude.split(",") if x.strip()}

    header_path = partials_dir / args.header
    footer_path = partials_dir / args.footer

    if not header_path.exists():
        raise SystemExit(f"Missing header partial: {header_path}\nCreate it at: partials/header.html")

    header = header_path.read_text(encoding="utf-8")
    footer = read_optional(footer_path)

    html_files = iter_html_files(src_root, exclude_dirs)

    if not html_files:
        print("No HTML files found to process.")
        return 0

    # Ensure output folder exists
    out_root.mkdir(parents=True, exist_ok=True)

    built_count = 0
    for f in html_files:
        original = f.read_text(encoding="utf-8")
        updated = inject_partials(original, header, footer)

        # If no markers, still copy the file to /public so it gets published
        out_path = write_out(f, src_root, out_root, updated)
        built_count += 1
        print(f"Built: {f.relative_to(src_root)} -> {out_path.relative_to(src_root)}")

    print(f"\nDone. Built {built_count} page(s) into: {out_root.relative_to(src_root)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

