(() => {
  const resultsElement = document.querySelector('#search-results');
  const feedbackElement = document.querySelector('#search-feedback');
  const resultsHeading = document.querySelector('#search-results-heading');
  const manualSearchForm = document.querySelector('#manual-search-form');
  const manualSearchInput = document.querySelector('#manual-search-input');
  const youtube = window.SoulspaceYouTube;
  if (!resultsElement || !feedbackElement || !youtube) return;

  let searchController = null;
  let searchSequence = 0;

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
      const items = await youtube.searchYouTubeStories(query, { signal: searchController.signal });
      if (currentSearch !== searchSequence) return;
      youtube.renderSearchResults(items, resultsElement, { label: 'SLEEP STORY' });
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
      if (player) youtube.playYouTubeVideo(player, player.dataset.videoId, player.dataset.storyTitle);
      return;
    }

    const poster = event.target.closest('.story-poster');
    if (poster) {
      const player = poster.closest('.story-player');
      if (player) youtube.playYouTubeVideo(player, player.dataset.videoId, player.dataset.storyTitle);
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
