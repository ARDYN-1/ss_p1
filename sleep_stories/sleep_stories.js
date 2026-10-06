(() => {
  const storyGrid = document.querySelector('.story-grid');
  if (!storyGrid) return;

  let activePlayer = null;

  function createPoster(storyPlayer) {
    const videoId = storyPlayer.dataset.videoId;
    const title = storyPlayer.dataset.storyTitle;
    const button = document.createElement('button');
    button.className = 'story-poster';
    button.type = 'button';
    button.setAttribute('aria-label', `Play story: ${title}`);

    const image = document.createElement('img');
    image.src = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
    image.alt = '';
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

  storyGrid.addEventListener('click', (event) => {
    const poster = event.target.closest('.story-poster');
    if (!poster || !storyGrid.contains(poster)) return;

    const storyPlayer = poster.closest('.story-player');
    if (!storyPlayer) return;

    if (activePlayer && activePlayer !== storyPlayer) {
      activePlayer.replaceChildren(createPoster(activePlayer));
    }

    const videoId = storyPlayer.dataset.videoId;
    const title = storyPlayer.dataset.storyTitle;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&playsinline=1&rel=0`;
    iframe.title = `${title} — YouTube player`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    storyPlayer.replaceChildren(iframe);
    activePlayer = storyPlayer;
  });
})();
