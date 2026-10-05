#!/usr/bin/env python3
"""Regenerate posts/posts.json from the front-matter of posts/*.md.

Usage: python3 tools/build_posts.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "posts"
FIELDS = ("title", "date", "type", "summary")


def front_matter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                key, val = line.split(":", 1)
                val = re.sub(r"\s#.*$", "", val).strip().strip("\"'")
                meta[key.strip()] = val
    return meta


def main():
    posts = []
    for path in sorted(POSTS.glob("*.md")):
        meta = front_matter(path.read_text(encoding="utf-8"))
        if meta.get("draft", "").lower() == "true":
            continue
        missing = [f for f in ("title", "date") if not meta.get(f)]
        if missing:
            print("skip %s: missing %s" % (path.name, ", ".join(missing)))
            continue
        entry = {"slug": path.stem}
        entry.update({f: meta.get(f, "") for f in FIELDS})
        entry["type"] = entry["type"] or "article"
        posts.append(entry)
    posts.sort(key=lambda p: p["date"], reverse=True)
    (POSTS / "posts.json").write_text(json.dumps(posts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote %d posts to posts/posts.json" % len(posts))


if __name__ == "__main__":
    main()
