
let stores = [];
let activeCategory = "すべて";
let activeArea = "すべて";
let activeStoreId = null;
let currentPage = 1;
const PAGE_SIZE = 20;
const MAX_MAP_PINS = 80;

const searchInput = document.getElementById("searchInput");
const categoryChips = document.getElementById("categoryChips");
const areaChips = document.getElementById("areaChips");
const resultSummary = document.getElementById("resultSummary");
const storeList = document.getElementById("storeList");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const mapArea = document.getElementById("mapArea");

const detailImage = document.getElementById("detailImage");
const detailBadges = document.getElementById("detailBadges");
const detailName = document.getElementById("detailName");
const detailLead = document.getElementById("detailLead");
const detailAddress = document.getElementById("detailAddress");
const detailHours = document.getElementById("detailHours");
const detailClosed = document.getElementById("detailClosed");
const detailRecommend = document.getElementById("detailRecommend");
const detailPhone = document.getElementById("detailPhone");
const detailSns = document.getElementById("detailSns");
const detailQr = document.getElementById("detailQr");
const detailQrName = document.getElementById("detailQrName");
const snsButton = document.getElementById("snsButton");
const mapButton = document.getElementById("mapButton");

function safeText(value, fallback = "-") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function getCategories() {
  return ["すべて", ...new Set(stores.filter(s => s.published).map(s => s.category).filter(Boolean))];
}

function getAreas() {
  return ["すべて", ...new Set(stores.filter(s => s.published).map(s => s.area).filter(Boolean))];
}

function getFilteredStores() {
  const keyword = searchInput.value.trim().toLowerCase();
  return stores
    .filter(store => store.published)
    .filter(store => activeCategory === "すべて" ? true : store.category === activeCategory)
    .filter(store => activeArea === "すべて" ? true : store.area === activeArea)
    .filter(store => {
      if (!keyword) return true;
      const target = [
        store.id, store.name, store.kana, store.category, store.subcategory,
        store.area, store.areaGroup, store.address, store.recommend, store.description,
        ...(store.tags || [])
      ].join(" ").toLowerCase();
      return target.includes(keyword);
    })
    .sort((a, b) => {
      const p = (a.priority ?? 9999) - (b.priority ?? 9999);
      if (p !== 0) return p;
      return String(a.name || "").localeCompare(String(b.name || ""), "ja");
    });
}

function getPagedStores() {
  const filtered = getFilteredStores();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  return { filtered, totalPages, paged: filtered.slice(start, start + PAGE_SIZE) };
}

