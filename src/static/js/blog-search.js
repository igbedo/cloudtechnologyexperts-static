(async function () {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();
  const category = (params.get("category") || "").trim();

  const qInput = document.getElementById("q");
  const catHidden = document.getElementById("categoryHidden");
  if (qInput) qInput.value = q;
  if (catHidden) catHidden.value = category;

  const filtersHint = document.getElementById("filtersHint");
  const pageTitle = document.getElementById("pageTitle");

  function setHint(text) {
    if (!filtersHint) return;
    if (!text) {
      filtersHint.hidden = true;
      filtersHint.textContent = "";
      return;
    }
    filtersHint.hidden = false;
    filtersHint.textContent = text;
  }

  const res = await fetch("/search.json", { cache: "no-store" });
  const posts = await res.json();

  // Build categories list
  const categoriesMap = new Map();
  posts.forEach(p => {
    const c = p.category || {};
    if (c.slug) categoriesMap.set(c.slug, c.name || c.slug);
  });

  const categoriesList = document.getElementById("categoriesList");
  if (categoriesList) {
    const items = [];
    items.push(`<li class="${!category ? "active" : ""}"><a href="/blogs/${q ? `?q=${encodeURIComponent(q)}` : ""}">All</a></li>`);
    Array.from(categoriesMap.entries())
      .sort((a,b) => a[1].localeCompare(b[1]))
      .forEach(([slug, name]) => {
        const href = `/blogs/?category=${encodeURIComponent(slug)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
        items.push(`<li class="${category === slug ? "active" : ""}"><a href="${href}">${name}</a></li>`);
      });
    categoriesList.innerHTML = items.join("");
  }

  // Filter posts
  const qLower = q.toLowerCase();
  let filtered = posts.filter(p => {
    const matchesCategory = !category || (p.category && p.category.slug === category);
    if (!matchesCategory) return false;
    if (!q) return true;
    const hay = ((p.title || "") + " " + (p.body_text || "")).toLowerCase();
    return hay.includes(qLower);
  });

  // Headline + hint
  if (pageTitle) {
    if (category && categoriesMap.has(category)) {
      pageTitle.textContent = `Blogs: ${categoriesMap.get(category)}`;
    } else {
      pageTitle.textContent = "Blogs";
    }
  }
  if (q && category) setHint(`Showing results for "${q}" in ${categoriesMap.get(category) || category}`);
  else if (q) setHint(`Showing results for "${q}"`);
  else if (category) setHint(`Showing category: ${categoriesMap.get(category) || category}`);
  else setHint("");

  // Render grid
  const grid = document.getElementById("postsGrid");
  const empty = document.getElementById("emptyState");
  if (!grid) return;

  function postCard(p) {
    const img = p.image ? p.image : "/static/img/blog-placeholder.jpg";
    const catName = (p.category && p.category.name) ? p.category.name : "General";
    const catSlug = (p.category && p.category.slug) ? p.category.slug : "";
    const catHref = `/blogs/?category=${encodeURIComponent(catSlug)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

    const date = p.date || "";
    const author = p.author || "";
    const excerpt = p.excerpt || "";

    return `
      <div class="col-xxl-6 col-xl-6 col-lg-6 col-md-6">
        <div class="blog__wrapper">
          <div class="blog__item white-bg mb-30 transition-3 fix">
            <div class="blog__thumb w-img fix">
              <a href="${p.url}">
                <img src="${img}" alt="${escapeHtml(p.title || "")}">
              </a>
            </div>
            <div class="blog__content">
              <div class="blog__tag">
                <a href="${catHref}">${escapeHtml(catName)}</a>
              </div>
              <h3 class="blog__title"><a href="${p.url}">${escapeHtml(p.title || "")}</a></h3>
              <p style="margin-top:8px; opacity:.85;">${escapeHtml(excerpt)}</p>
              <div class="blog__meta d-flex align-items-center justify-content-between">
                <div class="blog__author d-flex align-items-center">
                  <div class="blog__author-thumb mr-10">
                    ${p.author_image ? `<img src="${p.author_image}" alt="${escapeHtml(author)}">` : ``}
                  </div>
                  <div class="blog__author-info"><h5>${escapeHtml(author)}</h5></div>
                </div>
                <div class="blog__date d-flex align-items-center">
                  <i class="fas fa-clock"></i>
                  <span>${escapeHtml(date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  if (filtered.length === 0) {
    if (empty) empty.hidden = false;
    grid.innerHTML = "";
  } else {
    if (empty) empty.hidden = true;
    grid.innerHTML = filtered.map(postCard).join("");
  }

  // Recent posts (top 5 from full list)
  const recentWrap = document.getElementById("recentPosts");
  if (recentWrap) {
    const recent = posts.slice(0, 5);
    recentWrap.innerHTML = recent.map(r => {
      const img = r.image || "/static/img/blog-placeholder.jpg";
      return `
        <div class="rc__post d-flex align-items-center">
          <div class="rc__thumb mr-20">
            <a href="${r.url}"><img src="${img}" alt="${escapeHtml(r.title || "")}"></a>
          </div>
          <div class="rc__content">
            <div class="rc__meta"><span>${escapeHtml(r.date || "")}</span></div>
            <h6 class="rc__title"><a href="${r.url}">${escapeHtml(r.title || "")}</a></h6>
          </div>
        </div>
      `;
    }).join("");
  }

  // Featured (first featured post)
  const featured = posts.find(p => p.featured);
  const featuredWrap = document.getElementById("featuredWrap");
  const featuredPost = document.getElementById("featuredPost");
  if (featured && featuredWrap && featuredPost) {
    featuredWrap.hidden = false;
    const img = featured.image || "/static/img/blog-placeholder.jpg";
    featuredPost.innerHTML = `
      <div class="rc__post d-flex align-items-center">
        <div class="rc__thumb mr-20">
          <a href="${featured.url}"><img src="${img}" alt="${escapeHtml(featured.title || "")}"></a>
        </div>
        <div class="rc__content">
          <div class="rc__meta"><span>${escapeHtml(featured.date || "")}</span></div>
          <h6 class="rc__title"><a href="${featured.url}">${escapeHtml(featured.title || "")}</a></h6>
        </div>
      </div>
    `;
  }

  // Hook search form to query params
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const qVal = (document.getElementById("q").value || "").trim();
      const url = new URL(window.location.href);
      url.searchParams.delete("page"); // if any
      if (qVal) url.searchParams.set("q", qVal);
      else url.searchParams.delete("q");
      if (category) url.searchParams.set("category", category);
      window.location.href = url.pathname + "?" + url.searchParams.toString();
    });
  }
})();

