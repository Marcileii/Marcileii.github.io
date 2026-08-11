#!/usr/bin/env python3
"""Security gate for the public portfolio.

The browser-facing code is public by nature. This audit enforces the rule that
nothing secret, privileged or unexpectedly networked is allowed in it.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".html", ".js", ".css", ".json", ".webmanifest", ".yml", ".yaml", ".xml", ".txt", ".svg"}
SOURCE_ROOTS = [
    "index.html", "404.html", "favicon.svg", "manifest.webmanifest", "robots.txt", "sitemap.xml",
    "assets", "cases", "contratar", "demos", ".github/workflows",
]
SKIP_DIRS = {".git", "dist", "node_modules", "playwright-report", "test-results", "screenshots", "__pycache__"}

SECRET_PATTERNS = [
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----")),
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("GitHub token", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")),
    ("Stripe live secret", re.compile(r"\bsk_live_[A-Za-z0-9]{16,}\b")),
    ("Slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{16,}\b")),
    ("generic hardcoded secret", re.compile(
        r"(?i)\b(?:api[_-]?key|client[_-]?secret|service[_-]?role|password|access[_-]?token|refresh[_-]?token|authorization)\b"
        r"\s*[:=]\s*['\"]([^'\"]{8,})['\"]"
    )),
    ("credential embedded in URL", re.compile(r"https?://[^\s/:@]+:[^\s/@]+@")),
]

DANGEROUS_CODE = [
    ("eval()", re.compile(r"\beval\s*\(")),
    ("new Function()", re.compile(r"\bnew\s+Function\s*\(")),
    ("document.write()", re.compile(r"\bdocument\.write\s*\(")),
    ("persistent localStorage", re.compile(r"\blocalStorage\b")),
    ("source map reference", re.compile(r"sourceMappingURL\s*=")),
]

NETWORK_CODE = [
    ("fetch()", re.compile(r"\bfetch\s*\(")),
    ("XMLHttpRequest", re.compile(r"\bXMLHttpRequest\b")),
    ("WebSocket", re.compile(r"\bWebSocket\s*\(")),
    ("EventSource", re.compile(r"\bEventSource\s*\(")),
    ("sendBeacon", re.compile(r"\bnavigator\.sendBeacon\s*\(")),
]

FORBIDDEN_PUBLISHED = {
    ".github", "qa", "docs", "scripts", "README.md", "CONTRIBUTING.md", "SECURITY.md", ".gitignore"
}

CSP_REQUIRED = [
    "default-src 'self'", "base-uri 'self'", "object-src 'none'", "connect-src 'none'", "frame-src 'self'"
]


def iter_text_files(root: Path):
    if root.is_file():
        if root.suffix.lower() in TEXT_SUFFIXES or root.name.startswith("."):
            yield root
        return
    if not root.exists():
        return
    for path in root.rglob("*"):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in TEXT_SUFFIXES:
            yield path


def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return ""


def line_for(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def audit_secrets_and_code(base: Path, roots: list[str], errors: list[str], warnings: list[str]):
    seen: set[Path] = set()
    for name in roots:
        root = base / name
        for path in iter_text_files(root):
            if path in seen:
                continue
            seen.add(path)
            text = read(path)
            rel = path.relative_to(base)
            for label, pattern in SECRET_PATTERNS:
                for match in pattern.finditer(text):
                    errors.append(f"{rel}:{line_for(text, match.start())}: possible {label}")
            for label, pattern in DANGEROUS_CODE:
                for match in pattern.finditer(text):
                    errors.append(f"{rel}:{line_for(text, match.start())}: forbidden {label}")
            if path.suffix.lower() in {".js", ".html"}:
                for label, pattern in NETWORK_CODE:
                    for match in pattern.finditer(text):
                        errors.append(f"{rel}:{line_for(text, match.start())}: unexpected browser network API {label}")
            if path.suffix.lower() == ".html":
                for match in re.finditer(r"<script\b[^>]*\bsrc=['\"]https?://", text, re.I):
                    errors.append(f"{rel}:{line_for(text, match.start())}: external script is not allowed")
                for match in re.finditer(r"<iframe\b[^>]*\bsrc=['\"]https?://", text, re.I):
                    errors.append(f"{rel}:{line_for(text, match.start())}: external iframe is not allowed")
                for match in re.finditer(r"<form\b[^>]*\baction=['\"]https?://", text, re.I):
                    errors.append(f"{rel}:{line_for(text, match.start())}: external form action is not allowed")
                for match in re.finditer(r"<a\b[^>]*target=['\"]_blank['\"][^>]*>", text, re.I):
                    tag = match.group(0)
                    if not re.search(r"\brel=['\"][^'\"]*\bnoopener\b", tag, re.I):
                        warnings.append(f"{rel}:{line_for(text, match.start())}: target=_blank should include rel=noopener")


def audit_forbidden_files(base: Path, errors: list[str]):
    for path in base.rglob("*"):
        if not path.is_file() or any(part in {".git", "dist", "node_modules"} for part in path.parts):
            continue
        name = path.name.lower()
        if name == ".env" or name.startswith(".env.") or path.suffix.lower() in {".pem", ".key", ".p12", ".pfx", ".jks", ".keystore"}:
            errors.append(f"{path.relative_to(base)}: sensitive file type must not be committed")


def audit_built_site(site: Path, errors: list[str], warnings: list[str]):
    if not site.exists():
        errors.append(f"secure build directory does not exist: {site}")
        return
    for name in FORBIDDEN_PUBLISHED:
        if (site / name).exists():
            errors.append(f"published artifact contains private development path: {name}")
    for path in site.rglob("*.map"):
        errors.append(f"published source map is forbidden: {path.relative_to(site)}")
    html_files = list(site.rglob("*.html"))
    if not html_files:
        errors.append("secure build contains no HTML")
        return
    for path in html_files:
        text = read(path)
        rel = path.relative_to(site)
        csp = re.search(
            r"<meta\s+http-equiv=(['\"])Content-Security-Policy\1\s+content=(['\"])(.*?)\2",
            text,
            re.I | re.S,
        )
        if not csp:
            errors.append(f"{rel}: missing Content-Security-Policy meta")
        else:
            policy = csp.group(3)
            for directive in CSP_REQUIRED:
                if directive not in policy:
                    errors.append(f"{rel}: CSP missing directive: {directive}")
        if not re.search(r"<meta\s+name=['\"]referrer['\"]\s+content=['\"]strict-origin-when-cross-origin['\"]", text, re.I):
            errors.append(f"{rel}: missing strict referrer policy")
        for match in re.finditer(r"<a\b[^>]*target=['\"]_blank['\"][^>]*>", text, re.I):
            tag = match.group(0)
            if not re.search(r"\brel=['\"][^'\"]*\bnoopener\b", tag, re.I):
                errors.append(f"{rel}:{line_for(text, match.start())}: published target=_blank lacks noopener")
    audit_secrets_and_code(site, ["."], errors, warnings)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-root", help="also validate the generated deploy artifact")
    args = parser.parse_args()
    errors: list[str] = []
    warnings: list[str] = []

    audit_forbidden_files(REPO, errors)
    audit_secrets_and_code(REPO, SOURCE_ROOTS, errors, warnings)
    if args.site_root:
        audit_built_site(REPO / args.site_root, errors, warnings)

    print(f"Security audit: {len(errors)} error(s), {len(warnings)} warning(s)")
    for item in warnings:
        print(f"WARNING: {item}")
    for item in errors:
        print(f"ERROR: {item}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