function renderChipGroup(container, values, activeValue, onClick) {
  container.innerHTML = "";
  values.forEach(value => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${value === activeValue ? "active" : ""}`;
    button.textContent = value;
    button.addEventListener("click", () => onClick(value));
    container.appendChild(button);
  });
}

function ensureActiveStore(filtered) {
  if (!filtered.some(store => store.id === activeStoreId)) {
    activeStoreId = filtered[0]?.id ?? null;
  }
}

function renderFilters() {
  renderChipGroup(categoryChips, getCategories(), activeCategory, (value) => {
    activeCategory = value;
    currentPage = 1;
    const filtered = getFilteredStores();
    ensureActiveStore(filtered);
    renderAll();
  });

  renderChipGroup(areaChips, getAreas(), activeArea, (value) => {
    activeArea = value;
    currentPage = 1;
    const filtered = getFilteredStores();
    ensureActiveStore(filtered);
    renderAll();
  });
}

function renderStoreList() {
  const { filtered, paged, totalPages } = getPagedStores();
  storeList.innerHTML = "";
  const from = filtered.length === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE + 1);
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);
  resultSummary.textContent = `${filtered.length}件中 ${from}〜${to}件を表示`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;

  if (filtered.length === 0) {
    storeList.innerHTML = '<div class="meta">該当する店舗がありません。</div>';
    return;
  }

  paged.forEach(store => {
    const item = document.createElement("article");
    item.className = `store-item ${store.id === activeStoreId ? "active" : ""}`;
    item.innerHTML = `
      <h3>${safeText(store.name)}</h3>
      <div class="meta">
        ID: ${safeText(store.id)}<br>
        ${safeText(store.category)} / ${safeText(store.area)}<br>
        ${safeText(store.address)}
      </div>
      <div class="badges">
        ${(store.tags || []).slice(0, 3).map(tag => `<span class="badge">${tag}</span>`).join("")}
      </div>
    `;
    item.addEventListener("click", () => {
      activeStoreId = store.id;
      renderAll();
    });
    storeList.appendChild(item);
  });
}

function renderMap() {
  [...mapArea.querySelectorAll(".pin, .map-note")].forEach(el => el.remove());
  const filtered = getFilteredStores();

  filtered.slice(0, MAX_MAP_PINS).forEach(store => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "pin";
    pin.style.left = `${store.mapX ?? 50}%`;
    pin.style.top = `${store.mapY ?? 50}%`;
    pin.style.background = store.id === activeStoreId ? "var(--accent-dark)" : "var(--accent)";
    pin.innerHTML = `${safeText(store.name)}<small>${safeText(store.category, "")}</small>`;
    pin.addEventListener("click", () => {
      activeStoreId = store.id;
      renderAll();
    });
    mapArea.appendChild(pin);
  });

  if (filtered.length > MAX_MAP_PINS) {
    const note = document.createElement("div");
    note.className = "map-note meta";
    note.style.position = "absolute";
    note.style.right = "14px";
    note.style.bottom = "14px";
    note.style.background = "rgba(255,255,255,.92)";
    note.style.padding = "10px 12px";
    note.style.border = "1px solid var(--line)";
    note.style.borderRadius = "12px";
    note.textContent = `地図ピンは ${MAX_MAP_PINS} 件まで表示中です。本番ではクラスタリング対応を推奨します。`;
    mapArea.appendChild(note);
  }
}

function renderDetail() {
  const filtered = getFilteredStores();
  const store = filtered.find(s => s.id === activeStoreId) || filtered[0] || stores[0];
  if (!store) return;
  activeStoreId = store.id;

  detailImage.src = store.image || "https://placehold.co/960x600?text=Store+Image";
  detailImage.alt = `${safeText(store.name)} の画像`;
  detailName.textContent = `${safeText(store.name)}（${safeText(store.id)}）`;
  detailLead.textContent = safeText(store.description);
  detailAddress.textContent = safeText(store.address);
  detailHours.textContent = safeText(store.hours);
  detailClosed.textContent = safeText(store.closed);
  detailRecommend.textContent = safeText(store.recommend);
  detailPhone.textContent = safeText(store.phone);
  detailQr.src = store.qrImage || "https://placehold.co/320x320?text=QR+Code";
  detailQr.alt = `${safeText(store.name)} のQRコード`;
  detailQrName.textContent = store.qrImage || "";
  snsButton.href = store.snsUrl || "#";
  mapButton.href = store.googleMapUrl || store.mapUrl || "#";
  detailSns.innerHTML = store.snsUrl
    ? `<a href="${store.snsUrl}" target="_blank" rel="noopener noreferrer">${store.snsUrl}</a>`
    : "-";

  detailBadges.innerHTML = [
    store.category, store.subcategory, store.area, ...(store.tags || [])
  ]
    .filter(Boolean)
    .map(tag => `<span class="badge">${tag}</span>`)
    .join("");
}

function renderAll() {
  renderFilters();
  renderStoreList();
  renderMap();
  renderDetail();
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  const filtered = getFilteredStores();
  ensureActiveStore(filtered);
  renderAll();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderAll();
  }
});

nextPageBtn.addEventListener("click", () => {
  const { totalPages } = getPagedStores();
  if (currentPage < totalPages) {
    currentPage += 1;
    renderAll();
  }
});

async function loadStores() {
  try {
    const response = await fetch("./data/stores.json", { cache: "no-store" });
    if (!response.ok) throw new Error("stores.json not found");
    const data = await response.json();
    stores = Array.isArray(data) ? data : (data.stores || []);
  } catch (error) {
    console.error("stores.json の読み込みに失敗しました。", error);
    stores = [];
  }

  activeStoreId = stores[0]?.id ?? null;
  renderAll();
}

loadStores();
