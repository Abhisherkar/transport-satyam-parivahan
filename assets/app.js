/**
 * app.js - Main JavaScript for Satyam Parivahan
 * All pages EXCEPT inquiry form (that's in inquiry.js)
 */

// ==================== YEAR IN FOOTER ====================
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// ==================== NAVIGATION ====================
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");

function setNav(open) {
  if (!nav) return;
  if (open) {
    nav.classList.add("open");
  } else {
    nav.classList.remove("open");
  }
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    setNav(open);
  });
}

// Close nav on mobile when clicking outside
const mql = window.matchMedia('(max-width: 640px)');
const header = document.querySelector('.site-header');

function isCollapsible() {
  return mql.matches || (header && header.classList.contains('collapse-desktop'));
}

document.addEventListener("click", e => {
  if (!nav || !nav.classList.contains("open")) return;
  if (!isCollapsible()) return;
  const t = e.target;
  if (nav.contains(t)) return;
  if (navToggle && navToggle.contains(t)) return;
  setNav(false);
});

// ==================== SECTION NAVIGATION (index.html) ====================
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".site-nav a");

function setActive(hash) {
  const id = (hash || "#home").replace("#", "");
  sections.forEach(s => {
    s.classList.toggle("active", s.id === id);
  });
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + id);
  });
  if (nav) {
    nav.classList.remove("open");
  }
  const sec = document.getElementById(id);
  if (sec) {
    sec.classList.add("enter");
    setTimeout(() => sec.classList.remove("enter"), 500);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach(a => {
  a.addEventListener("click", () => {
    setNav(false);
  });
});

window.addEventListener("hashchange", () => setActive(location.hash));
setActive(location.hash || "#home");

// ==================== TABS (About section) ====================
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach(t => {
  t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    panels.forEach(p => {
      p.classList.toggle("active", p.id === "tab-" + t.dataset.tab);
    });
  });
});

// ==================== TRACKING SYSTEM ====================
const trackForm = document.getElementById("trackForm");
const trackResults = document.getElementById("track-results");
const resultsTable = document.getElementById("results-table");
const exportCsvBtn = document.getElementById("export-csv");
const exportPdfBtn = document.getElementById("export-pdf");
const resetBtn = document.getElementById("track-reset");
let currentResults = [];

async function getMockData() {
  try {
    const r = await fetch("assets/data/mockTracking.json");
    if (!r.ok) throw new Error("mock data not found");
    return await r.json();
  } catch {
    const now = new Date().toISOString();
    return {
      "TRK1001": { status: "In Transit", origin: "Gurgaon", destination: "Surat", updated: now },
      "TRK1002": { status: "Delivered", origin: "Ahmedabad", destination: "Kadapa", updated: now },
      "TRK1003": { status: "Pending Pickup", origin: "Mumbai", destination: "Indore", updated: now }
    };
  }
}

function statusClass(s) {
  const t = String(s).toLowerCase();
  if (t.includes("delivered")) return "status-delivered";
  if (t.includes("in transit")) return "status-transit";
  if (t.includes("pending")) return "status-pending";
  if (t.includes("out for delivery")) return "status-out";
  return "status-unknown";
}

function renderResults(rows) {
  const tbody = resultsTable.querySelector("tbody");
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    const tdId = document.createElement("td");
    tdId.textContent = r.id;
    const tdStatus = document.createElement("td");
    const sb = document.createElement("span");
    sb.className = "status-badge " + statusClass(r.status);
    sb.textContent = r.status;
    tdStatus.appendChild(sb);
    const tdOrigin = document.createElement("td");
    tdOrigin.textContent = r.origin;
    const tdDest = document.createElement("td");
    tdDest.textContent = r.destination;
    const tdUpd = document.createElement("td");
    tdUpd.textContent = r.updated;
    tr.append(tdId, tdStatus, tdOrigin, tdDest, tdUpd);
    tbody.appendChild(tr);
  });
  trackResults.hidden = rows.length === 0;
}

function parseConsignments(v) {
  return v.split(",").map(x => x.trim()).filter(x => x.length > 0);
}

