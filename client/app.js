(() => {
  const STORAGE_KEY = "eongeum-guestbook";
  const form = document.getElementById("guestbook-form");
  const listEl = document.getElementById("guestbook-list");
  const emptyEl = document.getElementById("guestbook-empty");
  const countEl = document.getElementById("guestbook-count");

  if (!form || !listEl) return;

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function render() {
    const entries = loadEntries();
    if (countEl) countEl.textContent = String(entries.length);

    if (entries.length === 0) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = entries
      .map(
        (entry) => `
      <article class="gb-item" data-id="${escapeHtml(entry.id)}">
        <header class="gb-item__head">
          <strong class="gb-item__name">${escapeHtml(entry.name)}</strong>
          <time datetime="${escapeHtml(entry.createdAt)}">${formatDate(entry.createdAt)}</time>
          <button type="button" class="gb-delete" data-delete="${escapeHtml(entry.id)}" aria-label="삭제">삭제</button>
        </header>
        <p class="gb-item__body">${escapeHtml(entry.message).replace(/\n/g, "<br />")}</p>
      </article>`
      )
      .join("");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.elements.namedItem("name");
    const messageInput = form.elements.namedItem("message");
    const name = nameInput && "value" in nameInput ? String(nameInput.value).trim() : "";
    const message = messageInput && "value" in messageInput ? String(messageInput.value).trim() : "";

    if (!name || !message) return;
    if (name.length > 20 || message.length > 500) return;

    const entries = loadEntries();
    entries.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      message,
      createdAt: new Date().toISOString(),
    });
    saveEntries(entries);
    form.reset();
    render();
  });

  listEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-delete");
    if (!id) return;
    const entries = loadEntries().filter((entry) => entry.id !== id);
    saveEntries(entries);
    render();
  });

  render();
})();
