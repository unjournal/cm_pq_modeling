#!/usr/bin/env python3
"""Patch shinylive-sw.js to preserve base path for GH Pages subdir hosting.

The shinylive service worker rewrites app paths like
  /<base>/app_xxx/... -> /...
which breaks on GH Pages because it strips the repo base path.
We replace the rewrite target to use base_path + "/" instead of "/".
"""

from __future__ import annotations

from pathlib import Path
import sys


def read_output_dir(project_root: Path) -> Path:
    cfg = project_root / "_quarto.yml"
    if not cfg.exists():
        return project_root / "_site"
    output_dir = None
    for raw_line in cfg.read_text(encoding="utf-8").splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line:
            continue
        if line.startswith("output-dir:"):
            output_dir = line.split(":", 1)[1].strip().strip('"').strip("'")
            break
    if not output_dir:
        output_dir = "_site"
    return project_root / output_dir


def patch_file(path: Path) -> str:
    original = path.read_text(encoding="utf-8")
    target = "url.pathname = url.pathname.replace(appPathRegex, \"/\");"
    replacement = "url.pathname = url.pathname.replace(appPathRegex, base_path + \"/\");"
    if target in original:
        updated = original.replace(target, replacement)
        path.write_text(updated, encoding="utf-8")
        return "patched"
    if replacement in original:
        return "already"
    return "missing"


def main() -> int:
    project_root = Path(__file__).resolve().parents[1]
    output_dir = read_output_dir(project_root)

    candidates = []
    root_sw = output_dir / "shinylive-sw.js"
    if root_sw.exists():
        candidates.append(root_sw)

    # Also patch any bundled shinylive sw files if present
    for sw in output_dir.glob("site_libs/quarto-contrib/shinylive-*/shinylive-sw.js"):
        candidates.append(sw)

    if not candidates:
        print(f"No shinylive-sw.js found under {output_dir}", file=sys.stderr)
        return 1

    patched = 0
    already = 0
    missing = 0
    for path in candidates:
        status = patch_file(path)
        if status == "patched":
            patched += 1
        elif status == "already":
            already += 1
        else:
            missing += 1

    if missing > 0 and patched == 0 and already == 0:
        print("No patches applied (pattern not found).", file=sys.stderr)
        return 1

    if patched == 0 and already > 0:
        print(f"No changes needed. {already} file(s) already patched.")
        return 0

    print(f"Patched {patched} file(s). {already} already patched.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