function toCsv(rows) {
  const h = ["Consignment", "Status", "Origin", "Destination", "Last Update"];
  const lines = [h.join(",")];
  rows.forEach(r => {
    lines.push([r.id, r.status, r.origin, r.destination, r.updated].map(x => String(x).replaceAll(",", ";")).join(","));
  });
  return lines.join("\n");
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function printTable() {
  const w = window.open("", "_blank");
  if (!w) return;
  const html = `<html><head><title>Track Results</title><style>body{font-family:Inter,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:8px;text-align:left}thead th{background:#eee}</style></head><body>${trackResults.innerHTML}</body></html>`;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

if (trackForm) {
  trackForm.addEventListener("submit", async e => {
    e.preventDefault();
    const d = new FormData(trackForm);
    const cons = String(d.get("consignments") || "");
    const cust = String(d.get("customer") || "").trim();
    const ids = parseConsignments(cons);
    const mock = await getMockData();
    currentResults = ids.map(id => {
      const m = mock[id] || {};
      return {
        id,
        status: m.status || "Not Found",
        origin: m.origin || "-",
        destination: m.destination || "-",
        updated: m.updated || new Date().toISOString()
      };
    });
    renderResults(currentResults);
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    currentResults = [];
    renderResults(currentResults);
  });
}

if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", () => {
    if (!currentResults.length) return;
    const csv = toCsv(currentResults);
    download("track-results.csv", csv, "text/csv");
  });
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", () => {
    if (!currentResults.length) return;
    printTable();
  });
}

// ==================== COUNTERS (Home page) ====================
const counters = document.querySelectorAll(".counter .value");
if (counters.length) {
  counters.forEach(el => {
    const target = Number(el.dataset.target || "0");
    const suffix = String(el.dataset.suffix || "");
    let v = 0;
    const step = Math.max(1, Math.round(target / 120));
    const t = setInterval(() => {
      v += step;
      if (v >= target) {
        v = target;
        clearInterval(t);
      }
      el.textContent = String(v) + suffix;
    }, 20);
  });
}

// ==================== ETA CALCULATOR ====================
const cities = {
  Gurgaon: [28.4595, 77.0266],
  Surat: [21.1702, 72.8311],
  Ahmedabad: [23.0225, 72.5714],
  Kadapa: [14.4673, 78.8242],
  Kamareddy: [18.3258, 78.3578],
  Muniguda: [19.6290, 83.4880],
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  Nashik: [19.9975, 73.7898],
  Indore: [22.7196, 75.8577]
};

function haversine(a, b) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const s = Math.sin;
  const c = Math.cos;
  const h = s(dLat / 2) ** 2 + c(lat1) * c(lat2) * s(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function speedFor(type) {
  if (type === "Parcel") return 55;
  if (type === "Full Load") return 50;
  if (type === "Part Load") return 48;
  if (type === "ODC Project Cargo") return 35;
  if (type === "Container") return 52;
  return 50;
}

function estimateEtaKm(km, type) {
  const sp = speedFor(type);
  const driveH = km / sp;
  const bufferH = type === "ODC Project Cargo" ? 8 : 3;
  const totalH = driveH + bufferH;
  const days = Math.floor(totalH / 24);
  const hours = Math.ceil(totalH % 24);
  return { days, hours };
}

const etaForm = document.getElementById("etaForm");
const etaResult = document.getElementById("eta-result");

if (etaForm && etaResult) {
  etaForm.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(etaForm);
    const o = String(d.get("origin") || "").trim();
    const dest = String(d.get("dest") || "").trim();
    const type = String(d.get("type") || "Full Load");
    if (!cities[o] || !cities[dest]) {
      etaResult.textContent = "Enter valid cities from list.";
      return;
    }
    const km = Math.round(haversine(cities[o], cities[dest]));
    const { days, hours } = estimateEtaKm(km, type);
    etaResult.textContent = `Distance ~ ${km} km • ETA ~ ${days}d ${hours}h (${type})`;
  });
}

// ==================== CLIENTS CAROUSEL ====================
async function loadClients() {
  try {
    const r = await fetch("assets/data/clients.json");
    const data = await r.json();
    const track = document.getElementById("clients-track");
    if (!track) return;
    track.innerHTML = "";
    const items = data.clients;
    items.forEach(c => {
      const name = String(c.name || "");
      const letter = name.replace(/^Client\s+/i, "").trim().toLowerCase();
      const slug = "client-" + (letter || name.toLowerCase().replace(/\s+/g, "-"));
      const a = document.createElement("a");
      a.className = "badge";
      a.href = "clients.html#" + slug;
      a.setAttribute("aria-label", name);
      const img = document.createElement("img");
      img.src = c.logo;
      img.alt = name;
      img.width = 44;
      img.height = 44;
      img.loading = "lazy";
      img.style.borderRadius = "6px";
      img.onerror = () => {
        a.textContent = (name || "").slice(0, 1);
      };
      a.appendChild(img);
      track.appendChild(a);
    });
    track.innerHTML += track.innerHTML;
  } catch {
    const track = document.getElementById("clients-track");
    if (track) {
      track.innerHTML = "";
    }
  }
}

