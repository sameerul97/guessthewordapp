var gameObject = {
  room_name: "leaf",
  users: [
    {
      id: "DcQd9FFXs4oIpkPnAAAA",
      name: "sam1",
      rounds: [false, false, false],
      scores: 0,
      alreadyGuessed: false,
      playing: false,
    },
    {
      id: "ZwB8T5CjtyH-Jro5AAAB",
      name: "sameer",
      rounds: [false, false, false],
      scores: 0,
      alreadyGuessed: false,
      playing: false,
    },
  ],
  index: 0,
  user_index: 0,
  rounds_index: 1,
  currentPlayerIndex: null,
  game_instance_key: "94d1c92c-0d3c-484e-8f77-9cbd169409e7",
  chosenWord: "tent",
  timer_seconds: 20000,
  game_started: true,
  pause_game: false,
  pause_game_reason: null,
  users_left: false,
  users_left_the_game: [],
  game_over: false,
  game_over_reason: null,
};

var singleplayerDrawingWords = [
  {
    word: "bed",
    drawing: [],
    drawingId: "6744954825080832",
  },
  {
    word: "apple",
    drawing: [],
    drawingId: "6435452070395904",
  },
  {
    word: "asparagus",
    drawing: [],
    drawingId: "5930343053918208",
  },
  {
    word: "bird",
    drawing: [],
    drawingId: "6619915983257600",
  },
  {
    word: "bridge",
    drawing: [],
    drawingId: "4916128595836928",
  },
];

var singlePlayerDrawingWordsWithOptions = [
  {
    word: "bee",
    drawing: [],
    drawingId: "5805032622522368",
    options: ["knife", "bee", "mushroom", "television"],
  },
  {
    word: "baseball bat",
    drawing: [],
    drawingId: "6385771592286208",
    options: ["baseball bat", "laptop", "firetruck", "cake"],
  },
  {
    word: "barn",
    drawing: [],
    drawingId: "5398161096966144",
    options: ["watermelon", "belt", "clarinet", "barn"],
  },
  {
    word: "cell phone",
    drawing: [],
    drawingId: "5601560342036480",
    options: ["sea turtle", "cell phone", "bush", "triangle"],
  },
  {
    word: "The Great Wall of China",
    drawing: [],
    drawingId: "4783001047138304",
    options: ["megaphone", "peanut", "shorts", "The Great Wall of China"],
  },
];

var sequelizeMockCreatedGame;
module.exports = {
  gameObject: () => {
    return {
      room_name: "leaf",
      users: [
        {
          id: "DcQd9FFXs4oIpkPnAAAA",
          name: "sam1",
          rounds: [false, false, false],
          scores: 0,
          alreadyGuessed: false,
          playing: false,
        },
        {
          id: "ZwB8T5CjtyH-Jro5AAAB",
          name: "sameer",
          rounds: [false, false, false],
          scores: 0,
          alreadyGuessed: false,
          playing: false,
        },
      ],
      index: 0,
      user_index: 0,
      rounds_index: 1,
      currentPlayerIndex: null,
      game_instance_key: "94d1c92c-0d3c-484e-8f77-9cbd169409e7",
      chosenWord: "tent",
      timer_seconds: 20000,
      game_started: true,
      pause_game: false,
      pause_game_reason: null,
      users_left: false,
      users_left_the_game: [],
      game_over: false,
      game_over_reason: null,
    };
  },

  gameObjectWithGameNotStarted: () => {
    gameObject.game_started = false;
    return gameObject;
  },

  getSinglePlayerDrawingWords: () => singleplayerDrawingWords,

  getSinglePlayerDrawingWordsWithOptions: () =>
    singlePlayerDrawingWordsWithOptions,
};
