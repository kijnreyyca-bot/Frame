// GitHub Pages does not serve Git LFS contents: it returns the small pointer
// file instead of the video. GitHub's media host does serve the real LFS
// object, so every URL below points at media.githubusercontent.com.
(() => {
  'use strict';

  const owner = 'kijnreyyca-bot';
  const repository = 'Frame';
  const branch = 'main';
  const directory = 'videos';
  const mediaBase = `https://media.githubusercontent.com/media/${owner}/${repository}/${branch}/${directory}/`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repository}/contents/${directory}?ref=${branch}`;

  const titleFromFilename = name => name
    .replace(/\.mp4$/i, '')
    .replace(/\s*-\s*Sugarrushsean\s*\(\d+p\)\s*$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const specialCategories = {
    'AnalogHorrorIceberg.mp4': 'Analog Horror',
    'im-disappointed-in-discord.mp4': 'Discord'
  };

  const categoryFor = name => specialCategories[name]
    || (/sugarrushsean/i.test(name) ? 'Sugarrushsean' : 'Other');

  const makeVideo = name => ({
    title: titleFromFilename(name),
    file: `${mediaBase}${encodeURIComponent(name)}`,
    description: 'MP4 video in your shared library.',
    category: categoryFor(name)
  });

  // Every video in the repository, so the player still works when the GitHub
  // API is rate-limited or offline.
  const files = [
    "AnalogHorrorIceberg.mp4",
    "Doing This With Emojis Has Got To Be Illegal... - Sugarrushsean (480p).mp4",
    "Haminations Is Too Old To Be Doing This... - Sugarrushsean (480p).mp4",
    "I Actually Can't Do This Anymore... (Dandys World) - Sugarrushsean (480p).mp4",
    "I Cannot Believe This Guy Talks To His Sister Like This....mp4",
    "I Found The Most Evil Dandys World Creator Of All Time... - Sugarrushsean (480p).mp4",
    "I Tricked Discord Bots into Leaking their Password..mp4",
    "If My Instagram FYP Can Make Me Laugh, I Die... - Sugarrushsean (480p).mp4",
    "im-disappointed-in-discord.mp4",
    "It's Concerning How This Guys Content Is Still Even Up... - Sugarrushsean (480p).mp4",
    "It's Concerning That Grown Adults Do This With Dandys World... - Sugarrushsean (480p).mp4",
    "Its Disgusting That These People Actually Find This Funny... - Sugarrushsean (480p).mp4",
    "Making This On Gacha Life Has Got To Be Illegal... - Sugarrushsean (480p).mp4",
    "Making This With Animal Hospital Has Got To Be Illegal... - Sugarrushsean (480p).mp4",
    "Outing Your Kinks On Roblox Like This Has Got To Be Illegal... - Sugarrushsean (480p).mp4",
    "Roblox and Discord are Absolutely Disgusting Right Now....mp4",
    "The Streamer Who Threatened A Minor.mp4",
    "There's No Way Fans Of Dandys World Genuinely Watch This... - Sugarrushsean (480p).mp4",
    "There's No Way Forsaken Fans Actually Find This Funny... - Sugarrushsean (480p).mp4",
    "These Fans Have No Right Being This Disgusting....mp4",
    "This Animal Hospital Creator Has Got To Be Locked Up For This... - Sugarrushsean (480p).mp4",
    "This Animal Hospital Creator Has Got To Be Put Down... - Sugarrushsean (480p).mp4",
    "This Has Got To Be The Worst Song To Ever Curse My Ears... - Sugarrushsean (480p).mp4",
    "This Is Not What I Expected Dandys World To Turn Into... - Sugarrushsean (480p).mp4",
    "This Is Not What I Thought Animal Hospital Was... - Sugarrushsean (480p).mp4",
    "This Is The Last Thing I'd Expect From Gacha Life... - Sugarrushsean (480p).mp4",
    "This MHA Creator Has Got To Be a Pred... - Sugarrushsean (480p).mp4",
    "This Person Has Got To Be Locked Up For Making This... - Sugarrushsean (480p).mp4",
    "This Was The Last Thing I Was Expecting TikTok To Add... - Sugarrushsean (480p).mp4",
    "TikTok Rants Are Some Of The Worst Content On The Internet... - Sugarrushsean (480p).mp4",
    "Using Kids To Click This Is Genuinely Concerning... - Sugarrushsean (480p).mp4",
    "Yumeshippers Are Insane For Finding This Attractive... - Sugarrushsean (480p).mp4"
  ];

  const videos = files.map(makeVideo);
  window.VIDEO_LIBRARY = videos;
  let signature = videos.map(video => video.file).join('|');

  fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } })
    .then(response => {
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    })
    .then(entries => {
      if (!Array.isArray(entries)) throw new Error('Unexpected GitHub API response');

      const discovered = entries
        .filter(entry => entry.type === 'file' && /\.mp4$/i.test(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        .map(entry => makeVideo(entry.name));

      if (!discovered.length) throw new Error('No MP4 files found in the repository');

      const nextSignature = discovered.map(video => video.file).join('|');
      if (nextSignature === signature) return; // Nothing new to add.

      signature = nextSignature;
      videos.splice(0, videos.length, ...discovered);
      window.dispatchEvent(new CustomEvent('video-library-updated'));
    })
    .catch(error => {
      console.warn('Could not refresh the video list; using the built-in library.', error);
    });
})();
