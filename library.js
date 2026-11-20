// Playback is hosted on YouTube. Each file name below is mapped to the YouTube
// video that serves it, so the page never has to stream the LFS files.
// Two videos are age-restricted and refuse to play in an embed without a
// signed-in Google account, so they keep the original MP4 as a fallback.
(() => {
  'use strict';

  const owner = 'kijnreyyca-bot';
  const repository = 'Frame';
  const branch = 'main';
  const directory = 'videos';
  const mediaBase = `https://media.githubusercontent.com/media/${owner}/${repository}/${branch}/${directory}/`;

  const titleFromFilename = name => name
    .replace(/\.mp4$/i, '')
    .replace(/\s*-\s*Sugarrushsean\s*\(\d+p\)\s*$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Local file name -> YouTube ID. Every ID was matched by title and checked
  // against the duration of the file in this folder.
  const youtubeIds = {
    'AnalogHorrorIceberg.mp4': 'H9PIdEYfaLI',
    'Doing This With Emojis Has Got To Be Illegal... - Sugarrushsean (480p).mp4': 'Gc3Dnq9Kgoo',
    'Haminations Is Too Old To Be Doing This... - Sugarrushsean (480p).mp4': 'CcXuiUo0bIU',
    "I Actually Can't Do This Anymore... (Dandys World) - Sugarrushsean (480p).mp4": 'RhKOSYgwZf0',
    'I Cannot Believe This Guy Talks To His Sister Like This....mp4': 'rUiz3BWvl9A',
    'I Found The Most Evil Dandys World Creator Of All Time... - Sugarrushsean (480p).mp4': 'glkqUGAKWk0',
    'I Tricked Discord Bots into Leaking their Password..mp4': 'lUiLBBab1RY',
    'If My Instagram FYP Can Make Me Laugh, I Die... - Sugarrushsean (480p).mp4': '5CH-p0qpp5Y',
    'im-disappointed-in-discord.mp4': 'tVOUjuxz73A',
    "It's Concerning How This Guys Content Is Still Even Up... - Sugarrushsean (480p).mp4": 'JPqcvp6ukxM',
    "It's Concerning That Grown Adults Do This With Dandys World... - Sugarrushsean (480p).mp4": 'sPCH8rkw8dA',
    'Its Disgusting That These People Actually Find This Funny... - Sugarrushsean (480p).mp4': 'txOcanyuGNY',
    'Making This On Gacha Life Has Got To Be Illegal... - Sugarrushsean (480p).mp4': '5H_TD7igZkA',
    'Making This With Animal Hospital Has Got To Be Illegal... - Sugarrushsean (480p).mp4': 'kruZr2F_I5k',
    'Outing Your Kinks On Roblox Like This Has Got To Be Illegal... - Sugarrushsean (480p).mp4': '3N1fC3wKxKk',
    'Roblox and Discord are Absolutely Disgusting Right Now....mp4': 'nF8P5CBm4oA',
    'The Streamer Who Threatened A Minor.mp4': 'XaaEiMOBu4s',
    "There's No Way Fans Of Dandys World Genuinely Watch This... - Sugarrushsean (480p).mp4": 'HJV2-GbYm9o',
    "There's No Way Forsaken Fans Actually Find This Funny... - Sugarrushsean (480p).mp4": 'mP94glRy2rs',
    'These Fans Have No Right Being This Disgusting....mp4': '4MIAAeiivIE',
    'Installing Windows 11 on a MacBook Pro from 2007....mp4': '2RA-zcBE9aY',
    'This Animal Hospital Creator Has Got To Be Locked Up For This... - Sugarrushsean (480p).mp4': 'T4EqiEYwh7Q',
    'This Animal Hospital Creator Has Got To Be Put Down... - Sugarrushsean (480p).mp4': 'm-Vus9HRvTw',
    'This Has Got To Be The Worst Song To Ever Curse My Ears... - Sugarrushsean (480p).mp4': '_JtRPQJpL6s',
    'This Is Not What I Expected Dandys World To Turn Into... - Sugarrushsean (480p).mp4': 'gHpZU-2tw6E',
    'This Is Not What I Thought Animal Hospital Was... - Sugarrushsean (480p).mp4': 'GqxQuYp_HSU',
    "This Is The Last Thing I'd Expect From Gacha Life... - Sugarrushsean (480p).mp4": 'i7hz-9uzxwg',
    'This MHA Creator Has Got To Be a Pred... - Sugarrushsean (480p).mp4': '7OoOL5b0YPA',
    'This Person Has Got To Be Locked Up For Making This... - Sugarrushsean (480p).mp4': 'xNqHtQDHPhI',
    'This Was The Last Thing I Was Expecting TikTok To Add... - Sugarrushsean (480p).mp4': 'N_RG8U4eh5E',
    'TikTok Rants Are Some Of The Worst Content On The Internet... - Sugarrushsean (480p).mp4': '0fTX310YftI',
    'Using Kids To Click This Is Genuinely Concerning... - Sugarrushsean (480p).mp4': 'J1Lx12c63Fc',
    'Yumeshippers Are Insane For Finding This Attractive... - Sugarrushsean (480p).mp4': 'A2qt8ZTv6Yw',
    'Dumbass AI Responses 🎉.mp4': 'X0bMXs-mbrY'
  };

  // These two show "Sorry, this content is age-restricted" in every embed.
  const mp4Only = new Set([
    "I Actually Can't Do This Anymore... (Dandys World) - Sugarrushsean (480p).mp4",
    "Outing Your Kinks On Roblox Like This Has Got To Be Illegal... - Sugarrushsean (480p).mp4"
  ]);

  const channels = {
    'AnalogHorrorIceberg.mp4': 'Chronically Online Podcast',
    'I Tricked Discord Bots into Leaking their Password..mp4': 'No Text To Speech',
    'Roblox and Discord are Absolutely Disgusting Right Now....mp4': 'No Text To Speech',
    'The Streamer Who Threatened A Minor.mp4': 'Turkey Tom',
    'Installing Windows 11 on a MacBook Pro from 2007....mp4': 'Metrabyte',
    'im-disappointed-in-discord.mp4': 'No Text To Speech'
  };

  const specialCategories = {
    'AnalogHorrorIceberg.mp4': 'Analog Horror',
    'im-disappointed-in-discord.mp4': 'Discord'
  };

  const categoryFor = name => specialCategories[name]
    || (/sugarrushsean/i.test(name) ? 'Sugarrushsean' : 'Other');

  const channelFor = name => channels[name] || 'Sugarrushsean';

  const makeVideo = name => {
    const needsMp4 = mp4Only.has(name);
    return {
      title: titleFromFilename(name),
      youtubeId: youtubeIds[name] || '',
      mp4: needsMp4 ? `${mediaBase}${encodeURIComponent(name)}` : '',
      description: needsMp4
        ? `${channelFor(name)} · age-restricted on YouTube`
        : channelFor(name),
      category: categoryFor(name)
    };
  };

  // The same order as the files on disk. The list is built in instead of being
  // fetched from the GitHub API, so it loads instantly and never rate-limits.
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
    "Installing Windows 11 on a MacBook Pro from 2007....mp4",
    "Yumeshippers Are Insane For Finding This Attractive... - Sugarrushsean (480p).mp4",
    "Dumbass AI Responses 🎉.mp4"
  ];

  window.VIDEO_LIBRARY = files.map(makeVideo);
})();
