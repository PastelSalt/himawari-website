/**
 * English copy for the site. The README is the source for every claim (WEBSITE.md §8): say less than it does,
 * and link to it or the docs. No emoji, nothing that isn't true today.
 *
 * Strings marked "html" may hold <mark>, <b>, <code>, and <a>; they're ours, so they're rendered as HTML.
 * The Japanese copy (ja.ts) has the same shape. Section pills stay in English capitals in both languages, as on
 * nanahira.jp; `label` is what screen readers hear.
 */
import { CONTACT_URL, REPO, atTag } from '../lib/site';

export const en = {
  meta: {
    title: 'Himawari: a free visual novel maker for Windows',
    description:
      'Himawari Studio is a free, open-source visual novel engine and editor for Windows. Write your story, watch it play as you type, and export a small game that runs on any Windows PC.',
    suffix: 'Himawari',
  },
  chrome: {
    skip: 'Skip to content',
    logoAlt: 'Himawari Studio: Visual Novel Engine and Maker by Moeko Works',
    langLabel: 'Language',
    langOther: '日本語',
    motionOn: 'MOTION ON',
    motionOff: 'MOTION OFF',
    github: 'Himawari on GitHub',
    contact: 'Contact Moeko Works',
    navLabel: 'Sections',
    menu: 'Menu',
    close: 'Close the menu',
    nav: [
      { id: 'features', label: 'FEATURES', name: 'Features' },
      { id: 'download', label: 'DOWNLOAD', name: 'Download' },
      { id: 'learn', label: 'LEARN', name: 'Learn' },
      { id: 'news', label: 'NEWS', name: 'News' },
      { id: 'faq', label: 'FAQ', name: 'FAQ' },
    ],
    newsLabel: 'NEWS',
    newsName: 'Latest news',
    footer: {
      links: [
        { label: 'PRIVACY', href: '/privacy' },
        { label: 'ABOUT', href: '/about' },
        { label: 'GITHUB', href: REPO },
      ],
      legal: 'COPYRIGHT © MOEKO WORKS · RUNTIME ZLIB · TOOLS MIT',
      madeBy: 'Made by Moeko Works',
    },
    english: '(in English)',
    /** the panels under the navigation (NavPanel.astro) */
    panels: {
      download: 'Download',
      learn: 'Learn',
      news: 'Latest news',
      faq: 'Questions people ask',
      allQuestions: 'All questions',
      system: 'Windows 10 and 11, 64-bit. Free.',
    },
  },
  hero: {
    /** html */
    title: 'Write your story and <mark>play it as you type.</mark>',
    lead: 'A free visual novel maker for Windows. No code needed, and nothing for your players to install.',
    download: 'Download for Windows',
    firstGame: 'Make your first game',
    firstGameHref: '/docs/tutorials/first-game',
    note: 'THE GAME PLAYS BESIDE THE EDITOR, IN UNDER A SECOND',
    windowLabel:
      'An illustration of Himawari Studio: a line typed in the editor appears in the game beside it',
    file: 'start.hws',
    narration: 'Narration',
    narrationLine: 'The sunflowers are taller than I am.',
    speaker: 'Hana',
    add: ['+ Line', '+ Choice', '+ Stage'],
    lines: [
      { text: 'The festival is tonight. Will you help me get ready?', mood: 'happy', face: '^ ^' },
      { text: 'Wait, you forgot the lanterns?', mood: 'surprised', face: 'o o' },
      { text: "Then we'll make them together.", mood: 'smile', face: '^ ‿ ^' },
    ],
  },
  about: {
    title: 'ABOUT',
    label: 'About',
    cards: [
      {
        icon: 'pencil-simple-line',
        title: 'Easy enough for anyone',
        text: 'Write lines, choices, and characters with buttons and forms. Your story plays from the first line, even before any art exists.',
      },
      {
        icon: 'code',
        title: 'Open enough for coders',
        text: 'The same project is plain text with a command-line tool and git-friendly files. Extend it with your own statements.',
      },
      {
        icon: 'lightning',
        title: 'Light enough for any PC',
        text: 'A finished game is about 3 MB before your art and music, and it starts with a double-click on Windows 10 or 11.',
      },
    ],
  },
  features: {
    title: 'FEATURES',
    label: 'Features',
    writers: {
      kicker: 'FOR WRITERS',
      title: 'Each line of your story is a row.',
      text: 'Pick who speaks and how they look, then type what they say. Choices, music, and backgrounds come from menus and forms, never code.',
      list: ['The game updates as you type', 'Play from any line', 'Autosave and a history of every change'],
      shotTitle: 'Screenplay',
      shotAlt: 'Himawari Studio: the story as a screenplay on the left, the game on the right',
    },
    artists: {
      kicker: 'FOR ARTISTS',
      title: 'Make the menus look like your game.',
      text: 'Move, resize, and recolor the textbox, choices, and every menu right on the running game. Start from a preset and get a contrast check as you go.',
      list: [
        'Layered sprites with blinking and lip-flap',
        'Import from Photoshop',
        'Seven presets and color palettes',
      ],
      shotTitle: 'UI Designer',
      shotAlt: 'The UI Designer with presets, palettes, and a resizable textbox',
    },
    coders: {
      kicker: 'FOR CODERS',
      title: 'Plain text you can read, diff, and script.',
      text: 'Scenes are <code>.hws</code> files in a small script language, and characters are Markdown. Studio, the command-line tool, and the AI tools share one compiler, so they always agree.',
      list: [
        '<code>hwc</code> checks, builds, and playtests every path from a terminal or CI',
        'Files that diff and merge cleanly in git',
        'Your own statements as macros, or in C',
      ],
      codeTitle: 'sunflower-days / start.hws',
      codeLabel: 'A scene from the Sunflower Days sample, as plain text',
    },
    more: [
      {
        icon: 'translate',
        kicker: 'FOR TRANSLATORS',
        title: 'Add a language when you need it.',
        text: "Every line gets a slot in a translation table. Export CSV or XLIFF for your own tools, and players switch language in the game's menu.",
      },
      {
        icon: 'package',
        kicker: 'THE GAMES YOU SHIP',
        title: 'One button to export.',
        text: "A folder or a single <code>.exe</code> with your game's name and icon. Saves, rollback, a backlog, and accessibility settings are built in, and a finished game makes no network calls.",
      },
      {
        icon: 'sparkle',
        kicker: 'OPTIONAL AI',
        title: 'AI help, only if you want it.',
        text: "It's off until you turn it on, and everything can be done by hand. It drafts, proofreads, and translates text, and it never makes images, music, voices, or video.",
      },
    ],
  },
  soon: {
    pill: 'COMING SOON',
    title: 'A visual novel made with Himawari is on the way.',
    text: "Made by Moeko Works, with the engine you can download today. More when it's ready.",
  },
  download: {
    title: 'DOWNLOAD',
    label: 'Download',
    heading: 'Himawari Studio for Windows',
    intro:
      'Everything is inside the installer: the editor, the game engine, the command-line tools, the tutorial, and three sample games. You don’t need anything else.',
    phone: 'Himawari runs on Windows PCs. Open this page on your computer to download it.',
    requirements: {
      caption: 'Requirements',
      cols: ['', 'Himawari Studio (the editor)', 'Games you export'],
      rows: [
        ['Windows', '10 or 11, 64-bit', '10 or 11, 64-bit'],
        ['Disk space', 'About 500 MB', 'About 3 MB, plus your art and music'],
        [
          'Graphics',
          'Any; integrated graphics are fine',
          'Any; falls back to software rendering without a graphics driver',
        ],
        ['Memory', '4 GB or more', 'Under 150 MB for a typical 1080p scene'],
        ['Anything else to install', 'No', 'No'],
      ],
      arm: 'Arm PCs running Windows 11 should work through its x64 emulation, but that hasn’t been tested yet.',
    },
    smartscreen: {
      title: 'If Windows warns you',
      /** html */
      text: 'The installer isn’t code-signed yet, so Windows SmartScreen may say “Windows protected your PC”. Choose <b>More info</b>, then <b>Run anyway</b>. Code signing is planned before version 1.0.',
    },
    sha: 'SHA-256 of the installer',
    notes: 'Release notes',
    all: 'All releases',
    more: 'Install steps and older versions',
  },
  learn: {
    title: 'LEARN',
    label: 'Learn',
    items: [
      {
        icon: 'graduation-cap',
        title: 'Make your first game',
        text: 'A guided tutorial that builds a short game from an empty project.',
        href: '/docs/tutorials/first-game',
      },
      {
        icon: 'book-open',
        title: 'Documentation',
        text: 'How-to guides and reference: export a game, add a language, credit Himawari.',
        href: '/docs',
      },
      {
        icon: 'sparkle',
        title: 'Working with AI',
        text: 'Set up the built-in assistant or Claude Code, or leave AI off.',
        href: '/docs/ai-setup',
      },
      {
        icon: 'file-code',
        title: 'The script language',
        text: 'For coders: the language, bytecode, asset pack, and debug protocol specifications.',
        href: atTag('spec/language.md'),
      },
      {
        icon: 'github-logo',
        title: 'The source',
        text: 'The engine, Studio, the tools, and the tests, all on GitHub.',
        href: REPO,
      },
    ],
  },
  news: {
    title: 'NEWS',
    label: 'News',
    all: 'All news',
  },
  faq: {
    title: 'FAQ',
    label: 'Questions people ask',
    /** html answers */
    items: [
      {
        q: 'Do I need to know how to code?',
        a: 'No. Everything in Studio works through buttons, pickers, and forms. The script view is there if you want it.',
      },
      {
        q: 'Do players need to install anything?',
        a: 'No. An exported game is a folder, or a single file, that starts with a double-click on Windows 10 or 11.',
      },
      {
        q: 'Is it free? Can I sell my game?',
        a: 'Yes to both. Himawari is free and open source, and you can sell games made with it. The engine inside your game uses the zlib license, which doesn’t require crediting Himawari, though it’s appreciated (<a href="/docs/how-to/credit-himawari">how to credit Himawari</a>). Your story and art stay entirely yours.',
      },
      {
        q: 'Do I have to use AI?',
        a: 'No. AI is off until you turn it on, and every feature can be done by hand. See <a href="/docs/explanation/ai-is-optional">AI is optional</a>.',
      },
      {
        q: 'Does Himawari send my work anywhere?',
        a: 'No. Studio and games have no servers, accounts, telemetry, or analytics. Text leaves your PC only if you turn on AI help and use it. See <a href="/privacy">Privacy</a>.',
      },
      {
        q: 'How does it compare to Ren’Py?',
        a: 'Ren’Py is mature and has a huge community. Himawari is aimed at people who’d rather not code at all, with a visual editor and a live preview built in. Its closed script language can also be checked and edited safely by tools, which the Python inside Ren’Py scripts makes hard. Ren’Py runs on more platforms; Himawari is Windows only for now.',
      },
      {
        q: 'Will there be a Mac or Linux version?',
        a: `Linux is planned after 1.0. Other platforms depend on demand. See the <a href="${REPO}#roadmap">roadmap</a>.`,
      },
    ],
  },
  involved: {
    title: 'GET INVOLVED',
    label: 'Get involved',
    items: [
      {
        icon: 'chat-circle-text',
        title: 'Report a problem',
        text: 'Use the Moeko Works contact page, or Settings → About → Report a problem in Studio.',
        href: CONTACT_URL,
      },
      {
        icon: 'bug',
        title: 'GitHub issues',
        text: 'Say what you did, what you expected, and what happened instead.',
        href: `${REPO}/issues`,
      },
      {
        icon: 'git-pull-request',
        title: 'Contributing',
        text: 'Where to start, and how changes to the specifications are decided.',
        href: atTag('CONTRIBUTING.md'),
      },
      {
        icon: 'shield-check',
        title: 'Security',
        text: 'Please report security problems privately, not in a public issue.',
        href: atTag('SECURITY.md'),
      },
    ],
  },

  /* ------------------------------------------------------------------ other pages */
  pages: {
    download: {
      title: 'Download',
      description:
        'Download Himawari Studio for Windows 10 and 11: the installer, requirements, the SmartScreen step, and its SHA-256.',
      lead: 'Himawari Studio for Windows 10 and 11, 64-bit. One installer holds the editor, the game engine, the command-line tools, the tutorial, and three sample games.',
      stepsTitle: 'Install',
      /** html */
      steps: [
        'Download <b>{file}</b>.',
        'Run it. Install for yourself only (no administrator rights needed) or for everyone on the PC.',
        'Studio opens when setup finishes. Choose <b>Open Tutorial Project</b> for a guided first game, or <b>New Project</b> to start your own.',
      ],
      checkTitle: 'Check the file',
      checkText:
        'In PowerShell, in the folder you downloaded to, this prints the file’s SHA-256. It should match the one above.',
      updateTitle: 'Updating',
      updateText:
        'Studio doesn’t update itself yet. To update, download the new installer and run it: installing over an older version keeps your projects and settings.',
      olderTitle: 'All versions',
      published: 'Published',
      size: 'Size',
      notes: 'Notes',
    },
    news: {
      title: 'News',
      description: 'Releases and announcements for Himawari, the visual novel engine by Moeko Works.',
      lead: 'Releases and announcements.',
      back: 'All news',
      github: 'The release on GitHub',
    },
    privacy: {
      title: 'Privacy',
      description:
        'What this website counts and how, without cookies, and what Himawari itself sends: nothing.',
    },
    about: {
      title: 'About',
      description: 'Who makes Himawari, how the project is run, and its licenses.',
    },
    docs: {
      title: 'Documentation',
      description: 'Himawari’s documentation: tutorials, how-to guides, reference, and explanations.',
      source: 'This page on GitHub',
      version: 'For Himawari {version}',
      contents: 'Documentation',
    },
    notFound: {
      title: 'Page not found',
      text: 'This page drifted away. It may have moved, or the address may be mistyped.',
      home: 'Back to the home page',
      docs: 'Documentation',
    },
  },
};

export type Copy = typeof en;
