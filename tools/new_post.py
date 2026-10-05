#!/usr/bin/env python3
"""Create a new post stub.

Usage: python3 tools/new_post.py "My Title" [--type article|story]
"""
import argparse
import datetime
import pathlib
import re

POSTS = pathlib.Path(__file__).resolve().parent.parent / "posts"

parser = argparse.ArgumentParser()
parser.add_argument("title")
parser.add_argument("--type", choices=["article", "story"], default="article")
args = parser.parse_args()

today = datetime.date.today().isoformat()
slug = today + "-" + re.sub(r"[^a-z0-9]+", "-", args.title.lower()).strip("-")
path = POSTS / (slug + ".md")
if path.exists():
    raise SystemExit("already exists: " + str(path))

path.write_text(
    "---\ntitle: %s\ndate: %s\ntype: %s\nsummary: \ndraft: true\n---\n\nStart writing here.\n"
    % (args.title, today, args.type),
    encoding="utf-8",
)
print("created " + str(path.relative_to(POSTS.parent)))
print("remove 'draft: true' when ready, then run: python3 tools/build_posts.py")
