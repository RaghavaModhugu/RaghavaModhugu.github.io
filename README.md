# Raghava Modhugu — Portfolio

A static site built with plain HTML, CSS and JS. There's no build step and no Node required.

## Preview locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
(Opening the HTML files directly with `file://` won't load posts or publications, because browsers block `fetch` on local files.)

## Write a post
```bash
python3 tools/new_post.py "My Title" --type article   # or --type story
# edit posts/<date>-my-title.md, then remove `draft: true`
python3 tools/build_posts.py                           # refreshes posts/posts.json
```
Posts are Markdown with front-matter (`title`, `date`, `type`, `summary`).

## Update content
- **Publications:** `data/publications.json` (one entry per paper)
- **Work & research:** `work.html`; the PDF is `assets/cv.pdf`
- **Intro / interests / hobbies:** `index.html` (replace the `TODO` hobbies)
- **Photo:** replace `assets/img/profile.svg` (or drop in a `profile.jpg` and update the `<img>` in `index.html`)

## Deploy (GitHub Pages)
1. Create a repo named `<your-github-username>.github.io`.
2. `git init && git add . && git commit -m "Portfolio" && git remote add origin <repo-url> && git push -u origin main`
3. The site goes live at `https://<your-github-username>.github.io`.
