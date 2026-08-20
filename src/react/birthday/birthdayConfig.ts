export const birthdayConfig = {
  birthdayGirlName: 'Kimberly',
  friend1Name: 'Christopher',
  friend2Name: 'Ahmad',

  welcomeTitle: 'Happy Birthday, Kimberly!',
  welcomeMessage:
    'We built a custom Phase 10 game just for you. Get ready to beat Christopher and Ahmad!',

  phaseTitles: [
    'Double Trouble',
    'Set & Run',
    'The Upgrade',
    'Lucky Seven',
    'The Great Eight',
    'On a Roll',
    'Quad Squad',
    'Color Queen',
    'High Five',
    'Final Phase',
  ],

  botQuips: {
    draw: [
      "Hmm, let me see what I've got...",
      'Ooh, this looks promising!',
      'Drawing my card...',
      'My turn to shine!',
    ],
    discard: [
      'Don\'t need this one!',
      'Your problem now!',
      'Bye bye, card!',
      'I\'m getting closer!',
    ],
    skip: [
      'Skip you! Sorry not sorry!',
      'Oops, did I do that?',
      'Enjoy your break!',
      'Skip to the next victim!',
    ],
    hit: [
      'Adding to my collection!',
      'This fits perfectly!',
      'Building my empire!',
    ],
    win: [
      'Better luck next time!',
      'I knew I\'d win!',
      'Kimberly is the champion!',
      'Birthday magic!',
    ],
  },
} as const;

export type BirthdayConfig = typeof birthdayConfig;
