(() => {
  const launch = document.querySelector("#soulguru-launch");
  const overlay = document.querySelector("#soulguru-overlay");
  const dialog = overlay?.querySelector(".soulguru-dialog");
  if (!launch || !overlay || !dialog) return;

  const messages = document.querySelector("#soulguru-messages");
  const welcome = document.querySelector("#soulguru-welcome");
  const form = document.querySelector("#soulguru-form");
  const input = document.querySelector("#soulguru-input");
  const sendButton = document.querySelector("#soulguru-send");
  const errorBox = document.querySelector("#soulguru-error");
  const historyToggle = document.querySelector("#soulguru-history-toggle");
  const historyPanel = document.querySelector("#soulguru-history");
  const historyList = document.querySelector("#soulguru-history-list");
  const HISTORY_LIMIT = 100;
  let conversationId = null;
  let previousFocus = null;
  let oldBodyOverflow = "";
  let busy = false;
  let lastFailedMessage = "";
  let stylePromise;

  function loadStyles() {
    if (stylePromise) return stylePromise;
    stylePromise = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/soulguru.css";
      link.onload = resolve;
      link.onerror = () => reject(new Error("SoulGuru could not be opened. Please refresh and try again."));
      document.head.append(link);
    });
    return stylePromise;
  }

  async function api(path, options = {}) {
    const response = await fetch(`/api/soulguru${path}`, {
      credentials: "same-origin",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        await window.soulspaceRequireAuth?.("/");
        throw new Error("Please sign in to continue with SoulGuru.");
      }
      throw new Error(typeof payload.detail === "string" ? payload.detail : "Your guide is taking a quiet moment. Please try again.");
    }
    return payload;
  }

  function showError(message, retry = false) {
    errorBox.replaceChildren(document.createTextNode(message));
    if (retry && lastFailedMessage) {
      const button = document.createElement("button");
      button.className = "soulguru-retry";
      button.type = "button";
      button.textContent = "Try again";
      button.addEventListener("click", () => sendMessage(lastFailedMessage, false));
      errorBox.append(button);
    }
    errorBox.hidden = false;
  }

  function appendInline(parent, text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        parent.append(strong);
      } else {
        parent.append(document.createTextNode(part));
      }
    });
  }

  function renderText(parent, content) {
    const lines = String(content).split(/\r?\n/);
    let paragraph = [];
    let list = null;
    const flushParagraph = () => {
      if (!paragraph.length) return;
      const p = document.createElement("p");
      appendInline(p, paragraph.join(" "));
      parent.append(p);
      paragraph = [];
    };
    const closeList = () => {
      if (!list) return;
      parent.append(list);
      list = null;
    };
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) { flushParagraph(); closeList(); return; }
      const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
      const bullet = trimmed.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
      if (heading) {
        flushParagraph(); closeList();
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        appendInline(strong, heading[1]); p.append(strong); parent.append(p);
      } else if (bullet) {
        flushParagraph();
        if (!list) list = document.createElement("ul");
        const li = document.createElement("li"); appendInline(li, bullet[1]); list.append(li);
      } else {
        closeList(); paragraph.push(trimmed);
      }
    });
    flushParagraph(); closeList();
  }

  function addMessage(role, content, timestamp = new Date().toISOString()) {
    welcome.hidden = true;
    const row = document.createElement("article");
    row.className = `soulguru-message${role === "user" ? " is-user" : ""}`;
    if (role !== "user") {
      const mark = document.createElement("span");
      mark.className = "soulguru-message-icon";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "✦";
      row.append(mark);
    }
    const bubble = document.createElement("div");
    bubble.className = "soulguru-bubble";
    renderText(bubble, content);
    const time = document.createElement("time");
    time.className = "soulguru-timestamp";
    time.dateTime = timestamp;
    const date = new Date(timestamp);
    time.textContent = Number.isNaN(date.valueOf()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    bubble.append(time);
    row.append(bubble);
    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  function setBusy(value) {
    busy = value;
    sendButton.disabled = value;
    input.disabled = value;
    sendButton.setAttribute("aria-label", value ? "Sending message" : "Send message");
  }

  async function sendMessage(rawText, addUserMessage = true) {
    const text = rawText.trim();
    if (!text || busy) return;
    errorBox.hidden = true;
    lastFailedMessage = "";
    if (addUserMessage) addMessage("user", text);
    input.value = "";
    input.style.height = "auto";
    setBusy(true);
    const typing = document.createElement("article");
    typing.className = "soulguru-message";
    const typingMark = document.createElement("span");
    typingMark.className = "soulguru-message-icon";
    typingMark.setAttribute("aria-hidden", "true");
    typingMark.textContent = "✦";
    const typingBubble = document.createElement("div");
    typingBubble.className = "soulguru-bubble soulguru-typing";
    typingBubble.textContent = "Taking a quiet moment...";
    typing.append(typingMark, typingBubble);
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    try {
      const result = await api("/chat", { method: "POST", body: JSON.stringify({ message: text, conversation_id: conversationId }) });
      conversationId = result.conversation_id;
      addMessage("assistant", result.reply, result.messages?.at(-1)?.timestamp);
    } catch (error) {
      lastFailedMessage = text;
      showError(error instanceof Error ? error.message : "Your guide is taking a quiet moment. Please try again.", true);
    } finally {
      typing.remove();
      setBusy(false);
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function setEmptyConversation() {
    conversationId = null;
    welcome.hidden = false;
    messages.querySelectorAll(".soulguru-message").forEach((message) => message.remove());
    errorBox.hidden = true;
    input.value = "";
    historyPanel.hidden = true;
    historyToggle.setAttribute("aria-expanded", "false");
  }

  async function newConversation() {
    setEmptyConversation();
    try {
      const result = await api("/conversations", { method: "POST", body: "{}" });
      conversationId = result.conversation_id;
    } catch (error) {
      showError(error instanceof Error ? error.message : "A new conversation could not be started.");
    }
    input.focus();
  }

  function dateGroup(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startEntry = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((startToday - startEntry) / 86400000);
    return diffDays <= 0 ? "Today" : diffDays === 1 ? "Yesterday" : "Older";
  }

  function makeHistoryItem(conversation) {
    const row = document.createElement("div");
    row.className = "sg-history-item";
    const open = document.createElement("button");
    open.type = "button"; open.className = "sg-history-open";
    const title = document.createElement("span"); title.className = "sg-history-title";
    title.textContent = conversation.title || "A quiet moment";
    const date = document.createElement("time"); date.className = "sg-history-date";
    date.dateTime = conversation.updated_at || "";
    const parsed = new Date(conversation.updated_at);
    date.textContent = Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    open.append(title, date);
    open.addEventListener("click", () => loadConversation(conversation.conversation_id));
    const remove = document.createElement("button");
    remove.type = "button"; remove.className = "sg-history-delete"; remove.setAttribute("aria-label", `Delete ${title.textContent}`); remove.textContent = "×";
    remove.addEventListener("click", async () => {
      if (!window.confirm(`Delete “${title.textContent}”? This cannot be undone.`)) return;
      try {
        await api(`/conversations/${encodeURIComponent(conversation.conversation_id)}`, { method: "DELETE" });
        if (conversationId === conversation.conversation_id) setEmptyConversation();
        await loadHistory();
      } catch (error) { showError(error instanceof Error ? error.message : "This conversation could not be deleted."); }
    });
    row.append(open, remove);
    return row;
  }

  async function loadHistory() {
    historyList.replaceChildren();
    const loading = document.createElement("p"); loading.className = "sg-history-empty"; loading.textContent = "Gathering your conversations..."; historyList.append(loading);
    try {
      const result = await api("/conversations");
      const conversations = (result.conversations || []).slice(0, HISTORY_LIMIT);
      historyList.replaceChildren();
      if (!conversations.length) {
        const empty = document.createElement("p"); empty.className = "sg-history-empty"; empty.textContent = "Your conversations will appear here after your first message."; historyList.append(empty); return;
      }
      let previousGroup = "";
      conversations.forEach((conversation) => {
        const group = dateGroup(conversation.updated_at);
        if (group !== previousGroup) {
          const heading = document.createElement("h4"); heading.className = "sg-history-group"; heading.textContent = group; historyList.append(heading); previousGroup = group;
        }
        historyList.append(makeHistoryItem(conversation));
      });
    } catch (error) {
      historyList.replaceChildren();
      const failed = document.createElement("p"); failed.className = "sg-history-empty"; failed.textContent = error instanceof Error ? error.message : "History is temporarily unavailable."; historyList.append(failed);
    }
  }

  async function loadConversation(id) {
    try {
      const result = await api(`/conversations/${encodeURIComponent(id)}`);
      const conversation = result.conversation;
      conversationId = conversation.conversation_id;
      welcome.hidden = true;
      messages.querySelectorAll(".soulguru-message").forEach((message) => message.remove());
      (conversation.messages || []).forEach((message) => addMessage(message.role, message.content, message.timestamp));
      historyPanel.hidden = true;
      historyToggle.setAttribute("aria-expanded", "false");
      input.focus();
    } catch (error) { showError(error instanceof Error ? error.message : "This conversation could not be opened."); }
  }

  async function toggleHistory() {
    const opening = historyPanel.hidden;
    historyPanel.hidden = !opening;
    historyToggle.setAttribute("aria-expanded", String(opening));
    if (opening) await loadHistory();
  }

  async function openSoulGuru() {
    try {
      await window.soulspaceClerkReady;
      const clerk = await window.soulspaceClerkReady;
      if (!clerk.isSignedIn) {
        await window.soulspaceRequireAuth?.("/");
        return;
      }
      await loadStyles();
    } catch (error) {
      showError(error instanceof Error ? error.message : "SoulGuru could not be opened. Please try again.");
      return;
    }
    previousFocus = document.activeElement;
    oldBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.hidden = false;
    syncMobileViewport();
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    launch.setAttribute("aria-expanded", "true");
    if (!conversationId) {
      try { conversationId = (await api("/conversations", { method: "POST", body: "{}" })).conversation_id; }
      catch (error) { showError(error instanceof Error ? error.message : "A conversation could not be started."); }
    }
    input.focus();
  }

  function closeSoulGuru() {
    if (overlay.hidden) return;
    overlay.classList.remove("is-open");
    launch.setAttribute("aria-expanded", "false");
    historyPanel.hidden = true;
    historyToggle.setAttribute("aria-expanded", "false");
    overlay.style.removeProperty("--sg-viewport-height");
    overlay.style.removeProperty("top");
    document.body.style.overflow = oldBodyOverflow;
    window.setTimeout(() => { overlay.hidden = true; previousFocus?.focus?.(); }, 240);
  }

  function syncMobileViewport() {
    if (overlay.hidden || !window.visualViewport || !window.matchMedia("(max-width: 560px)").matches) return;
    overlay.style.setProperty("--sg-viewport-height", `${window.visualViewport.height}px`);
    overlay.style.top = `${window.visualViewport.offsetTop}px`;
  }
  window.visualViewport?.addEventListener("resize", syncMobileViewport);
  window.visualViewport?.addEventListener("scroll", syncMobileViewport);

  launch.addEventListener("click", openSoulGuru);
  document.querySelector("#soulguru-close").addEventListener("click", closeSoulGuru);
  document.querySelector("#soulguru-new").addEventListener("click", newConversation);
  historyToggle.addEventListener("click", toggleHistory);
  document.querySelector("#soulguru-history-close").addEventListener("click", () => { historyPanel.hidden = true; historyToggle.setAttribute("aria-expanded", "false"); });
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeSoulGuru(); });
  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) return;
    if (event.key === "Escape") { closeSoulGuru(); return; }
    if (event.key === "Tab") {
      const focusable = [...dialog.querySelectorAll('button:not(:disabled),textarea:not(:disabled),[href], [tabindex]:not([tabindex="-1"])')].filter((element) => !element.closest("[hidden]"));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener("submit", (event) => { event.preventDefault(); sendMessage(input.value); });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 130)}px`; });
  document.querySelectorAll(".soulguru-prompts button").forEach((button) => button.addEventListener("click", () => sendMessage(button.textContent)));
})();
