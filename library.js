// GitHub Pages cannot list a folder directly, so discover MP4s from this public repo's API.
(() => {
  'use strict';

  const owner = 'kijnreyyca-bot';
  const repository = 'Frame';
  const branch = 'main';
  const directory = 'videos';
  const apiUrl = `https://api.github.com/repos/${owner}/${repository}/contents/${directory}?ref=${branch}`;
<<<<<<< HEAD
  const cacheKey = `frame:last-good-list:${owner}/${repository}`;

  // Original fallback, so the player still works if GitHub's API is unavailable and nothing is saved yet.
=======

  // Keep a fallback so the player still works if GitHub's API is temporarily unavailable.
>>>>>>> 635b52d (Add AnalogHorrorIceberg video and site files)
  const videos = [
    {
      title: 'I Cannot Believe This Guy Talks To His Sister Like This...',
      file: 'videos/I%20Cannot%20Believe%20This%20Guy%20Talks%20To%20His%20Sister%20Like%20This....mp4',
      description: 'MP4 video in your shared library.'
    },
    {
      title: 'im disappointed in discord',
      file: 'videos/im-disappointed-in-discord.mp4',
      description: 'MP4 video in your shared library.'
    }
  ];
  window.VIDEO_LIBRARY = videos;

  const titleFromFilename = name => name
    .replace(/\.mp4$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

<<<<<<< HEAD
  // Same entry shape the player has always received.
  const toEntry = name => ({
    title: titleFromFilename(name),
    file: `${directory}/${encodeURIComponent(name)}`,
    description: 'MP4 video in your shared library.',
    category: /sugarrushsean/i.test(name) ? 'Sugarrushsean' : 'Other'
  });

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const buildLibrary = names => names.slice().sort(collator.compare).map(toEntry);

  // Replace entries in place so the player keeps the same array reference.
  const setLibrary = list => videos.splice(0, videos.length, ...list);

  // Start from the last list that loaded successfully (if any) so the first paint is not empty or outdated.
  try {
    const saved = JSON.parse(localStorage.getItem(cacheKey));
    if (Array.isArray(saved) && saved.length) setLibrary(buildLibrary(saved));
  } catch { /* no saved list, keep the fallback */ }

  fetch(apiUrl, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8000) : undefined
  })
=======
  fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } })
>>>>>>> 635b52d (Add AnalogHorrorIceberg video and site files)
    .then(response => {
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    })
    .then(files => {
<<<<<<< HEAD
      const mp4s = files.filter(file => file.type === 'file' && /\.mp4$/i.test(file.name));

      // Real videos are far larger than ~1 KB; a tiny "MP4" is almost always a Git LFS pointer, which Pages cannot play.
      const pointers = mp4s.filter(file => file.size < 1024).map(file => file.name);
      if (pointers.length) console.warn('These MP4s look like Git LFS pointers, not real videos:', pointers);

      const names = mp4s.map(file => file.name);
      try { localStorage.setItem(cacheKey, JSON.stringify(names)); } catch { /* storage blocked or full */ }

      setLibrary(buildLibrary(names));
      // Always announce the refreshed list, exactly as before.
=======
      const discovered = files
        .filter(file => file.type === 'file' && /\.mp4$/i.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        .map(file => ({
          title: titleFromFilename(file.name),
          file: `${directory}/${encodeURIComponent(file.name)}`,
          description: 'MP4 video in your shared library.',
          category: /sugarrushsean/i.test(file.name) ? 'Sugarrushsean' : 'Other'
        }));

      // Replace entries in place so the player keeps the same array reference.
      videos.splice(0, videos.length, ...discovered);
>>>>>>> 635b52d (Add AnalogHorrorIceberg video and site files)
      window.dispatchEvent(new CustomEvent('video-library-updated'));
    })
    .catch(error => {
      console.warn('Could not refresh the video list; using the saved library.', error);
    });
})();
