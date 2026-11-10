/* Shared helpers for the screen templates (S01–S05).
 * State is kept in localStorage so the screens can be clicked through
 * as a prototype. Replace Store with real API calls later. */

const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem("itss2:" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("itss2:" + key, JSON.stringify(value));
    } catch (e) { /* storage unavailable: prototype still renders */ }
  },
};

/* Routes between screens, matching the screen-flow diagram. */
const Routes = {
  S01: "S01-profile.html",
  S02: "S02-job.html",
  S03: "S03-result.html",
  S04: "S04-journey.html",
  S05: "S05-milestone.html",
};

function go(screen, params) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  window.location.href = Routes[screen] + qs;
}

function param(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function showAlert(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  if (message) $(".alert-msg", el).textContent = message;
  el.classList.add("show");
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("show");
}

/* Marks empty required fields; returns true when all are filled. */
function validateRequired(form) {
  let ok = true;
  $$("[required]", form).forEach((el) => {
    const empty = !String(el.value || "").trim();
    el.classList.toggle("invalid", empty);
    if (empty) ok = false;
  });
  return ok;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* Tag input: type + Enter adds a chip. */
function setupTagInput(input, container, initial) {
  const tags = [...(initial || [])];
  container.classList.add("tags");
  function render() {
    container.innerHTML = tags.map((t, i) =>
      `<span class="tag">${escapeHtml(t)}<span class="x" data-i="${i}">×</span></span>`
    ).join("");
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input.value.trim();
      if (v && !tags.includes(v)) tags.push(v);
      input.value = "";
      render();
    }
  });
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("x")) {
      tags.splice(Number(e.target.dataset.i), 1);
      render();
    }
  });
  render();
  return { get: () => [...tags] };
}

/* Header with screen navigation, injected into <header data-screen="S0x">. */
function renderHeader() {
  const header = $("header[data-screen]");
  if (!header) return;
  const current = header.dataset.screen;
  const items = [
    ["S04", "就職活動の歩み"],
    ["S01", "プロフィール"],
    ["S02", "求人情報"],
    ["S03", "評価結果"],
  ];
  const name = (Store.get("profile", {}) || {}).name || "";
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  header.className = "app-header";
  header.innerHTML = `
    <div class="inner">
      <a class="brand" href="${Routes.S04}"><span class="logo">就</span>ITSS2 就活サポート</a>
      <nav class="app-nav">
        ${items.map(([s, label]) =>
          `<a href="${Routes[s]}" class="${s === current ? "active" : ""}">${label}</a>`
        ).join("")}
      </nav>
      <div class="avatar" title="${escapeHtml(initial)}">${escapeHtml(initial)}</div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", renderHeader);
