(() => {
  const API_BASE = "http://192.168.50.2:3000";
  const LIST_URL = `${API_BASE}/guestbook/list`;
  const POST_URL = `${API_BASE}/guestbook`;

  const form = document.getElementById("guestbook-form");
  const listEl = document.getElementById("guestbook-list");
  const emptyEl = document.getElementById("guestbook-empty");
  const countEl = document.getElementById("guestbook-count");

  if (!form || !listEl) return;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function normalizeEntries(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.list)) return data.list;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.entries)) return data.entries;
    if (Array.isArray(data.guestbook)) return data.guestbook;
    return [];
  }

  function render(entries) {
    if (countEl) countEl.textContent = String(entries.length);

    if (entries.length === 0) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = entries
      .map((entry) => {
        const name = entry.name ?? entry.author ?? entry.nickname ?? "익명";
        const message = entry.message ?? entry.content ?? entry.text ?? "";
        const createdAt = entry.createdAt ?? entry.created_at ?? entry.date ?? entry.time ?? "";
        return `
      <article class="gb-item">
        <header class="gb-item__head">
          <strong class="gb-item__name">${escapeHtml(name)}</strong>
          <time>${escapeHtml(formatDate(createdAt))}</time>
        </header>
        <p class="gb-item__body">${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      </article>`;
      })
      .join("");
  }

  async function loadGuestbook() {
    try {
      const res = await fetch(LIST_URL);
      if (!res.ok) throw new Error(`목록 요청 실패 (${res.status})`);
      const data = await res.json();
      render(normalizeEntries(data));
    } catch (error) {
      console.error(error);
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = "방명록을 불러오지 못했습니다. 서버 연결을 확인해 주세요.";
      }
      listEl.innerHTML = "";
      if (countEl) countEl.textContent = "0";
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = form.elements.namedItem("name");
    const messageInput = form.elements.namedItem("message");
    const name = nameInput && "value" in nameInput ? String(nameInput.value).trim() : "";
    const message = messageInput && "value" in messageInput ? String(messageInput.value).trim() : "";

    if (!name || !message) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) throw new Error(`등록 실패 (${res.status})`);
      form.reset();
      await loadGuestbook();
    } catch (error) {
      console.error(error);
      alert("방명록 등록에 실패했습니다. 서버 연결을 확인해 주세요.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  loadGuestbook();
})();
