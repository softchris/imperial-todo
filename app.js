(() => {
  "use strict";

  const STORAGE_KEY = "tasks.items.v1";
  const THEME_KEY = "tasks.theme.v1";

  const list = document.getElementById("list");
  const empty = document.getElementById("empty");
  const counter = document.getElementById("counter");
  const form = document.getElementById("addForm");
  const input = document.getElementById("addInput");
  const themeToggle = document.getElementById("themeToggle");
  const filterTabs = document.querySelectorAll(".filters__tab");

  let todos = load();
  let currentFilter = "all";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function add(text) {
    todos.unshift({ id: uid(), text, done: false });
    save();
    render();
  }

  function toggle(id) {
    const t = todos.find((x) => x.id === id);
    if (t) t.done = !t.done;
    save();
    render();
  }

  function remove(id) {
    todos = todos.filter((x) => x.id !== id);
    save();
    render();
  }

  function render() {
    const filtered = todos.filter((t) => {
      if (currentFilter === "active") return !t.done;
      if (currentFilter === "done") return t.done;
      return true;
    });

    list.innerHTML = "";
    filtered.forEach((t) => {
      const li = document.createElement("li");
      li.className = "item" + (t.done ? " done" : "");

      const check = document.createElement("button");
      check.type = "button";
      check.className = "item__check" + (t.done ? " done" : "");
      check.setAttribute("aria-label", t.done ? "Mark active" : "Mark done");
      check.textContent = t.done ? "✓" : "";
      check.addEventListener("click", () => toggle(t.id));

      const span = document.createElement("span");
      span.className = "item__text";
      span.textContent = t.text;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "item__del";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "✕";
      del.addEventListener("click", () => remove(t.id));

      li.append(check, span, del);
      list.appendChild(li);
    });

    const active = todos.filter((t) => !t.done).length;
    counter.textContent = `${active} task${active === 1 ? "" : "s"} left`;
    empty.classList.toggle("hidden", filtered.length > 0);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.querySelector(".theme-toggle__icon").textContent =
      theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem(THEME_KEY, theme);
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentFilter = tab.dataset.filter;
      filterTabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      render();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    add(text);
    input.value = "";
    input.focus();
  });

  themeToggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(next);
  });

  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
  render();
})();
