(() => {
  const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
  const searchCache = new Map();
  let activePlayer = null;

  function createPoster(videoId, title) {
    const button = document.createElement('button');
    button.className = 'story-poster';
    button.type = 'button';
    button.setAttribute('aria-label', `Play story: ${title}`);
    button.dataset.videoId = videoId;
    button.dataset.storyTitle = title;

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

  function playYouTubeVideo(player, videoId, title) {
    if (!player || !videoIdPattern.test(videoId || '')) return false;
    if (activePlayer && activePlayer !== player && activePlayer.isConnected) {
      activePlayer.replaceChildren(createPoster(activePlayer.dataset.videoId, activePlayer.dataset.storyTitle));
    }

    player.dataset.videoId = videoId;
    player.dataset.storyTitle = title || 'YouTube video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&playsinline=1&rel=0`;
    iframe.title = `${player.dataset.storyTitle} — YouTube player`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
    activePlayer = player;
    return true;
  }

  function stopYouTubeVideo(player) {
    if (player) player.replaceChildren();
    if (activePlayer === player) activePlayer = null;
  }

  async function searchYouTubeStories(query, { signal } = {}) {
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    if (!normalizedQuery) throw new TypeError('Enter a search query.');
    if (searchCache.has(normalizedQuery)) return searchCache.get(normalizedQuery);

    const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(normalizedQuery)}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Search unavailable');
    const payload = await response.json();
    const items = Array.isArray(payload.items)
      ? payload.items.filter((item) => item && videoIdPattern.test(item.videoId || '') && typeof item.title === 'string').slice(0, 6)
      : [];
    searchCache.set(normalizedQuery, items);
    return items;
  }

  function createSearchResult(item, { label = 'SLEEP STORY', cardClass = 'story-card search-result-card' } = {}) {
    if (!item || !videoIdPattern.test(item.videoId || '') || typeof item.title !== 'string') return null;

    const card = document.createElement('article');
    card.className = cardClass;
    const player = document.createElement('div');
    player.className = 'story-player';
    player.dataset.videoId = item.videoId;
    player.dataset.storyTitle = item.title;
    player.append(createPoster(item.videoId, item.title));

    const copy = document.createElement('div');
    copy.className = 'story-copy';
    const meta = document.createElement('div');
    meta.className = 'story-meta';
    const resultLabel = document.createElement('span');
    resultLabel.textContent = label;
    const source = document.createElement('span');
    source.textContent = 'YOUTUBE';
    meta.append(resultLabel, source);
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
    return card;
  }

  function renderSearchResults(items, container, options) {
    container.replaceChildren();
    items.forEach((item) => {
      const card = createSearchResult(item, options);
      if (card) container.append(card);
    });
  }

  window.SoulspaceYouTube = Object.freeze({
    createPoster,
    playYouTubeVideo,
    stopYouTubeVideo,
    searchYouTubeStories,
    renderSearchResults,
  });
})();