// ==================== CLIENT PAGE HIGHLIGHTING ====================
function initClientPage() {
  const list = document.getElementById("clients-list");
  if (!list) return;
  const hash = String(location.hash || "").replace("#", "");
  const params = new URLSearchParams(location.search);
  const target = hash || String(params.get("client") || "");
  const cards = list.querySelectorAll(".client-card");
  let found = false;
  cards.forEach(card => {
    const name = String(card.dataset.name || "").toLowerCase();
    const id = String(card.id || "").toLowerCase();
    const match = target && (name === target.toLowerCase() || id === target.toLowerCase());
    card.classList.toggle("highlight", !!match);
    if (match && !found) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      found = true;
    }
  });
  const toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// ==================== REVEAL ANIMATIONS ====================
function initReveal() {
  try {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    const selector = [
      ".doc-section",
      ".cards .card",
      ".feature",
      ".counter",
      ".carousel",
      ".contact-grid",
      ".form",
      ".service-item",
      ".hero .hero-text",
      ".hero .hero-media"
    ].join(",");
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add("reveal");
      obs.observe(el);
    });
  } catch {
    // IntersectionObserver not supported
  }
}

function initStickyHeader() {
  try {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('small', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  } catch {}
}

function initCounters() {
  const values = document.querySelectorAll('.counter .value');
  if (!values.length) return;
  try {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = Number(el.dataset.target || 0);
        const suffix = String(el.dataset.suffix || '');
        const start = performance.now();
        const dur = 1200;
        function step(ts) {
          const p = Math.min(1, (ts - start) / dur);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = String(v) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    values.forEach(v => obs.observe(v));
  } catch {}
}


function initTruckRun() {
  try { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch {}
  if (window.innerWidth <= 640) return;
  if (!document.querySelector(".hero")) return;
  const el = document.createElement("div");
  el.className = "truck-runner";
  const img = new Image();
  img.src = "assets/img/truck.svg";
  img.alt = "Truck";
  img.width = 200;
  img.height = 90;
  img.onload = () => { el.appendChild(img); };
  img.onerror = () => {
    const img2 = new Image();
    img2.src = "assets/img/truck.jpg";
    img2.alt = "Truck";
    img2.width = 200;
    img2.height = 90;
    img2.onload = () => { el.appendChild(img2); };
    img2.onerror = () => {
      el.innerHTML = '<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        + '<rect x="14" y="24" width="100" height="46" rx="9" fill="#ffb800" />'
        + '<rect x="114" y="36" width="70" height="32" rx="7" fill="#ffd300" />'
        + '<rect x="126" y="40" width="20" height="18" rx="3" fill="#3e1d00" />'
        + '<circle class="truck-wheel" cx="46" cy="76" r="13" fill="#1b1b1b" />'
        + '<circle class="truck-wheel" cx="146" cy="76" r="13" fill="#1b1b1b" />'
        + '<circle cx="46" cy="76" r="6" fill="#ffd300" />'
        + '<circle cx="146" cy="76" r="6" fill="#ffd300" />'
        + '</svg>';
    };
  };
  document.body.appendChild(el);
  const DURATION = 1600;
  const endAt = Date.now() + DURATION;
  const vw = Math.max(window.innerWidth, 320);
  const startLeft = -200;
  const travel = vw * 1.4 + 200;
  const dustTimer = setInterval(() => {
    const now = Date.now();
    const t = Math.max(0, DURATION - (endAt - now));
    const p = Math.min(1, t / DURATION);
    const e = Math.pow(p, 3);
    const x = startLeft + e * travel;
    const d = document.createElement("div");
    d.className = "dust";
    d.style.left = x - 40 + "px";
    d.style.bottom = 100 + (Math.random() * 8 - 4) + "px";
    d.style.width = 8 + Math.random() * 6 + "px";
    d.style.height = d.style.width;
    document.body.appendChild(d);
    setTimeout(() => { try { d.remove(); } catch {} }, 900);
    if (now > endAt) {
      clearInterval(dustTimer);
    }
  }, 70);
  setTimeout(() => {
    try { el.remove(); } catch {}
  }, DURATION + 400);
}

// ==================== INITIALIZE ====================
document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initStickyHeader();
  initClientPage();
  loadClients();
  initCounters();
  initTruckRun();
});
