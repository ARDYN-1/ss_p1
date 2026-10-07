/**
 * SoulSpace — Gratitude Spin
 * Responsive, serene spiritual wellness interaction logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- CATEGORIES & SUGGESTIONS DATA ---
  const CATEGORIES = [
    {
      id: 'nature',
      name: 'Nature',
      color: '#d5e4cf',
      suggestions: [
        'Take a moment to notice something beautiful around you.',
        'Feel the fresh air, the soothing trees, and the warmth of the sun.',
        'Reflect on a flower, leaf, or cloud that brought you peace today.',
        'Appreciate the steady calm of the earth supporting your footsteps.',
        'Listen to the gentle whispers of wind or birds singing in the distance.'
      ]
    },
    {
      id: 'love',
      name: 'Someone you love',
      color: '#e2d8e8',
      suggestions: [
        'Think of someone who makes you feel safe, seen, and truly valued.',
        'Recall a heartfelt conversation, shared laughter, or comforting smile.',
        'Send quiet gratitude to someone who believed in you when you felt unsure.',
        'Appreciate a small act of kindness a loved one did for you recently.',
        'Hold someone dear in your thoughts and wish peace upon their heart.'
      ]
    },
    {
      id: 'moment',
      name: 'A happy moment',
      color: '#fde5be',
      suggestions: [
        'Recall a sweet moment from today or this week that made you smile.',
        'Celebrate a tiny victory or peaceful pause you experienced.',
        'Remember the comforting feeling of a warm cup of tea or a quiet rest.',
        'Cherish an unexpected pleasant surprise that brightened your spirit.',
        'Savor the memory of a soothing melody or golden morning light.'
      ]
    },
    {
      id: 'learned',
      name: 'Something you learned',
      color: '#d4e2d3',
      suggestions: [
        'Reflect on a gentle lesson that helped you grow with wisdom and patience.',
        'Appreciate a new perspective, book, or idea that opened your heart.',
        'Be thankful for a challenge that taught you resilience and compassion.',
        'Acknowledge a healthy boundary or truth you learned to honor.',
        'Celebrate the quiet progress you have made in understanding yourself.'
      ]
    },
    {
      id: 'have',
      name: 'Something you have',
      color: '#cae1ea',
      suggestions: [
        'Appreciate the safety, warmth, and shelter of your peaceful home.',
        'Give thanks for clean water, nourishing food, and clothes to wear.',
        'Be grateful for the books and tools that make your daily life richer.',
        'Honor your senses — your ability to see beauty, hear music, and breathe.',
        'Cherish the simple everyday comforts that are so easy to overlook.'
      ]
    },
    {
      id: 'yourself',
      name: 'Something about yourself',
      color: '#f8d5cb',
      suggestions: [
        'Honor your resilience — you have overcome every difficult day so far.',
        'Acknowledge the quiet kindness and empathy you offer to the world.',
        'Give yourself credit for your unique talents, creativity, and honesty.',
        'Appreciate your body and breath for carrying you faithfully every day.',
        'Be grateful for your gentle courage to keep growing and seeking peace.'
      ]
    }
  ];

  // --- DOM ELEMENTS ---
  const wheelRotor = document.getElementById('wheel-rotor');
  const centerSpinHub = document.getElementById('center-spin-hub');
  const spinAgainBtn = document.getElementById('spin-again-button');
  const wheelPointer = document.querySelector('.wheel-pointer-container');

  const categoryBadge = document.getElementById('category-badge');
  const categoryBadgeText = document.getElementById('category-badge-text');
  const suggestionPrompt = document.getElementById('suggestion-prompt');
  const inspirationCard = document.getElementById('inspiration-card');

  const gratitudeTextarea = document.getElementById('gratitude-text');
  const saveBtn = document.getElementById('save-button');
  const saveStatus = document.getElementById('save-status');

  const toggleJournalBtn = document.getElementById('toggle-journal-btn');
  const journalDrawer = document.getElementById('journal-drawer');
  const journalEntriesList = document.getElementById('journal-entries-list');
  const journalCount = document.getElementById('journal-count');
  const pageContent = document.getElementById('gratitude-page');
  const authStatus = document.getElementById('gratitude-auth-status');
  const themeToggle = document.getElementById('gratitude-theme-toggle');

  // --- STATE ---
  let isSpinning = false;
  let currentRotation = 0;
  let currentCategoryIndex = 0;
  let audioCtx = null;

  // --- WEB AUDIO API: ZEN CHIME ---
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play peaceful singing bowl / meditation chime
  function playZenChime() {
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      // Soft harmonic frequencies (E and A meditative notes)
      const frequencies = [528, 1056, 1584];
      const gains = [0.12, 0.04, 0.015];

      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(gains[idx], now + 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch (e) {
      // Audio is an enhancement; proceed quietly if unsupported
    }
  }

  // Play gentle wooden tick
  function playTickSound() {
    try {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) { }
  }

  // --- WHEEL ROTATION LOGIC ---
  function spinWheel() {
    if (isSpinning) return;

    initAudio();
    isSpinning = true;

    // Pick a random category index (0 to 5)
    // Make sure it feels dynamic (different or same with probability)
    const nextCategoryIndex = Math.floor(Math.random() * CATEGORIES.length);
    currentCategoryIndex = nextCategoryIndex;

    /**
     * Target angle calculation:
     * Segment i is originally centered at (i * 60°).
     * To bring segment i directly to the top (12 o'clock, 0°),
     * the wheel must be rotated clockwise by: (360 - i * 60) % 360.
     * We add a slight organic jitter within [-12°, +12°] so it feels authentic.
     */
    const sliceAngle = 60;
    const baseTargetMod = (360 - (nextCategoryIndex * sliceAngle)) % 360;
    const jitter = (Math.random() * 20 - 10); // ±10 degrees organic variation
    const targetMod = (baseTargetMod + jitter + 360) % 360;

    // Minimum 5 full spins (1800°) up to 7 full spins (2520°)
    const fullSpins = 5 + Math.floor(Math.random() * 2);
    const currentMod = currentRotation % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) {
      delta += 360;
    }
    const totalDelta = (fullSpins * 360) + delta;
    currentRotation += totalDelta;

    // Apply rotation transition
    wheelRotor.style.transform = `rotate(${currentRotation}deg)`;

    // Pointer ticking effect during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      if (wheelPointer) {
        wheelPointer.classList.toggle('tick');
        playTickSound();
      }
      tickCount++;
      if (tickCount > 18) {
        clearInterval(tickInterval);
        if (wheelPointer) wheelPointer.classList.remove('tick');
      }
    }, 180);

    // Disable buttons temporarily
    spinAgainBtn.style.opacity = '0.6';
    centerSpinHub.style.pointerEvents = 'none';

    // Wait for wheel to settle (matches CSS 4.2s transition)
    setTimeout(() => {
      isSpinning = false;
      spinAgainBtn.style.opacity = '1';
      centerSpinHub.style.pointerEvents = 'auto';

      if (wheelPointer) wheelPointer.classList.remove('tick');

      // Play soothing chime
      playZenChime();

      // Display the chosen category & prompt in the right card
      updateInspiration(nextCategoryIndex);
    }, 4200);
  }

  // --- UPDATE RIGHT CARD WITH SELECTED SUGGESTION ---
  function updateInspiration(categoryIndex) {
    const category = CATEGORIES[categoryIndex];
    if (!category) return;

    // Pick a random prompt from this category's suggestions
    const prompts = category.suggestions;
    const promptText = prompts[Math.floor(Math.random() * prompts.length)];

    // Smooth fade transition
    suggestionPrompt.classList.add('fade');

    setTimeout(() => {
      // Update badge
      categoryBadgeText.textContent = category.name;
      const badgeDot = categoryBadge.querySelector('.badge-dot');
      if (badgeDot) {
        badgeDot.style.backgroundColor = category.color;
      }

      // Update text
      suggestionPrompt.textContent = promptText;
      suggestionPrompt.classList.remove('fade');

      // Gentle card highlight pulse
      inspirationCard.style.boxShadow = '0 16px 40px rgba(45, 80, 55, 0.12)';
      setTimeout(() => {
        inspirationCard.style.boxShadow = '';
      }, 1000);
    }, 280);
  }

  // --- EVENT LISTENERS FOR SPINNING ---
  centerSpinHub.addEventListener('click', spinWheel);
  centerSpinHub.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      spinWheel();
    }
  });

  spinAgainBtn.addEventListener('click', spinWheel);

  // --- AUTHENTICATED GRATITUDE JOURNAL ---
  const THEME_KEY = 'soulspace-theme';
  let savedEntries = [];
  let isSaving = false;

  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    themeToggle.querySelector('.theme-toggle-icon').textContent = dark ? '☀' : '☾';
    themeToggle.querySelector('.theme-toggle-label').textContent = dark ? 'Light mode' : 'Dark mode';
  }

  let initialTheme = 'light';
  try { initialTheme = localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { /* Use light theme if storage is unavailable. */ }
  applyTheme(initialTheme);
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try { localStorage.setItem(THEME_KEY, nextTheme); } catch { /* The current page theme still applies. */ }
  });

  function showStatus(message, type = 'success') {
    saveStatus.textContent = message;
    saveStatus.dataset.status = type;
    saveStatus.classList.add('show');
    window.clearTimeout(showStatus.timeoutId);
    showStatus.timeoutId = window.setTimeout(() => saveStatus.classList.remove('show'), 3600);
  }

  function formatEntryDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recently';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function renderJournalList() {
    const entries = [...savedEntries].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    journalCount.textContent = String(entries.length);
    journalEntriesList.replaceChildren();
    if (entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'journal-empty';
      empty.textContent = 'No reflections saved yet. Write what you are grateful for and click Save!';
      journalEntriesList.append(empty);
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement('article');
      item.className = 'journal-item';
      const copy = document.createElement('div');
      copy.className = 'journal-item-copy';
      const message = document.createElement('p');
      message.className = 'journal-item-text';
      message.textContent = entry.message;
      const date = document.createElement('time');
      date.className = 'journal-item-date';
      date.dateTime = entry.created_at;
      date.textContent = formatEntryDate(entry.created_at);
      copy.append(message, date);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn-delete-entry';
      remove.textContent = '×';
      remove.title = 'Remove reflection';
      remove.setAttribute('aria-label', `Remove gratitude entry from ${formatEntryDate(entry.created_at)}`);
      remove.addEventListener('click', () => deleteEntry(entry.created_at, remove));
      item.append(copy, remove);
      journalEntriesList.append(item);
    });
  }

  async function responseError(response, fallback) {
    if (response.status === 401) {
      await window.soulspaceRequireAuth('/Gratitude/gratitude.html');
      return new Error('Please sign in to continue.');
    }
    return new Error(fallback);
  }

  async function loadGratitude() {
    journalEntriesList.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/gratitude/', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (!response.ok) throw await responseError(response, 'Your gratitude entries could not be loaded. Please try again.');
      const result = await response.json();
      if (!result || !Array.isArray(result.entries)) throw new Error('Your gratitude entries could not be loaded. Please try again.');
      savedEntries = result.entries;
      renderJournalList();
    } catch (error) {
      journalEntriesList.replaceChildren();
      const state = document.createElement('p');
      state.className = 'journal-empty';
      state.textContent = error.message || 'Your gratitude entries could not be loaded. Please try again.';
      journalEntriesList.append(state);
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'gratitude-history-retry';
      retry.textContent = 'Try again';
      retry.addEventListener('click', loadGratitude, { once: true });
      journalEntriesList.append(retry);
      console.warn('Unable to load gratitude history.');
    } finally {
      journalEntriesList.removeAttribute('aria-busy');
    }
  }

  async function deleteEntry(createdAt, button) {
    button.disabled = true;
    try {
      const response = await fetch(`/api/gratitude/${encodeURIComponent(createdAt)}`, {
        method: 'DELETE', credentials: 'same-origin', headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw await responseError(response, 'Unable to remove that gratitude entry right now. Please try again.');
      savedEntries = savedEntries.filter((entry) => entry.created_at !== createdAt);
      renderJournalList();
      showStatus('Gratitude entry removed.', 'success');
    } catch (error) {
      button.disabled = false;
      showStatus(error.message || 'Unable to remove that gratitude entry right now. Please try again.', 'error');
    }
  }

  saveBtn.addEventListener('click', async () => {
    const message = gratitudeTextarea.value.trim();
    if (!message) {
      showStatus('Please write a reflection to save.', 'error');
      gratitudeTextarea.focus();
      return;
    }
    if (message.length > 3000) {
      showStatus('Your reflection is too long to save. Please shorten it.', 'error');
      gratitudeTextarea.focus();
      return;
    }
    if (isSaving) return;

    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.querySelector('span').textContent = 'Saving…';
    try {
      const response = await fetch('/api/gratitude/', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw await responseError(response, 'Unable to save your gratitude right now. Please try again.');
      const result = await response.json();
      if (!result?.success || !result.entry?.created_at) throw new Error('Unable to save your gratitude right now. Please try again.');

      savedEntries.unshift(result.entry);
      renderJournalList();
      gratitudeTextarea.value = '';
      showStatus('Saved to your gratitude journal.', 'success');
      const drawerWasHidden = journalDrawer.hasAttribute('hidden');
      journalDrawer.removeAttribute('hidden');
      toggleJournalBtn.setAttribute('aria-expanded', 'true');
      if (drawerWasHidden) journalDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
      showStatus(error.message || 'Unable to save your gratitude right now. Please try again.', 'error');
    } finally {
      isSaving = false;
      saveBtn.disabled = false;
      saveBtn.querySelector('span').textContent = 'Save';
    }
  });

  async function initializeProtectedPage() {
    try {
      const authenticated = await window.soulspaceRequireAuth('/Gratitude/gratitude.html');
      if (!authenticated) return;
      pageContent.hidden = false;
      document.querySelector('.quotes-section').hidden = false;
      authStatus.hidden = true;
      await loadGratitude();
    } catch {
      authStatus.textContent = 'Your gratitude space could not be opened. Please refresh and try again.';
    }
  }

  // Toggle Journal Drawer
  toggleJournalBtn.addEventListener('click', () => {
    const isHidden = journalDrawer.hasAttribute('hidden');
    if (isHidden) {
      journalDrawer.removeAttribute('hidden');
      toggleJournalBtn.setAttribute('aria-expanded', 'true');
    } else {
      journalDrawer.setAttribute('hidden', '');
      toggleJournalBtn.setAttribute('aria-expanded', 'false');
    }
  });

  initializeProtectedPage();
});
