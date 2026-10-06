(() => {
  const youtube = window.SoulspaceYouTube;
  const themeButton = document.querySelector('.theme-toggle');
  const playerPanel = document.querySelector('#music-player-panel');
  const player = document.querySelector('#music-player-frame');
  const playerTitle = document.querySelector('#music-player-title');
  const keywordResults = document.querySelector('#keyword-search-results');
  const manualResults = document.querySelector('#manual-search-results');
  const manualForm = document.querySelector('#manual-healing-search');
  const manualInput = document.querySelector('#manual-healing-query');
  if (!youtube || !player || !playerPanel) return;

  function updateTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
      themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      themeButton.querySelector('[data-theme-name]').textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
  }

  updateTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  themeButton?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    updateTheme(next);
    try { localStorage.setItem('soulspace-theme', next); } catch {}
  });

  function openPlayer(videoId, title) {
    if (!youtube.playYouTubeVideo(player, videoId, title)) return;
    playerTitle.textContent = title;
    playerPanel.hidden = false;
    playerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  document.addEventListener('click', (event) => {
    const featured = event.target.closest('[data-featured-video]');
    if (featured) {
      openPlayer(featured.dataset.videoId, featured.dataset.videoTitle);
      return;
    }
    const poster = event.target.closest('.healing-results .story-poster');
    if (poster) openPlayer(poster.dataset.videoId, poster.dataset.storyTitle);
  });

  document.querySelector('#close-music-player')?.addEventListener('click', () => {
    youtube.stopYouTubeVideo(player);
    playerPanel.hidden = true;
  });

  let activeController = null;
  let searchSequence = 0;
  async function search(query, container, feedback, scroll = false) {
    activeController?.abort();
    activeController = new AbortController();
    const sequence = ++searchSequence;
    container.replaceChildren();
    feedback.hidden = false;
    feedback.textContent = 'Finding music for you…';
    feedback.dataset.state = 'loading';
    if (scroll) container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    try {
      const items = await youtube.searchYouTubeStories(query, { signal: activeController.signal });
      if (sequence !== searchSequence) return;
      youtube.renderSearchResults(items, container, { label: 'HEALING MUSIC', cardClass: 'healing-result-card' });
      feedback.textContent = items.length ? '' : 'No music found for this search.';
      feedback.hidden = Boolean(items.length);
      feedback.dataset.state = items.length ? '' : 'empty';
    } catch (error) {
      if (error.name === 'AbortError' || sequence !== searchSequence) return;
      feedback.textContent = 'Unable to find music right now. Please try again.';
      feedback.dataset.state = 'error';
    }
  }

  document.querySelectorAll('[data-healing-query]').forEach((button) => {
    button.addEventListener('click', () => search(button.dataset.healingQuery, keywordResults, document.querySelector('#keyword-feedback'), true));
  });

  manualForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = manualInput.value.trim();
    const feedback = document.querySelector('#manual-feedback');
    if (!query) {
      feedback.textContent = 'Enter a sound or topic to search.';
      feedback.dataset.state = 'validation';
      feedback.hidden = false;
      manualInput.focus();
      return;
    }
    search(query, manualResults, feedback, true);
  });
})();
