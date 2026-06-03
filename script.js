const data = window.PORTFOLIO_DATA;

const icon = (name, cls = "") =>
  `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ""}></i>`;
const safeUrl = (url) => url && url !== "#";

function button(iconName, url, text = "", solid = false) {
  const href = url || "#";
  const target =
    href.startsWith("mailto:") || href.startsWith("#")
      ? ""
      : ' target="_blank" rel="noopener noreferrer"';
  const labelClass = text ? "" : " btn-icon";
  return `<a class="btn${solid ? " btn-solid" : ""}${labelClass}" href="${href}"${target} aria-label="${text || iconName}">${icon(iconName)}${text ? `<span>${text}</span>` : ""}</a>`;
}

function media(mediaData, footer = false) {
  const cv = button("file-text", `assets${mediaData.cv}`, "Ver hoja de vida");
  const github = safeUrl(mediaData.github)
    ? button("github", mediaData.github, "")
    : "";
  const linkedin = safeUrl(mediaData.likedin)
    ? button("linkedin", mediaData.likedin, "")
    : "";
  return `<div class="media">
    ${button("mail", `mailto:${mediaData.email}`, mediaData.email, true)}
    <div class="media-secondary">${cv}${github}${linkedin}</div>
  </div>`;
}

function heading(text, h1 = false) {
  return h1 ? `<h1>${text}</h1>` : `<h2>${text}</h2>`;
}

function techBadge(t) {
  return `<span class="badge tech-badge"><i class="${t.icon}"></i><span>${t.name}</span></span>`;
}

function smallTechBadge(t) {
  const tech = typeof t === "string" ? { name: t } : t;
  const iconHtml = tech.icon ? `<i class="${tech.icon}"></i>` : "";
  return `<span class="badge badge-gray">${iconHtml}<span>${tech.name}</span></span>`;
}

function infoDetail(item, showIcon = true) {
  const technologies = item.technologies?.length
    ? `<div class="badges">${item.technologies.map(smallTechBadge).join("")}</div>`
    : "";
  const actions = `${safeUrl(item.url) ? button("link", item.url) : ""}${safeUrl(item.github) ? button("github", item.github) : ""}`;
  const image = item.image
    ? `<img class="info-image" src="assets${item.image}" alt="${item.title}">`
    : "";
  const date = item.date ? `<span class="badge">${item.date}</span>` : "";
  const cert = safeUrl(item.certificate)
    ? button("shield-check", item.certificate, "", true)
    : "";
  const iconBadge = showIcon
    ? `<div class="icon-badge">${icon(item.icon)}</div>`
    : "";
  return `<article class="info-item">
    <div class="info-main">
      ${iconBadge}
      <div class="info-copy">
        <p class="info-title">${item.title}</p>
        <p class="info-subtitle">${item.subtitle || ""}</p>
        <p class="info-description">${item.description || ""}</p>
        ${technologies}
        ${actions ? `<div class="info-actions">${actions}</div>` : ""}
      </div>
    </div>
    ${image}
    ${date || cert ? `<div class="info-side">${date}${cert}</div>` : ""}
  </article>`;
}

function infoSection(title, items, emptyText = "", showIcon = true) {
  const content = items?.length
    ? `<div class="info-list">${items.map((item) => infoDetail(item, showIcon)).join("")}</div>`
    : emptyText
      ? `<p class="empty-projects">${emptyText}</p>`
      : `<div class="info-list"></div>`;
  return `<section class="section">${heading(title)}${content}</section>`;
}

function extraCard(extra) {
  const href = safeUrl(extra.url) ? extra.url : "#";
  const target = safeUrl(extra.url)
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
  return `<a class="card" href="${href}"${target}>
    <div class="card-body">
      <p class="card-title">${extra.title}</p>
      <p class="card-description">${extra.description}</p>
    </div>
  </a>`;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `<div class="stack">
    <header class="header">
      <img class="avatar" src="assets${data.avatar}" alt="${data.name}">
      <div class="header-info">
        ${heading(data.name, true)}
        ${heading(data.skill)}
        ${media(data.media)}
      </div>
    </header>

    <section class="section">
      ${heading("Sobre mí")}
      <p class="about-text">${data.about}</p>
    </section>

    <div class="divider"></div>

    <section class="section">
      ${heading("Tecnologías")}
      <div class="tech-grid">${data.technologies.map(techBadge).join("")}</div>
    </section>

    ${infoSection("Experiencia", data.experience)}
    ${infoSection("Proyectos", data.projects, "", false)}
    ${infoSection("Formación", data.training)}

    <section class="section">
      ${heading("Extras")}
      <div class="extra-grid">${data.extras.map(extraCard).join("")}</div>
    </section>

    <div class="divider"></div>

    <footer class="footer">
      <p class="footer-name">${data.name}</p>
      ${media(data.media, true)}
    </footer>
  </div>`;

  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
  }
}

render();

// Image Preview Modal Logic
document.addEventListener("click", (e) => {
  // Open modal
  if (e.target.classList.contains("info-image")) {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("image-modal-content");
    modal.style.display = "flex";
    modalImg.src = e.target.src;
  }

  // Close modal
  if (e.target.id === "image-modal" || e.target.id === "close-modal") {
    document.getElementById("image-modal").style.display = "none";
  }
});
