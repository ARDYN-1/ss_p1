(() => {
  const form = document.querySelector("#journal-form");
  const textarea = document.querySelector("#journal-content");
  const saveButton = document.querySelector("#save-journal");
  const saveLabel = saveButton.querySelector(".journal-save-label");
  const feedback = document.querySelector("#journal-feedback");
  const dateNode = document.querySelector("#today-date");
  const listNode = document.querySelector("#journal-list");
  const countNode = document.querySelector("#journal-count");
  const dialog = document.querySelector("#entry-dialog");
  const dialogTitle = document.querySelector("#entry-dialog-title");
  const dialogBody = document.querySelector("#entry-dialog-body");
  const closeEntry = document.querySelector("#close-entry");
  const pageContent = document.querySelector("#journal-main");
  const authStatus = document.querySelector("#journal-auth-status");
  const signOutButton = document.querySelector("#journal-sign-out");
  const localDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatDate = (value, options = { weekday: "long", month: "long", day: "numeric", year: "numeric" }) => {
    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat(undefined, options).format(parsed);
  };
  const today = localDate();
  dateNode.dateTime = today;
  dateNode.textContent = formatDate(today);

  function setFeedback(message = "", type = "") {
    feedback.textContent = message;
    feedback.classList.toggle("is-error", type === "error");
    feedback.classList.toggle("is-success", type === "success");
  }

  function setListBusy(busy) {
    listNode.setAttribute("aria-busy", String(busy));
  }

  async function readApiResponse(response, fallback) {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof payload?.detail === "string" ? payload.detail : `${fallback} (${response.status})`;
      throw new Error(message);
    }
    return payload;
  }

  function journalErrorMessage(error, fallback) {
    const detail = error instanceof Error ? error.message : "";
    if (/Journal storage is not configured|AWS credentials are not configured|configured DynamoDB journal table was not found|credentials do not have permission/i.test(detail)) {
      return `${detail} Configure AWS_REGION, DYNAMODB_TABLE, and AWS credentials (or an IAM role) for this host. In Replit, set the values in the app environment and Secrets; in Vercel, use Project Settings → Environment Variables.`;
    }
    return fallback;
  }

  function showListState(title, description, actionLabel, action) {
    listNode.replaceChildren();
    const state = document.createElement("div");
    state.className = "journal-state";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = description;
    state.append(heading, text);
    if (actionLabel && action) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = actionLabel;
      button.addEventListener("click", action, { once: true });
      state.append(button);
    }
    listNode.append(state);
  }

  function renderJournals(journals) {
    const ordered = [...journals].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    countNode.textContent = String(ordered.length);
    countNode.setAttribute("aria-label", `${ordered.length} ${ordered.length === 1 ? "journal entry" : "journal entries"}`);
    listNode.replaceChildren();
    setListBusy(false);

    if (ordered.length === 0) {
      showListState("Your pages begin here.", "When you save a journal, it will be waiting for you here.", "", null);
      return;
    }

    const fragment = document.createDocumentFragment();
    ordered.forEach((entry) => {
      const button = document.createElement("button");
      button.className = "journal-entry";
      button.type = "button";
      button.setAttribute("aria-label", `Open journal entry from ${formatDate(entry.date)}`);

      const dateTile = document.createElement("span");
      dateTile.className = "journal-entry-date";
      const parsedDate = new Date(`${entry.date}T12:00:00`);
      const month = Number.isNaN(parsedDate.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { month: "short" }).format(parsedDate);
      const day = Number.isNaN(parsedDate.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(parsedDate);
      dateTile.append(document.createTextNode(month));
      const dayNode = document.createElement("strong");
      dayNode.textContent = day;
      dateTile.append(dayNode);

      const copy = document.createElement("span");
      copy.className = "journal-entry-copy";
      const dateText = document.createElement("time");
      dateText.dateTime = entry.date;
      dateText.textContent = formatDate(entry.date);
      const preview = document.createElement("span");
      preview.className = "journal-entry-preview";
      preview.textContent = typeof entry.preview === "string" && entry.preview.trim() ? entry.preview : "Open this page to revisit your entry.";
      copy.append(dateText, preview);

      const arrow = document.createElement("span");
      arrow.className = "journal-entry-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "›";
      button.append(dateTile, copy, arrow);
      button.addEventListener("click", () => openEntry(entry.date));
      fragment.append(button);
    });
    listNode.append(fragment);
  }

  async function loadJournals() {
    setListBusy(true);
    listNode.innerHTML = '<div class="journal-skeleton" aria-hidden="true"><span></span><span></span></div><div class="journal-skeleton" aria-hidden="true"><span></span><span></span></div><span class="journal-sr-only">Loading previous journals</span>';
    try {
      const response = await fetch("/api/journals/", { credentials: "same-origin", headers: { Accept: "application/json" } });
      if (response.status === 401) {
        window.location.replace("index.html");
        return;
      }
      const result = await readApiResponse(response, "Journal list request failed");
      if (!result || !Array.isArray(result.journals)) throw new Error("Journal list response was not valid");
      renderJournals(result.journals);
    } catch (error) {
      console.error("Unable to load journals:", error);
      countNode.textContent = "—";
      countNode.setAttribute("aria-label", "Journal count unavailable");
      setListBusy(false);
      showListState("Your journals did not load.", journalErrorMessage(error, "Please check your connection and try again."), "Try again", loadJournals);
    }
  }

  function setDialogMessage(message, isError = false, retry) {
    dialogBody.replaceChildren();
    const state = document.createElement("div");
    state.className = "journal-state";
    const text = document.createElement("p");
    text.textContent = message;
    state.append(text);
    if (retry) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Try again";
      button.addEventListener("click", retry, { once: true });
      state.append(button);
    }
    if (isError) state.setAttribute("role", "alert");
    dialogBody.append(state);
  }

  async function openEntry(date) {
    dialogTitle.textContent = formatDate(date);
    dialogBody.textContent = "Loading this page...";
    if (!dialog.open) dialog.showModal();
    try {
      const response = await fetch(`/api/journals/${encodeURIComponent(date)}`, { credentials: "same-origin", headers: { Accept: "application/json" } });
      if (response.status === 401) {
        window.location.replace("index.html");
        return;
      }
      const entry = await readApiResponse(response, "Journal entry request failed");
      if (!entry || typeof entry.content !== "string") throw new Error("Journal entry response was not valid");
      dialogBody.replaceChildren();
      const content = document.createElement("div");
      content.textContent = entry.content;
      dialogBody.append(content);
    } catch (error) {
      console.error("Unable to load journal entry:", error);
      setDialogMessage(journalErrorMessage(error, "This entry could not be loaded. Please try again."), true, () => openEntry(date));
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = textarea.value.trim();
    if (!content) {
      setFeedback("Write a little something before saving.", "error");
      textarea.focus();
      return;
    }
    saveButton.disabled = true;
    saveButton.setAttribute("aria-busy", "true");
    saveLabel.textContent = "Saving...";
    setFeedback("Saving your entry...");
    try {
      const response = await fetch("/api/journals/", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ date: today, content }),
      });
      if (response.status === 401) {
        window.location.replace("index.html");
        return;
      }
      await readApiResponse(response, "Journal save request failed");
      textarea.value = "";
      setFeedback("Your journal has been saved.", "success");
      await loadJournals();
    } catch (error) {
      console.error("Unable to save journal:", error);
      setFeedback(journalErrorMessage(error, "Your entry could not be saved. Please try again."), "error");
    } finally {
      saveButton.disabled = false;
      saveButton.removeAttribute("aria-busy");
      saveLabel.textContent = "Save Journal";
    }
  });

  textarea.addEventListener("input", () => {
    if (feedback.classList.contains("is-error")) setFeedback();
  });
  closeEntry.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  async function startPrivateJournal() {
    try {
      const isAuthenticated = await window.soulspaceRequireAuth("/journal.html");
      if (!isAuthenticated) return;
      const clerk = await window.soulspaceClerkReady;
      authStatus.hidden = true;
      pageContent.hidden = false;
      signOutButton.hidden = false;
      signOutButton.addEventListener("click", async () => {
        signOutButton.disabled = true;
        try {
          await clerk.signOut({ redirectUrl: "index.html" });
        } catch {
          signOutButton.disabled = false;
          authStatus.textContent = "Sign out could not be completed. Please try again.";
          authStatus.classList.add("is-error");
          authStatus.hidden = false;
        }
      });
      await loadJournals();
    } catch {
      authStatus.textContent = "Your secure journal could not be opened. Please refresh and try again.";
      authStatus.classList.add("is-error");
      authStatus.hidden = false;
    }
  }

  startPrivateJournal();
})();