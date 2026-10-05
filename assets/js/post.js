// Renders a single Markdown post: post.html?slug=<slug>

(function () {
  function parseFrontMatter(text) {
    var meta = {}, body = text;
    var m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (m) {
      m[1].split("\n").forEach(function (line) {
        var i = line.indexOf(":");
        if (i > 0) {
          var v = line.slice(i + 1).replace(/\s#.*$/, "").trim().replace(/^["']|["']$/g, "");
          meta[line.slice(0, i).trim()] = v;
        }
      });
      body = text.slice(m[0].length);
    }
    return { meta: meta, body: body };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById("post");
    var slug = new URLSearchParams(location.search).get("slug");
    if (!slug || !/^[\w-]+$/.test(slug)) {
      el.innerHTML = '<p class="muted">Post not found. <a href="writing.html">Back to writing</a></p>';
      return;
    }

    fetch("posts/" + slug + ".md")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) {
        var parsed = parseFrontMatter(text);
        var meta = parsed.meta;
        var words = parsed.body.split(/\s+/).filter(Boolean).length;
        var minutes = Math.max(1, Math.round(words / 220));
        document.title = (meta.title || slug) + " · Raghava Modhugu";
        el.innerHTML =
          '<header class="post-header">' +
          (meta.type ? '<span class="badge">' + Site.esc(meta.type) + "</span>" : "") +
          '<span class="meta">' + Site.fmtDate(meta.date) + " · " + minutes + " min read</span>" +
          "<h1>" + Site.esc(meta.title || slug) + "</h1></header>" +
          '<div class="post-body">' + marked.parse(parsed.body) + "</div>" +
          '<a class="back" href="writing.html">← All writing</a>';
      })
      .catch(function () {
        el.innerHTML = '<p class="muted">Post not found. <a href="writing.html">Back to writing</a></p>';
      });
  });
})();
