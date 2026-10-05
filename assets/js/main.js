// Shared behaviour: header/footer, theme toggle, post lists, publications.

(function () {
  var NAV = [
    ["index.html", "Home"],
    ["writing.html", "Writing"],
    ["work.html", "Work"]
  ];

  // ---------- Theme ----------
  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var saved = storedTheme();
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  // ---------- Header / footer ----------
  function renderChrome() {
    var page = location.pathname.split("/").pop() || "index.html";
    if (page === "post.html") page = "writing.html";
    var links = NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === page ? ' class="active"' : "") + ">" + n[1] + "</a>";
    }).join("");

    var header = document.getElementById("site-header");
    if (header) {
      header.className = "site-header";
      header.innerHTML =
        '<div class="container"><a class="brand" href="index.html">Raghava Modhugu</a>' +
        "<nav>" + links +
        '<button class="theme-toggle" aria-label="Toggle dark mode"></button></nav></div>';
      var btn = header.querySelector(".theme-toggle");
      var paint = function () { btn.textContent = currentTheme() === "dark" ? "☀" : "☾"; };
      paint();
      btn.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
        paint();
      });
    }

    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = '<div class="container">© ' + new Date().getFullYear() +
        ' Raghava Modhugu · <a href="mailto:nagendra.raghava@gmail.com">Email</a> · ' +
        '<a href="https://github.com/RaghavaModhugu" target="_blank" rel="noopener">GitHub</a> · ' +
        '<a href="https://www.linkedin.com/in/raghavamodhugu" target="_blank" rel="noopener">LinkedIn</a> · ' +
        '<a href="https://scholar.google.com/citations?user=P3UdhnsAAAAJ" target="_blank" rel="noopener">Scholar</a></div>';
    }
  }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  window.Site = { esc: esc, fmtDate: fmtDate };

  function postItem(p) {
    return '<div class="item"><span class="badge">' + esc(p.type) + "</span>" +
      '<span class="meta">' + fmtDate(p.date) + "</span>" +
      '<h3><a href="post.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + "</a></h3>" +
      (p.summary ? '<p class="muted" style="margin:.2rem 0 0">' + esc(p.summary) + "</p>" : "") +
      "</div>";
  }

  // ---------- Post lists (home + writing page) ----------
  function renderPosts() {
    var latest = document.getElementById("latest-posts");
    var list = document.getElementById("post-list");
    if (!latest && !list) return;

    fetch("posts/posts.json")
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        posts.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
        if (latest) {
          latest.innerHTML = posts.length
            ? posts.slice(0, 3).map(postItem).join("")
            : '<p class="muted">Nothing published yet.</p>';
        }
        if (list) {
          var draw = function (type) {
            var shown = posts.filter(function (p) { return type === "all" || p.type === type; });
            list.innerHTML = shown.length ? shown.map(postItem).join("")
              : '<p class="muted">Nothing here yet.</p>';
          };
          var buttons = document.querySelectorAll(".filters button");
          Array.prototype.forEach.call(buttons, function (b) {
            b.addEventListener("click", function () {
              Array.prototype.forEach.call(buttons, function (x) { x.classList.remove("active"); });
              b.classList.add("active");
              draw(b.getAttribute("data-type"));
            });
          });
          draw("all");
        }
      })
      .catch(function () {
        var msg = '<p class="muted">Could not load posts. Serve the site over HTTP (see README).</p>';
        if (latest) latest.innerHTML = msg;
        if (list) list.innerHTML = msg;
      });
  }

  // ---------- Publications ----------
  function renderPublications() {
    var el = document.getElementById("publications");
    if (!el) return;
    fetch("data/publications.json")
      .then(function (r) { return r.json(); })
      .then(function (pubs) {
        pubs.sort(function (a, b) { return b.year - a.year; });
        var html = "", lastYear = null;
        pubs.forEach(function (p) {
          if (p.year !== lastYear) { html += '<div class="year">' + p.year + "</div>"; lastYear = p.year; }
          var authors = esc(p.authors).replace(/(R(aghava)? Modhugu|D\.? ?N\.? ?R\.? ?K\.? Modhugu)/g, "<strong>$1</strong>");
          var links = (p.links || []).map(function (l) {
            return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">[' + esc(l.label) + "]</a>";
          }).join("");
          html += '<div class="item"><h3><span class="badge">' + esc(p.venue_short) + "</span>" + esc(p.title) + "</h3>" +
            '<div class="authors">' + authors + "</div>" +
            '<div class="meta">' + esc(p.venue) + (p.note ? " · " + esc(p.note) : "") + "</div>" +
            (links ? '<div class="pub-links">' + links + "</div>" : "") + "</div>";
        });
        el.innerHTML = html;
      })
      .catch(function () {
        el.innerHTML = '<p class="muted">Could not load publications. Serve the site over HTTP (see README).</p>';
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderChrome();
    renderPosts();
    renderPublications();
  });
})();
