/**
 * ============================================================================
 * SoulSpace — Breathwork Web Application (BCA Project)
 * Technology: Pure HTML5, CSS3, and Vanilla JavaScript
 * ============================================================================
 * Features:
 * 1. Box Breathing (4s Inhale, 4s Hold, 4s Exhale)
 * 2. Slow Breathing (5s Inhale, 5s Exhale)
 * 3. Exact Breathing Circle Animation Synchronization
 * 4. Overall Session Countdown Timer & Cycle Counter
 * 5. Gentle Phase Audio Cues (Inhale, Hold, Exhale) with Error Handling
 * 6. Sound Toggle and Volume Slider
 * 7. Mood Tracker & LocalStorage Reflection Logging
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // Configuration & Constants
  // --------------------------------------------------------------------------
  const TECHNIQUES = {
    box: {
      name: 'Box Breathing',
      badge: '4-4-4',
      subtext: 'Inhale • Hold • Exhale • Hold',
      phases: [
        { name: 'Breathe In', duration: 4, action: 'inhale', sound: 'inhale' },
        { name: 'Hold',       duration: 4, action: 'hold',   sound: 'hold' },
        { name: 'Breathe Out',duration: 4, action: 'exhale', sound: 'exhale' }
      ]
    },
    slow: {
      name: 'Slow Breathing',
      badge: '5-0-5',
      subtext: 'Gentle 5–0–5 breathing',
      phases: [
        { name: 'Breathe In', duration: 5, action: 'inhale', sound: 'inhale' },
        { name: 'Breathe Out',duration: 5, action: 'exhale', sound: 'exhale' }
      ]
    }
  };

  // State Management
  const state = {
    currentTechnique: 'box',     // 'box' or 'slow'
    sessionMinutes: 5,           // Default 5-minute session
    sessionTotalSeconds: 300,    // 5 * 60
    sessionRemainingSeconds: 300,
    cycleCount: 1,
    
    // Phase timing
    currentPhaseIndex: 0,
    phaseRemainingSeconds: 4,
    
    // Status
    isRunning: false,
    isPaused: false,
    
    // Audio settings
    soundEnabled: true,
    volume: 0.7,
    audioAvailable: true,
    
    // Selected mood
    selectedMood: 'Relaxed'
  };

  // Timer intervals
  let sessionInterval = null;
  let phaseInterval = null;

  // --------------------------------------------------------------------------
  // DOM Elements
  // --------------------------------------------------------------------------
  // Technique Cards
  const cardBox = document.getElementById('cardBox');
  const cardSlow = document.getElementById('cardSlow');

  // Box Breathing Elements
  const orbBox = document.getElementById('orbBox');
  const ringProgressBox = document.getElementById('ringProgressBox');
  const phaseLabelBox = document.getElementById('phaseLabelBox');
  const phaseCounterBox = document.getElementById('phaseCounterBox');
  const cycleBox = document.getElementById('cycleBox');
  const timeDisplayBox = document.getElementById('timeDisplayBox');
  const progressFillBox = document.getElementById('progressFillBox');
  const startBox = document.getElementById('startBox');
  const pauseBox = document.getElementById('pauseBox');
  const resetBox = document.getElementById('resetBox');

  // Slow Breathing Elements
  const orbSlow = document.getElementById('orbSlow');
  const ringProgressSlow = document.getElementById('ringProgressSlow');
  const phaseLabelSlow = document.getElementById('phaseLabelSlow');
  const phaseCounterSlow = document.getElementById('phaseCounterSlow');
  const cycleSlow = document.getElementById('cycleSlow');
  const timeDisplaySlow = document.getElementById('timeDisplaySlow');
  const progressFillSlow = document.getElementById('progressFillSlow');
  const startSlow = document.getElementById('startSlow');
  const pauseSlow = document.getElementById('pauseSlow');
  const resetSlow = document.getElementById('resetSlow');

  // Audio Elements
  const audioInhale = document.getElementById('audioInhale');
  const audioHold = document.getElementById('audioHold');
  const audioExhale = document.getElementById('audioExhale');
  const soundToggle = document.getElementById('soundToggle');
  const toggleStatus = document.getElementById('toggleStatus');
  const volumeSlider = document.getElementById('volumeSlider');
  const audioStatusMsg = document.getElementById('audioStatusMsg');

  // Duration Pills
  const durationPills = document.querySelectorAll('.duration-pill');
  const durationValue = document.getElementById('durationValue');

  // Mood Selection Pills
  const moodPills = document.querySelectorAll('.mood-pill');
  const modalMoodBtns = document.querySelectorAll('.modal-mood-btn');

  // Banner & Modal Elements
  const completionBanner = document.getElementById('completionBanner');
  const reflectionModal = document.getElementById('reflectionModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const reflectionInput = document.getElementById('reflectionInput');
  const btnSaveModal = document.getElementById('btnSaveModal');
  const btnSaveSidebar = document.getElementById('btnSaveSidebar');
  const btnReflectSidebar = document.getElementById('btnReflectSidebar');
  const btnSaveBanner = document.getElementById('btnSaveBanner');
  const btnReflectBanner = document.getElementById('btnReflectBanner');
  const btnJourney = document.getElementById('btnJourney');

  // Mobile Navigation
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMobile = document.getElementById('navMobile');

  // Toast & History
  const toastNotice = document.getElementById('toastNotice');
  const historyList = document.getElementById('historyList');

  // Ring Circumference (2 * PI * r = 2 * PI * 96 ≈ 603.18)
  const RING_CIRCUMFERENCE = 603.18;

  // --------------------------------------------------------------------------
  // Web Audio Gentle Synthesizer (Graceful Ambient Zen Cue System)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playZenTone(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let freq = 432; // Inhale (serene rise)
      if (type === 'hold') freq = 528; // Hold (clarity/stillness)
      if (type === 'exhale') freq = 360; // Exhale (deep grounding)

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const currentVol = Math.max(0.01, state.volume * 0.25);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(currentVol, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {
      console.warn('Web Audio synthesis unavailable:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Audio Initialization & Error Handling
  // --------------------------------------------------------------------------
  function setupAudioFiles() {
    const audioElements = [audioInhale, audioHold, audioExhale];

    audioElements.forEach(audio => {
      if (!audio) return;
      audio.volume = state.volume;

      audio.addEventListener('error', () => {
        state.audioAvailable = false;
        if (audioStatusMsg) {
          audioStatusMsg.textContent = 'Breathing sounds are currently unavailable.';
        }
      });

      audio.load();
    });
  }

  function playPhaseSound(soundType) {
    if (!state.soundEnabled) return;

    let targetAudio = null;
    if (soundType === 'inhale') targetAudio = audioInhale;
    else if (soundType === 'hold') targetAudio = audioHold;
    else if (soundType === 'exhale') targetAudio = audioExhale;

    if (targetAudio && state.audioAvailable) {
      targetAudio.volume = state.volume;
      targetAudio.currentTime = 0;
      const playPromise = targetAudio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playZenTone(soundType);
        });
      }
    } else {
      playZenTone(soundType);
    }
  }

  function pauseAllAudio() {
    [audioInhale, audioHold, audioExhale].forEach(a => {
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Helper: Time Formatter (mm:ss)
  // --------------------------------------------------------------------------
  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');
    return `${paddedMins}:${paddedSecs}`;
  }

  // --------------------------------------------------------------------------
  // Technique Selection Logic
  // --------------------------------------------------------------------------
  function selectTechnique(techKey) {
    if (state.currentTechnique === techKey && (state.isRunning || state.isPaused)) {
      return;
    }

    if (state.isRunning || state.isPaused) {
      resetSession();
    }

    state.currentTechnique = techKey;

    if (techKey === 'box') {
      cardBox.classList.add('active');
      cardBox.setAttribute('aria-checked', 'true');
      cardSlow.classList.remove('active');
      cardSlow.setAttribute('aria-checked', 'false');
    } else {
      cardSlow.classList.add('active');
      cardSlow.setAttribute('aria-checked', 'true');
      cardBox.classList.remove('active');
      cardBox.setAttribute('aria-checked', 'false');
    }

    resetPhaseVariables();
    updateUIViews();
  }

  cardBox.addEventListener('click', (e) => {
    if (e.target.closest('.ctrl-btn')) return;
    selectTechnique('box');
  });

  cardSlow.addEventListener('click', (e) => {
    if (e.target.closest('.ctrl-btn')) return;
    selectTechnique('slow');
  });

  cardBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTechnique('box');
    }
  });

  cardSlow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTechnique('slow');
    }
  });

  // --------------------------------------------------------------------------
  // Breathing Phase & Visual Synchronization Logic
  // --------------------------------------------------------------------------
  function resetPhaseVariables() {
    state.currentPhaseIndex = 0;
    const tech = TECHNIQUES[state.currentTechnique];
    const initialPhase = tech.phases[0];
    state.phaseRemainingSeconds = initialPhase.duration;
  }

  function applyBreathingCircleAnimation(phaseAction, duration) {
    const isBox = state.currentTechnique === 'box';
    const targetOrb = isBox ? orbBox : orbSlow;
    const targetRingProgress = isBox ? ringProgressBox : ringProgressSlow;

    if (!targetOrb) return;

    targetOrb.style.transition = `transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;

    if (phaseAction === 'inhale') {
      targetOrb.style.transform = 'scale(1.22)';
      if (targetRingProgress) {
        targetRingProgress.style.transition = `stroke-dashoffset ${duration}s linear`;
        targetRingProgress.style.strokeDashoffset = '0';
      }
    } else if (phaseAction === 'hold') {
      targetOrb.style.transform = 'scale(1.22)';
      if (targetRingProgress) {
        targetRingProgress.style.transition = 'none';
        targetRingProgress.style.strokeDashoffset = '0';
      }
    } else if (phaseAction === 'exhale') {
      targetOrb.style.transform = 'scale(0.88)';
      if (targetRingProgress) {
        targetRingProgress.style.transition = `stroke-dashoffset ${duration}s linear`;
        targetRingProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;
      }
    }
  }

  function resetCircleVisuals() {
    [orbBox, orbSlow].forEach(orb => {
      if (orb) {
        orb.style.transition = 'transform 0.4s ease';
        orb.style.transform = 'scale(1)';
      }
    });

    [ringProgressBox, ringProgressSlow].forEach(ring => {
      if (ring) {
        ring.style.transition = 'none';
        ring.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;
      }
    });
  }

  function advanceBreathingPhase() {
    const tech = TECHNIQUES[state.currentTechnique];
    const currentPhase = tech.phases[state.currentPhaseIndex];

    if (state.phaseRemainingSeconds === currentPhase.duration) {
      playPhaseSound(currentPhase.sound);
      applyBreathingCircleAnimation(currentPhase.action, currentPhase.duration);
    }

    updatePhaseText(currentPhase.name, state.phaseRemainingSeconds);
    state.phaseRemainingSeconds--;

    if (state.phaseRemainingSeconds < 0) {
      state.currentPhaseIndex++;
      
      if (state.currentPhaseIndex >= tech.phases.length) {
        state.currentPhaseIndex = 0;
        state.cycleCount++;
        updateCycleDisplay();
      }

      const nextPhase = tech.phases[state.currentPhaseIndex];
      state.phaseRemainingSeconds = nextPhase.duration;

      playPhaseSound(nextPhase.sound);
      applyBreathingCircleAnimation(nextPhase.action, nextPhase.duration);
      updatePhaseText(nextPhase.name, state.phaseRemainingSeconds);
    }
  }

  function updatePhaseText(phaseName, countdown) {
    if (state.currentTechnique === 'box') {
      phaseLabelBox.textContent = phaseName;
      phaseCounterBox.textContent = `${countdown} sec`;
    } else {
      phaseLabelSlow.textContent = phaseName;
      phaseCounterSlow.textContent = `${countdown} sec`;
    }
  }

  function updateCycleDisplay() {
    const formattedCycle = `Cycle ${String(state.cycleCount).padStart(2, '0')}`;
    if (state.currentTechnique === 'box') {
      cycleBox.textContent = formattedCycle;
    } else {
      cycleSlow.textContent = formattedCycle;
    }
  }

  // --------------------------------------------------------------------------
  // Session Timer & Controls Logic
  // --------------------------------------------------------------------------
  function startSession() {
    if (state.isRunning) return;

    getAudioContext();

    state.isRunning = true;
    state.isPaused = false;

    toggleControlButtons(true);

    const tech = TECHNIQUES[state.currentTechnique];
    const currentPhase = tech.phases[state.currentPhaseIndex];

    playPhaseSound(currentPhase.sound);
    applyBreathingCircleAnimation(currentPhase.action, currentPhase.duration);
    updatePhaseText(currentPhase.name, state.phaseRemainingSeconds);

    phaseInterval = setInterval(() => {
      advanceBreathingPhase();
    }, 1000);

    sessionInterval = setInterval(() => {
      state.sessionRemainingSeconds--;
      updateTimerUI();

      if (state.sessionRemainingSeconds <= 0) {
        completeSession();
      }
    }, 1000);
  }

  function pauseSession() {
    if (!state.isRunning || state.isPaused) return;

    state.isRunning = false;
    state.isPaused = true;

    clearInterval(phaseInterval);
    clearInterval(sessionInterval);
    pauseAllAudio();

    const currentOrb = state.currentTechnique === 'box' ? orbBox : orbSlow;
    if (currentOrb) {
      const computedTransform = window.getComputedStyle(currentOrb).transform;
      currentOrb.style.transition = 'none';
      currentOrb.style.transform = computedTransform;
    }

    toggleControlButtons(false, true);
  }

  function resetSession() {
    state.isRunning = false;
    state.isPaused = false;

    clearInterval(phaseInterval);
    clearInterval(sessionInterval);
    pauseAllAudio();

    state.sessionRemainingSeconds = state.sessionTotalSeconds;
    state.cycleCount = 1;
    resetPhaseVariables();

    resetCircleVisuals();
    updateUIViews();
    toggleControlButtons(false, false);
  }

  function completeSession() {
    clearInterval(phaseInterval);
    clearInterval(sessionInterval);
    state.isRunning = false;
    state.isPaused = false;
    pauseAllAudio();

    resetCircleVisuals();
    toggleControlButtons(false, false);

    if (completionBanner) {
      completionBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    openReflectionModal();
  }

  function updateTimerUI() {
    const formatted = formatTime(state.sessionRemainingSeconds);
    const progressPercent = Math.min(
      100,
      ((state.sessionTotalSeconds - state.sessionRemainingSeconds) / state.sessionTotalSeconds) * 100
    );

    if (state.currentTechnique === 'box') {
      timeDisplayBox.textContent = formatted;
      progressFillBox.style.width = `${progressPercent}%`;
    } else {
      timeDisplaySlow.textContent = formatted;
      progressFillSlow.style.width = `${progressPercent}%`;
    }
  }

  function updateUIViews() {
    const formatted = formatTime(state.sessionTotalSeconds);
    const tech = TECHNIQUES[state.currentTechnique];
    const initialPhase = tech.phases[0];

    if (state.currentTechnique === 'box') {
      timeDisplayBox.textContent = formatted;
      progressFillBox.style.width = '0%';
      cycleBox.textContent = 'Cycle 01';
      phaseLabelBox.textContent = initialPhase.name;
      phaseCounterBox.textContent = `${initialPhase.duration} sec`;
    } else {
      timeDisplaySlow.textContent = formatted;
      progressFillSlow.style.width = '0%';
      cycleSlow.textContent = 'Cycle 01';
      phaseLabelSlow.textContent = initialPhase.name;
      phaseCounterSlow.textContent = `${initialPhase.duration} sec`;
    }
  }

  function toggleControlButtons(running, paused = false) {
    const isBox = state.currentTechnique === 'box';
    const startBtn = isBox ? startBox : startSlow;
    const pauseBtn = isBox ? pauseBox : pauseSlow;
    const resetBtn = isBox ? resetBox : resetSlow;

    if (running) {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resetBtn.disabled = false;
      startBtn.classList.remove('btn-start');
      startBtn.classList.add('btn-pause');
    } else if (paused) {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
      startBtn.innerHTML = `
        <svg class="ctrl-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>Resume</span>
      `;
      startBtn.classList.add('btn-start');
      startBtn.classList.remove('btn-pause');
    } else {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
      startBtn.innerHTML = `
        <svg class="ctrl-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>Start</span>
      `;
      startBtn.classList.add('btn-start');
      startBtn.classList.remove('btn-pause');
    }
  }

  // Box Breathing Controls
  startBox.addEventListener('click', () => {
    selectTechnique('box');
    startSession();
  });
  pauseBox.addEventListener('click', pauseSession);
  resetBox.addEventListener('click', resetSession);

  // Slow Breathing Controls
  startSlow.addEventListener('click', () => {
    selectTechnique('slow');
    startSession();
  });
  pauseSlow.addEventListener('click', pauseSession);
  resetSlow.addEventListener('click', resetSession);

  // Duration Selector Logic
  durationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      durationPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-checked', 'true');

      const minutes = parseInt(pill.getAttribute('data-minutes'), 10);
      state.sessionMinutes = minutes;
      state.sessionTotalSeconds = minutes * 60;
      state.sessionRemainingSeconds = state.sessionTotalSeconds;
      durationValue.textContent = `${minutes} min`;

      updateUIViews();
      showToast(`Session set to ${minutes} minutes.`);
    });
  });

  // Sound Controls & Volume Slider Logic
  soundToggle.addEventListener('change', () => {
    state.soundEnabled = soundToggle.checked;
    toggleStatus.textContent = state.soundEnabled ? 'On' : 'Off';

    if (!state.soundEnabled) {
      pauseAllAudio();
      showToast('Breathing sound muted.');
    } else {
      showToast('Breathing sound enabled.');
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    state.volume = e.target.value / 100;
    [audioInhale, audioHold, audioExhale].forEach(a => {
      if (a) a.volume = state.volume;
    });
  });

  // Mood Selection Logic
  function setMood(moodName) {
    state.selectedMood = moodName;

    moodPills.forEach(btn => {
      const isMatch = btn.getAttribute('data-mood') === moodName;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    modalMoodBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-mood') === moodName;
      btn.classList.toggle('active', isMatch);
    });

    showToast(`Mood selected: ${moodName}`);
  }

  moodPills.forEach(btn => {
    btn.addEventListener('click', () => {
      setMood(btn.getAttribute('data-mood'));
    });
  });

  modalMoodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setMood(btn.getAttribute('data-mood'));
    });
  });

  // LocalStorage Practices & Reflection Storage
  const STORAGE_KEY = 'soulspace_reflections';

  function savePracticeRecord(reflectionNote = '') {
    const techInfo = TECHNIQUES[state.currentTechnique];
    const timestamp = new Date();
    
    const record = {
      id: 'ss_' + Date.now(),
      activityType: 'Breathwork',
      technique: techInfo.name,
      pattern: techInfo.badge,
      duration: `${state.sessionMinutes} min`,
      mood: state.selectedMood || 'Relaxed',
      reflection: reflectionNote.trim(),
      completed: true,
      timestamp: timestamp.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      rawDate: timestamp.toISOString()
    };

    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      let list = [];
      if (existing) {
        list = JSON.parse(existing);
        if (!Array.isArray(list)) list = [];
      }

      list.unshift(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      renderReflectionsList();
      showToast('Practice saved to My Reflections!');
    } catch (err) {
      console.error('LocalStorage write error:', err);
      showToast('Notice: Could not save to localStorage.');
    }
  }

  function renderReflectionsList() {
    if (!historyList) return;

    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];

      if (!Array.isArray(list) || list.length === 0) {
        historyList.innerHTML = `
          <div class="history-empty">
            Your mindfulness reflections will appear here after saving your practice.
          </div>
        `;
        return;
      }

      const moodIcons = {
        Relaxed: '🙂',
        Refreshed: '🌿',
        Calm: '😌',
        Neutral: '🤍'
      };

      historyList.innerHTML = list.slice(0, 5).map(item => `
        <div class="history-item">
          <div class="history-item-left">
            <span class="history-item-mood" title="${item.mood || 'Mindful'}">
              ${moodIcons[item.mood] || '🌸'}
            </span>
            <div>
              <div class="history-item-tech">${item.technique} (${item.duration})</div>
              <div class="history-item-detail">
                ${item.reflection ? `“${escapeHtml(item.reflection)}”` : 'Completed peaceful breathwork session.'}
              </div>
            </div>
          </div>
          <span class="history-item-time">${item.timestamp}</span>
        </div>
      `).join('');
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Modal Dialog Handlers
  function openReflectionModal() {
    if (!reflectionModal) return;
    reflectionModal.classList.add('open');
    reflectionModal.setAttribute('aria-hidden', 'false');
    if (reflectionInput) reflectionInput.focus();
  }

  function closeReflectionModal() {
    if (!reflectionModal) return;
    reflectionModal.classList.remove('open');
    reflectionModal.setAttribute('aria-hidden', 'true');
  }

  modalCloseBtn.addEventListener('click', closeReflectionModal);

  reflectionModal.addEventListener('click', (e) => {
    if (e.target === reflectionModal) {
      closeReflectionModal();
    }
  });

  btnSaveModal.addEventListener('click', () => {
    const text = reflectionInput ? reflectionInput.value : '';
    savePracticeRecord(text);
    if (reflectionInput) reflectionInput.value = '';
    closeReflectionModal();
  });

  btnSaveSidebar.addEventListener('click', () => {
    savePracticeRecord('');
  });

  btnReflectSidebar.addEventListener('click', () => {
    openReflectionModal();
  });

  btnSaveBanner.addEventListener('click', () => {
    savePracticeRecord('');
  });

  btnReflectBanner.addEventListener('click', () => {
    openReflectionModal();
  });

  if (btnJourney) {
    btnJourney.addEventListener('click', () => {
      startSession();
      showToast('Beginning your breathwork journey...');
    });
  }

  if (hamburgerBtn && navMobile) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      hamburgerBtn.classList.toggle('is-active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navMobile.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        hamburgerBtn.classList.remove('is-active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navMobile.setAttribute('aria-hidden', 'true');
      });
    });
  }

  let toastTimer = null;
  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.classList.add('visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('visible');
    }, 2800);
  }

  setupAudioFiles();
  setMood('Relaxed');
  updateUIViews();
  renderReflectionsList();

  console.log('SoulSpace Breathwork initialized successfully.');
});
