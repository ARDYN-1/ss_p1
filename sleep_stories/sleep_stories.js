(() => {
  const resultsElement = document.querySelector('#search-results');
  const feedbackElement = document.querySelector('#search-feedback');
  const resultsHeading = document.querySelector('#search-results-heading');
  const manualSearchForm = document.querySelector('#manual-search-form');
  const manualSearchInput = document.querySelector('#manual-search-input');
  const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
  const resultCache = new Map();
  let activePlayer = null;
  let searchController = null;
  let searchSequence = 0;

  function createPoster(storyPlayer) {
    const { videoId, storyTitle: title } = storyPlayer.dataset;
    const button = document.createElement('button');
    button.className = 'story-poster';
    button.type = 'button';
    button.setAttribute('aria-label', `Play story: ${title}`);

    const image = document.createElement('img');
    image.src = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
    image.alt = `${title} thumbnail`;
    image.width = 480;
    image.height = 360;
    image.loading = 'lazy';
    image.decoding = 'async';

    const shade = document.createElement('span');
    shade.className = 'poster-shade';
    shade.setAttribute('aria-hidden', 'true');

    const play = document.createElement('span');
    play.className = 'play-button';
    play.setAttribute('aria-hidden', 'true');
    play.innerHTML = '<svg viewBox="0 0 24 24"><path d="m9 6 10 6-10 6V6Z" /></svg>';
    button.append(image, shade, play);
    return button;
  }

  function playYouTubeVideo(storyPlayer) {
    const { videoId, storyTitle: title } = storyPlayer.dataset;
    if (!videoIdPattern.test(videoId || '')) return;
    if (activePlayer && activePlayer !== storyPlayer && activePlayer.isConnected) {
      activePlayer.replaceChildren(createPoster(activePlayer));
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&playsinline=1&rel=0`;
    iframe.title = `${title} — YouTube player`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    storyPlayer.replaceChildren(iframe);
    activePlayer = storyPlayer;
  }

  function renderSearchResults(items) {
    resultsElement.replaceChildren();
    items.forEach((item) => {
      if (!item || !videoIdPattern.test(item.videoId || '') || typeof item.title !== 'string') return;
      const card = document.createElement('article');
      card.className = 'story-card search-result-card';
      const player = document.createElement('div');
      player.className = 'story-player';
      player.dataset.videoId = item.videoId;
      player.dataset.storyTitle = item.title;
      player.append(createPoster(player));

      const copy = document.createElement('div');
      copy.className = 'story-copy';
      const meta = document.createElement('div');
      meta.className = 'story-meta';
      const label = document.createElement('span');
      label.textContent = 'SLEEP STORY';
      const source = document.createElement('span');
      source.textContent = 'YOUTUBE';
      meta.append(label, source);
      const heading = document.createElement('h3');
      heading.textContent = item.title;
      const channel = document.createElement('p');
      channel.className = 'story-credit';
      channel.textContent = item.channelTitle || 'YouTube creator';
      copy.append(meta, heading, channel);
      if (item.description) {
        const description = document.createElement('p');
        description.textContent = item.description;
        copy.append(description);
      }
      card.append(player, copy);
      resultsElement.append(card);
    });
  }

  function showFeedback(message, state) {
    feedbackElement.textContent = message;
    feedbackElement.dataset.state = state || '';
    feedbackElement.hidden = !message;
  }

  async function searchYouTubeStories(query, scrollToResults = false) {
    searchController?.abort();
    searchController = new AbortController();
    const currentSearch = ++searchSequence;
    resultsElement.replaceChildren();
    showFeedback('Finding stories for you…', 'loading');
    if (scrollToResults) resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      let items = resultCache.get(query);
      if (!items) {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, {
          signal: searchController.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Search unavailable');
        const payload = await response.json();
        items = Array.isArray(payload.items) ? payload.items : [];
        resultCache.set(query, items);
      }
      if (currentSearch !== searchSequence) return;
      renderSearchResults(items);
      resultsHeading.textContent = `Stories for “${query}”`;
      resultsHeading.hidden = false;
      showFeedback(items.length ? '' : 'No stories found for this search.', items.length ? '' : 'empty');
    } catch (error) {
      if (error.name === 'AbortError' || currentSearch !== searchSequence) return;
      showFeedback('Unable to find stories right now. Please try again.', 'error');
    }
  }

  manualSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = manualSearchInput.value.trim();
    if (!query) {
      showFeedback('Enter a story or topic to search.', 'validation');
      manualSearchInput.focus();
      return;
    }
    searchYouTubeStories(query, true);
  });

  document.addEventListener('click', (event) => {
    const featuredButton = event.target.closest('[data-play-featured]');
    if (featuredButton) {
      const player = document.querySelector('.tonight-player');
      if (player) playYouTubeVideo(player);
      return;
    }

    const poster = event.target.closest('.story-poster');
    if (poster) {
      const player = poster.closest('.story-player');
      if (player) playYouTubeVideo(player);
      return;
    }

    const moodButton = event.target.closest('[data-mood-query]');
    const keywordButton = event.target.closest('[data-search-query]');
    const choice = moodButton || keywordButton;
    if (!choice) return;

    if (moodButton) {
      document.querySelectorAll('[data-mood-query]').forEach((button) => button.setAttribute('aria-pressed', String(button === moodButton)));
    } else {
      document.querySelectorAll('[data-mood-query]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
    }
    searchYouTubeStories(choice.dataset.moodQuery || choice.dataset.searchQuery, true);
  });
})();
