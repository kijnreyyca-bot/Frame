// GitHub Pages cannot list a folder directly, so discover MP4s from this public repo's API.
(() => {
  'use strict';

  const owner = 'kijnreyyca-bot';
  const repository = 'Frame';
  const branch = 'main';
  const directory = 'videos';
  const apiUrl = `https://api.github.com/repos/${owner}/${repository}/contents/${directory}?ref=${branch}`;

  // Keep a fallback so the player still works if GitHub's API is temporarily unavailable.
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

  fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } })
    .then(response => {
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    })
    .then(files => {
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
      window.dispatchEvent(new CustomEvent('video-library-updated'));
    })
    .catch(error => {
      console.warn('Could not refresh the video list; using the saved library.', error);
    });
})();
