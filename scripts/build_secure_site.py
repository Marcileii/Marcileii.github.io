#!/usr/bin/env python3
"""Build the exact GitHub Pages artifact.

Only public runtime files are copied. Development docs, QA code, workflows and
repository metadata never reach the Pages artifact. HTML receives browser-side
security policy metadata and safe target=_blank handling.
"""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
PUBLIC = [
    "index.html",
    "404.html",
    "favicon.svg",
    "manifest.webmanifest",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    "assets",
    "cases",
    "contratar",
    "demos",
]

CSP = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "object-src 'none'; "
    "script-src 'self' 'unsafe-inline'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: https:; "
    "font-src 'self' data:; "
    "connect-src 'none'; "
    "frame-src 'self'; "
    "media-src 'self' https:; "
    "manifest-src 'self'; "
    "form-action 'self' mailto:; "
    "upgrade-insecure-requests"
)
SECURITY_META = (
    f'<meta http-equiv="Content-Security-Policy" content="{CSP}">\n'
    '<meta name="referrer" content="strict-origin-when-cross-origin">\n'
)


def add_rel_to_blank_links(html: str) -> str:
    pattern = re.compile(r"<a\b[^>]*\btarget=(['\"])_blank\1[^>]*>", re.I)

    def replace(match: re.Match[str]) -> str:
        tag = match.group(0)
        rel = re.search(r"\brel=(['\"])(.*?)\1", tag, re.I)
        if rel:
            values = rel.group(2).split()
            lower = {v.lower() for v in values}
            if "noopener" not in lower:
                values.append("noopener")
            if "noreferrer" not in lower:
                values.append("noreferrer")
            new_rel = f'rel="{" ".join(values)}"'
            return tag[: rel.start()] + new_rel + tag[rel.end() :]
        return tag[:-1] + ' rel="noopener noreferrer">'

    return pattern.sub(replace, html)


def harden_html(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    if "Content-Security-Policy" not in html:
        opening = re.search(r"<head\b[^>]*>", html, re.I)
        if not opening:
            raise RuntimeError(f"HTML has no <head>: {path}")
        html = html[: opening.end()] + "\n" + SECURITY_META + html[opening.end() :]
    html = add_rel_to_blank_links(html)
    # Conservative HTML compression: only whitespace between tags is collapsed.
    html = re.sub(r">\s+<", "><", html)
    path.write_text(html.strip() + "\n", encoding="utf-8")


def strip_source_map_reference(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"^[ \t]*(?://|/\*)[#@]?\s*sourceMappingURL=.*?(?:\*/)?\s*$", "", text, flags=re.M)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    for name in PUBLIC:
        source = ROOT / name
        if not source.exists():
            raise FileNotFoundError(f"Public build input not found: {name}")
        target = OUT / name
        if source.is_dir():
            shutil.copytree(source, target, ignore=shutil.ignore_patterns("*.map", ".DS_Store", "Thumbs.db"))
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)

    for html in OUT.rglob("*.html"):
        harden_html(html)
    for suffix in ("*.js", "*.css"):
        for path in OUT.rglob(suffix):
            strip_source_map_reference(path)

    print(f"Secure Pages artifact built at {OUT}")
    print("Published roots:", ", ".join(sorted(p.name for p in OUT.iterdir())))


if __name__ == "__main__":
    main()
