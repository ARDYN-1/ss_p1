/**
 * SoulSpace — Meditation Web Application
 * Vanilla JavaScript implementation for Timer, Ambient Audio, Reflections, and Responsive Navigation.
 * Project: SoulSpace (BCA College Project)
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. STATE MANAGEMENT
  // =========================================================================
  const state = {
    selectedMinutes: 5,        // Default duration: 5 minutes
    totalSeconds: 5 * 60,      // Total seconds for current duration
    remainingSeconds: 5 * 60,  // Remaining seconds in countdown
    timerInterval: null,       // Reference to setInterval
    isRunning: false,          // Timer active state
    isAudioOn: false,          // Ambient sound toggle state
    selectedMood: 'Relaxed',   // Default mood
    guidanceStep: 0            // Step index for rotating guidance
  };

  // Rotating beginner-friendly guidance cues during meditation
  const guidanceMessages = [
    "Focus on your natural breath.",
    "Sit comfortably. Relax your shoulders.",
    "Notice your natural breathing.",
    "Feel the gentle rise and fall of your chest.",
    "If your mind wanders, gently return to your breath.",
    "Let go of tension with every exhalation.",
    "Rest your awareness in this quiet space.",
    "Take one final slow, deep breath."
  ];

  // LocalStorage key for storing saved reflections
  const STORAGE_KEY = 'soulspace_reflections';

  // =========================================================================
  // 2. DOM ELEMENT REFERENCES
  // =========================================================================
  // Timer & Display elements
  const timerDisplay = document.getElementById('timerDisplay');
  const durationBadge = document.getElementById('durationBadge');
  const guidanceCaption = document.getElementById('guidanceCaption');
  const progressFill = document.getElementById('progressFill');
  const meditationCard = document.querySelector('.meditation-card');

  // Timer Control Buttons
  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnReset = document.getElementById('btnReset');

  // Duration Selection Pills
  const durationPills = document.querySelectorAll('.duration-pill');

  // Calming Audio Controls
  const ambientAudio = document.getElementById('ambientAudio');
  ambientAudio.volume = 0.2;
  const audioToggle = document.getElementById('audioToggle');
  const ambientPlayBtn = document.getElementById('ambientPlayBtn');
  const ambientPauseBtn = document.getElementById('ambientPauseBtn');
  const toggleStatusLabel = document.getElementById('toggleStatusLabel');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePct = document.getElementById('volumePct');
  const volumeMuteBtn = document.getElementById('volumeMuteBtn');

  // Mood Selection Elements
  const moodBtns = document.querySelectorAll('.mood-btn');
  const modalMoodBtns = document.querySelectorAll('.modal-mood-btn');

  // Action Buttons
  const btnSavePractice = document.getElementById('btnSavePractice');
  const btnWriteReflection = document.getElementById('btnWriteReflection');

  // Modals & Drawers
  const completionModal = document.getElementById('completionModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const reflectionText = document.getElementById('reflectionText');
  const btnSaveReflectionModal = document.getElementById('btnSaveReflectionModal');
  const btnBackToPractices = document.getElementById('btnBackToPractices');

  const reflectionsListModal = document.getElementById('reflectionsListModal');
  const reflectionsListCloseBtn = document.getElementById('reflectionsListCloseBtn');
  const btnCloseReflectionsList = document.getElementById('btnCloseReflectionsList');
  const btnClearReflections = document.getElementById('btnClearReflections');
  const reflectionsContentArea = document.getElementById('reflectionsContentArea');
  const navReflectionsBtn = document.getElementById('navReflectionsBtn');

  // Toast Notification
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Mobile Navigation Hamburger
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  // =========================================================================
  // 3. SOUND SYNTHESIS & AUDIO FALLBACK (Web Audio API)
  // Ensures serene 432Hz ambient sound even if local MP3 is missing
  // =========================================================================
  let webAudioCtx = null;
  let ambientGainNode = null;
  let ambientOscillators = [];
  let isWebAudioPlaying = false;

  function initWebAudio() {
    if (!webAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        webAudioCtx = new AudioContext();
        ambientGainNode = webAudioCtx.createGain();
        ambientGainNode.gain.setValueAtTime(volumeSlider ? parseFloat(volumeSlider.value) * 0.15 : 0.1, webAudioCtx.currentTime);
        ambientGainNode.connect(webAudioCtx.destination);
      }
    }
  }

  function startWebAudioAmbient() {
    initWebAudio();
    if (!webAudioCtx || isWebAudioPlaying) return;

    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume();
    }

    // Peaceful meditative frequencies (Harmonic drone tuned near 432Hz calming resonance)
    const baseFreqs = [216, 324, 432, 540];
    ambientOscillators = [];

    baseFreqs.forEach((freq, index) => {
      const osc = webAudioCtx.createOscillator();
      const oscGain = webAudioCtx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, webAudioCtx.currentTime);

      // Gentle subtle frequency drift for organic feeling
      const lfo = webAudioCtx.createOscillator();
      const lfoGain = webAudioCtx.createGain();
      lfo.frequency.setValueAtTime(0.1 + index * 0.05, webAudioCtx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, webAudioCtx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.08 / (index + 1), webAudioCtx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(ambientGainNode);

      osc.start();
      ambientOscillators.push({ osc, lfo, oscGain });
    });

    isWebAudioPlaying = true;
  }

  function stopWebAudioAmbient() {
    if (ambientOscillators.length > 0) {
      ambientOscillators.forEach(({ osc, lfo }) => {
        try {
          osc.stop();
          lfo.stop();
          osc.disconnect();
          lfo.disconnect();
        } catch (e) {
          // Ignore if already stopped
        }
      });
      ambientOscillators = [];
    }
    isWebAudioPlaying = false;
  }

  // =========================================================================
  // 4. AUDIO SYSTEM CONTROLLER (HTML5 Audio + Web Audio Fallback)
  // =========================================================================
  function playAmbientSound() {
    if (!state.isAudioOn) return;

    // Apply volume setting
    const currentVol = parseFloat(volumeSlider.value);
    ambientAudio.volume = currentVol;

    // Attempt HTML5 Audio playback first
    const playPromise = ambientAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback gracefully to Web Audio synthesized calming drone
        startWebAudioAmbient();
      });
    }
  }

  function setAmbientPlaying(playing) {
    state.isAudioOn = playing;
    syncAmbientControls(playing);
    if (playing) playAmbientSound();
    else pauseAmbientSound();
  }

  function syncAmbientControls(playing, status = playing ? 'Playing' : 'Paused') {
    toggleStatusLabel.textContent = status;
    ambientPlayBtn.disabled = playing;
    ambientPauseBtn.disabled = !playing;
  }

  ambientPlayBtn.addEventListener('click', () => setAmbientPlaying(true));
  ambientPauseBtn.addEventListener('click', () => setAmbientPlaying(false));

  function pauseAmbientSound() {
    try {
      ambientAudio.pause();
    } catch (e) {}
    stopWebAudioAmbient();
  }

  function resetAmbientSound() {
    try {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
    } catch (e) {}
    stopWebAudioAmbient();
  }

  function updateAudioVolume(vol) {
    ambientAudio.volume = vol;
    if (ambientGainNode && webAudioCtx) {
      ambientGainNode.gain.setValueAtTime(vol * 0.15, webAudioCtx.currentTime);
    }
    volumePct.textContent = `${Math.round(vol * 100)}%`;
  }

  // Audio Toggle Switch Handler
  if (audioToggle) audioToggle.addEventListener('change', (e) => {
    state.isAudioOn = e.target.checked;
    
    if (state.isAudioOn) {
      toggleStatusLabel.textContent = 'On';
      toggleStatusLabel.classList.add('active');
      
      // If meditation is already running, immediately play sound
      if (state.isRunning) {
        playAmbientSound();
      }
    } else {
      toggleStatusLabel.textContent = 'Off';
      toggleStatusLabel.classList.remove('active');
      pauseAmbientSound();
    }
  });

  // Volume Slider Handler
  volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    updateAudioVolume(vol);
  });

  // Volume Mute/Unmute Button Handler
  let previousVolume = 0.2;
  volumeMuteBtn.addEventListener('click', () => {
    if (ambientAudio.volume > 0) {
      previousVolume = ambientAudio.volume;
      volumeSlider.value = 0;
      updateAudioVolume(0);
    } else {
      volumeSlider.value = previousVolume || 0.2;
      updateAudioVolume(previousVolume || 0.2);
    }
  });

  // =========================================================================
  // 5. TIMER CORE LOGIC & FORMATTING
  // =========================================================================
  function formatTime(totalSecs) {
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const padM = String(minutes).padStart(2, '0');
    const padS = String(seconds).padStart(2, '0');
    return `${padM}:${padS}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(state.remainingSeconds);
    
    // Update progress bar
    const elapsed = state.totalSeconds - state.remainingSeconds;
    const progressPercent = (elapsed / state.totalSeconds) * 100;
    progressFill.style.width = `${progressPercent}%`;
  }

  function rotateGuidance() {
    state.guidanceStep = (state.guidanceStep + 1) % guidanceMessages.length;
    guidanceCaption.style.opacity = '0';
    setTimeout(() => {
      guidanceCaption.textContent = guidanceMessages[state.guidanceStep];
      guidanceCaption.style.opacity = '1';
    }, 300);
  }

  function startTimer() {
    if (state.isRunning) return; // Already running

    // If timer was finished, reset before starting
    if (state.remainingSeconds <= 0) {
      resetTimer();
    }

    state.isRunning = true;
    meditationCard.classList.add('is-active');

    // Start ambient sound if toggle is ON
    if (state.isAudioOn) {
      syncAmbientControls(true);
      playAmbientSound();
    }

    // Set countdown interval
    state.timerInterval = setInterval(() => {
      if (state.remainingSeconds > 0) {
        state.remainingSeconds--;
        updateDisplay();

        // Rotate guidance every 15 seconds
        if (state.remainingSeconds % 15 === 0 && state.remainingSeconds > 0) {
          rotateGuidance();
        }
      } else {
        // Timer reached 00:00 - Meditation Complete
        completeMeditation();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!state.isRunning) return;

    state.isRunning = false;
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    meditationCard.classList.remove('is-active');

    // Pause ambient sound simultaneously
    pauseAmbientSound();
    if (state.isAudioOn) syncAmbientControls(false, 'Paused with session');
  }

  function resetTimer() {
    pauseTimer();
    state.remainingSeconds = state.totalSeconds;
    updateDisplay();
    resetAmbientSound();
    
    // Reset guidance caption
    state.guidanceStep = 0;
    guidanceCaption.textContent = guidanceMessages[0];
  }

  function setDuration(minutes) {
    state.selectedMinutes = minutes;
    state.totalSeconds = minutes * 60;
    state.remainingSeconds = state.totalSeconds;

    // Update active pill button
    durationPills.forEach(pill => {
      if (parseInt(pill.dataset.minutes) === minutes) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update duration tracker badge (e.g. "5:00")
    durationBadge.textContent = `${minutes}:00`;

    // Reset timer & audio position without auto-starting
    resetTimer();
  }

  // =========================================================================
  // 6. TIMER COMPLETION & FEEDBACK
  // =========================================================================
  function completeMeditation() {
    // 1. Stop countdown
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.isRunning = false;
    meditationCard.classList.remove('is-active');

    // 2. Automatically stop ambient audio
    pauseAmbientSound();
    resetAmbientSound();
    state.isAudioOn = false;
    syncAmbientControls(false);

    // 3. Update caption
    guidanceCaption.textContent = "🌸 Meditation Complete. Take a peaceful moment.";

    // 4. Show peaceful completion modal without reloading the page
    openCompletionModal();
  }

  // =========================================================================
  // 7. MOOD SELECTION & HARMONIZATION
  // =========================================================================
  function setMood(moodName) {
    state.selectedMood = moodName;

    // Sync card mood buttons
    moodBtns.forEach(btn => {
      if (btn.dataset.mood === moodName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Sync modal mood buttons
    modalMoodBtns.forEach(btn => {
      if (btn.dataset.mood === moodName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 8. LOCAL STORAGE & PRACTICE SAVING
  // =========================================================================
  function getSavedReflections() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
      return [];
    }
  }

  function savePracticeRecord(customReflection = '') {
    const timestampStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newRecord = {
      activityType: "Meditation",
      duration: state.selectedMinutes,
      mood: state.selectedMood,
      reflection: customReflection.trim(),
      completed: true,
      timestamp: timestampStr
    };

    const existingList = getSavedReflections();
    existingList.unshift(newRecord); // Add newest to beginning

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingList));
      showToast(`Practice saved (${state.selectedMinutes} min • ${state.selectedMood})`);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  // =========================================================================
  // 9. MODALS & TOAST INTERACTION
  // =========================================================================
  function openCompletionModal() {
    completionModal.classList.add('is-open');
    completionModal.setAttribute('aria-hidden', 'false');
  }

  function closeCompletionModal() {
    completionModal.classList.remove('is-open');
    completionModal.setAttribute('aria-hidden', 'true');
    reflectionText.value = '';
  }

  function openReflectionsListModal() {
    renderReflectionsList();
    reflectionsListModal.classList.add('is-open');
    reflectionsListModal.setAttribute('aria-hidden', 'false');
  }

  function closeReflectionsListModal() {
    reflectionsListModal.classList.remove('is-open');
    reflectionsListModal.setAttribute('aria-hidden', 'true');
  }

  function renderReflectionsList() {
    const records = getSavedReflections();
    reflectionsContentArea.innerHTML = '';

    if (records.length === 0) {
      reflectionsContentArea.innerHTML = `
        <div class="empty-reflections-note">
          <p>No practice reflections saved yet.</p>
          <p style="font-size: 0.85rem; margin-top: 6px;">Complete a meditation session to record your stillness journey.</p>
        </div>
      `;
      return;
    }

    records.forEach(item => {
      const card = document.createElement('div');
      card.className = 'reflection-item-card';

      const moodEmoji = {
        'Relaxed': '🙂',
        'Refreshed': '🌿',
        'Calm': '😌',
        'Neutral': '🤍'
      }[item.mood] || '🌸';

      card.innerHTML = `
        <div class="reflection-meta-row">
          <span><strong>${item.activityType}</strong> • ${item.duration} minutes</span>
          <span class="reflection-mood-tag">${moodEmoji} ${item.mood}</span>
        </div>
        ${item.reflection ? `<p class="reflection-text-quote">"${escapeHtml(item.reflection)}"</p>` : ''}
        <div class="reflection-meta-row" style="margin-top: 4px;">
          <span>${item.timestamp}</span>
          <span style="color: var(--color-primary-sage);">✓ Completed</span>
        </div>
      `;
      reflectionsContentArea.appendChild(card);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  let toastTimeout = null;
  function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.add('is-visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('is-visible');
    }, 3200);
  }

  // =========================================================================
  // 10. EVENT LISTENERS
  // =========================================================================

  // Timer Control Buttons
  btnStart.addEventListener('click', startTimer);
  btnPause.addEventListener('click', pauseTimer);
  btnReset.addEventListener('click', resetTimer);

  // Duration Selection Pills
  durationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const mins = parseInt(pill.dataset.minutes, 10);
      setDuration(mins);
    });
  });

  // Mood Buttons (Card)
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setMood(btn.dataset.mood);
    });
  });

  // Mood Buttons (Modal)
  modalMoodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setMood(btn.dataset.mood);
    });
  });

  // Card Action: Save Practice
  btnSavePractice.addEventListener('click', () => {
    savePracticeRecord();
  });

  // Card Action: Write a Reflection
  btnWriteReflection.addEventListener('click', () => {
    openCompletionModal();
  });

  // Modal Actions
  modalCloseBtn.addEventListener('click', closeCompletionModal);
  btnBackToPractices.addEventListener('click', closeCompletionModal);

  btnSaveReflectionModal.addEventListener('click', () => {
    const note = reflectionText.value;
    savePracticeRecord(note);
    closeCompletionModal();
  });

  // My Reflections in Navbar (if present)
  if (navReflectionsBtn) {
    navReflectionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openReflectionsListModal();
    });
  }

  reflectionsListCloseBtn.addEventListener('click', closeReflectionsListModal);
  btnCloseReflectionsList.addEventListener('click', closeReflectionsListModal);

  // Clear History
  btnClearReflections.addEventListener('click', () => {
    if (confirm("Are you sure you would like to clear your reflection history?")) {
      localStorage.removeItem(STORAGE_KEY);
      renderReflectionsList();
      showToast("Reflections history cleared.");
    }
  });

  // Close modals on overlay backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === completionModal) closeCompletionModal();
    if (e.target === reflectionsListModal) closeReflectionsListModal();
  });

  // Keyboard accessibility: Escape key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCompletionModal();
      closeReflectionsListModal();
    }
  });

  // Mobile Navigation Hamburger Toggle (if present)
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-mobile-open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when clicking any nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-mobile-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Header "Begin Your Journey" button (if present)
  const btnJourney = document.getElementById('btnJourney');
  if (btnJourney) {
    btnJourney.addEventListener('click', () => {
      startTimer();
      showToast("Beginning your meditation journey...");
    });
  }

  // Initialize display on page load
  updateDisplay();
});
