// GitHub Pages can't list a folder, so discover MP4s from this public repo's API.
// Load order: fresh cache -> stale cache (refreshed in the background) -> built-in fallback.
(() => {
  'use strict';

  const OWNER = 'kijnreyyca-bot';
  const REPO = 'Frame';
  const BRANCH = 'main';
  const DIR = 'videos';
  const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}?ref=${BRANCH}`;

  const CACHE_KEY = `frame:library:${OWNER}/${REPO}:v1`;
  const CACHE_TTL_MS = 5 * 60 * 1000; // unauthenticated API limit is 60 requests/hour per visitor
  const FETCH_TIMEOUT_MS = 8000;
  const DESCRIPTION = 'MP4 video in your shared library.';

  // First matching rule wins; anything else lands in DEFAULT_CATEGORY.
  const CATEGORY_RULES = [{ match: /sugarrushsean/i, category: 'Sugarrushsean' }];
  const DEFAULT_CATEGORY = 'Other';

  // Used only when there is no cache and the API is unreachable.
  const FALLBACK_FILES = [
    { name: 'I Cannot Believe This Guy Talks To His Sister Like This....mp4' },
    { name: 'im-disappointed-in-discord.mp4' }
  ];

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const isMp4 = name => /\.mp4$/i.test(name);

  const titleFromFilename = name => name
    .replace(/\.mp4$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const toEntry = ({ name, size }) => ({
    title: titleFromFilename(name),
    file: `${DIR}/${encodeURIComponent(name)}`,
    description: DESCRIPTION,
    category: (CATEGORY_RULES.find(rule => rule.match.test(name)) || {}).category || DEFAULT_CATEGORY,
    size
  });

  const buildLibrary = files => files
    .slice()
    .sort((a, b) => collator.compare(a.name, b.name))
    .map(toEntry);

  const readCache = () => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
      return cache && Array.isArray(cache.files) ? cache : null;
    } catch { return null; }
  };

  const writeCache = files => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), files })); } catch { /* storage full or blocked */ }
  };

  // One shared array: it is updated in place so the player keeps the same reference.
  const videos = [];
  window.VIDEO_LIBRARY = videos;

  // Returns true only if the list actually changed, so the player re-renders only when needed.
  const applyFiles = files => {
    const next = buildLibrary(files);
    if (JSON.stringify(next) === JSON.stringify(videos)) return false;
    videos.splice(0, videos.length, ...next);
    return true;
  };

  const refresh = () => fetch(API_URL, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(FETCH_TIMEOUT_MS) : undefined
  })
    .then(response => {
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    })
    .then(items => {
      const files = items
        .filter(item => item.type === 'file' && isMp4(item.name))
        .map(({ name, size }) => ({ name, size }));

      // A real video is far bigger than ~1 KB; tiny files are usually Git LFS pointers, which Pages can't play.
      const pointers = files.filter(file => file.size < 1024).map(file => file.name);
      if (pointers.length) console.warn('These MP4s look like Git LFS pointers, not real videos:', pointers);

      writeCache(files);
      if (applyFiles(files)) window.dispatchEvent(new CustomEvent('video-library-updated'));
    })
    .catch(error => {
      console.warn('Could not refresh the video list; keeping the current library.', error);
    });

  // Synchronous first fill, so the player has data on its very first render.
  const cache = readCache();
  applyFiles(cache ? cache.files : FALLBACK_FILES);

  if (!cache || Date.now() - cache.time > CACHE_TTL_MS) refresh();
})();
