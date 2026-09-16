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
  const image = item.folder
    ? `<img class="info-image" src="assets/${item.folder}/1.png" alt="${item.title}" data-folder="${item.folder}">`
    : item.image
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

// Image gallery modal
const GALLERY_MAX = 30;
const galleryCache = new Map();
const galleryState = {
  images: [],
  index: 0,
};

function projectImagePath(folder, n) {
  return `assets/${folder}/${n}.png`;
}

function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function discoverImages(folder) {
  if (galleryCache.has(folder)) return galleryCache.get(folder);

  const images = [];
  for (let i = 1; i <= GALLERY_MAX; i++) {
    const src = projectImagePath(folder, i);
    if (!(await imageExists(src))) break;
    images.push(src);
  }

  const result = images.length ? images : [projectImagePath(folder, 1)];
  galleryCache.set(folder, result);
  return result;
}

function renderThumbs() {
  const thumbs = document.getElementById("modal-thumbs");
  const total = galleryState.images.length;

  if (total <= 1) {
    thumbs.innerHTML = "";
    thumbs.classList.add("hidden");
    return;
  }

  thumbs.classList.remove("hidden");
  thumbs.innerHTML = galleryState.images
    .map(
      (src, i) =>
        `<button type="button" class="modal-thumb${i === galleryState.index ? " is-active" : ""}" data-index="${i}" aria-label="Imagen ${i + 1}" aria-selected="${i === galleryState.index}">
          <img src="${src}" alt="">
        </button>`
    )
    .join("");

  const active = thumbs.querySelector(".is-active");
  if (active) {
    active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function updateGalleryView() {
  const modalImg = document.getElementById("image-modal-content");
  const prevBtn = document.getElementById("modal-prev");
  const nextBtn = document.getElementById("modal-next");
  const total = galleryState.images.length;
  if (!total) return;

  modalImg.src = galleryState.images[galleryState.index];
  const showNav = total > 1;
  prevBtn.classList.toggle("hidden", !showNav);
  nextBtn.classList.toggle("hidden", !showNav);
  renderThumbs();
}

async function openGallery(folder, startIndex = 0) {
  const modal = document.getElementById("image-modal");
  modal.style.display = "flex";
  galleryState.images = await discoverImages(folder);
  galleryState.index = Math.min(startIndex, galleryState.images.length - 1);
  updateGalleryView();
}

function openSingleImage(src) {
  galleryState.images = [src];
  galleryState.index = 0;
  document.getElementById("image-modal").style.display = "flex";
  updateGalleryView();
}

function closeGallery() {
  document.getElementById("image-modal").style.display = "none";
  galleryState.images = [];
  galleryState.index = 0;
  document.getElementById("modal-thumbs").innerHTML = "";
}

function navigateGallery(delta) {
  const total = galleryState.images.length;
  if (total <= 1) return;
  galleryState.index = (galleryState.index + delta + total) % total;
  updateGalleryView();
}

function goToGalleryIndex(index) {
  if (index < 0 || index >= galleryState.images.length) return;
  galleryState.index = index;
  updateGalleryView();
}

function isGalleryOpen() {
  return document.getElementById("image-modal").style.display === "flex";
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("info-image")) {
    const folder = e.target.dataset.folder;
    if (folder) openGallery(folder, 0);
    else openSingleImage(e.target.src);
    return;
  }

  const thumb = e.target.closest(".modal-thumb");
  if (thumb) {
    goToGalleryIndex(Number(thumb.dataset.index));
    return;
  }

  if (e.target.id === "modal-prev") {
    navigateGallery(-1);
    return;
  }

  if (e.target.id === "modal-next") {
    navigateGallery(1);
    return;
  }

  if (e.target.id === "image-modal" || e.target.id === "close-modal") {
    closeGallery();
  }
});

document.addEventListener("keydown", (e) => {
  if (!isGalleryOpen()) return;
  if (e.key === "Escape") closeGallery();
  if (e.key === "ArrowLeft") navigateGallery(-1);
  if (e.key === "ArrowRight") navigateGallery(1);
});
