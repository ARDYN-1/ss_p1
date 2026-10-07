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

  // --- LOCAL STORAGE GRATITUDE JOURNAL ---
  const STORAGE_KEY = 'soulspace_gratitude_entries';

  function getSavedEntries() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEntry(text, categoryName) {
    const entries = getSavedEntries();
    const newEntry = {
      id: Date.now(),
      text: text.trim(),
      category: categoryName || CATEGORIES[currentCategoryIndex].name,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    entries.unshift(newEntry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) { }
    renderJournalList();
  }

  function deleteEntry(id) {
    let entries = getSavedEntries();
    entries = entries.filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) { }
    renderJournalList();
  }

  function renderJournalList() {
    const entries = getSavedEntries();
    journalCount.textContent = entries.length;

    if (entries.length === 0) {
      journalEntriesList.innerHTML = `
        <p class="journal-empty">No reflections saved yet today. Write what you are grateful for and click Save!</p>
      `;
      return;
    }

    journalEntriesList.innerHTML = entries.map(entry => `
      <div class="journal-item" data-id="${entry.id}">
        <div style="flex: 1;">
          <p class="journal-item-text">${escapeHtml(entry.text)}</p>
          <span class="journal-item-date">${entry.date} &bull; <em>${escapeHtml(entry.category)}</em></span>
        </div>
        <button type="button" class="btn-delete-entry" data-id="${entry.id}" title="Remove reflection">&times;</button>
      </div>
    `).join('');

    // Attach delete listeners
    journalEntriesList.querySelectorAll('.btn-delete-entry').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
        deleteEntry(id);
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Save Button Click Handler
  saveBtn.addEventListener('click', () => {
    const text = gratitudeTextarea.value.trim();

    if (!text) {
      showStatus('Please write a reflection to save 🌿', '#8a4c4c');
      gratitudeTextarea.focus();
      return;
    }

    const currentCat = CATEGORIES[currentCategoryIndex].name;
    saveEntry(text, currentCat);

    showStatus('Saved to your journal 🌿', '#254737');

    // Subtle feedback animation on button
    saveBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      saveBtn.style.transform = '';
    }, 150);
  });

  function showStatus(message, color) {
    saveStatus.textContent = message;
    saveStatus.style.color = color;
    saveStatus.classList.add('show');

    setTimeout(() => {
      saveStatus.classList.remove('show');
    }, 3200);
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

  // Initialize saved journal reflections on page load
  renderJournalList();
});
