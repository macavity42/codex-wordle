const WORDS = [
  "arise",
  "blush",
  "cider",
  "crane",
  "delta",
  "dream",
  "eagle",
  "ember",
  "fable",
  "flute",
  "glide",
  "grace",
  "honey",
  "ivory",
  "jelly",
  "knack",
  "laser",
  "lunar",
  "mango",
  "mirth",
  "noble",
  "oasis",
  "omega",
  "pearl",
  "pixel",
  "poppy",
  "quill",
  "raven",
  "rival",
  "river",
  "sable",
  "salon",
  "shard",
  "solar",
  "spice",
  "sugar",
  "tiger",
  "toast",
  "ultra",
  "vivid",
  "whale",
  "witty",
  "xenon",
  "youth",
  "zesty",
  "gloss",
  "sound",
  "feast",
  "storm",
  "crown",
  "crisp",
  "bloom",
  "cloud",
  "ninth",
  "pride",
  "swift",
  "shine",
  "smile",
  "stone",
  "amber",
  "north",
  "spare",
  "truce",
  "tulip",
  "waltz",
  "waver",
  "zebra",
];

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const winsLabel = document.getElementById("wins");
const streakLabel = document.getElementById("streak");
const newGameButton = document.getElementById("newGame");

const confettiCanvas = document.getElementById("confetti");
const confettiCtx = confettiCanvas.getContext("2d");

const ROWS = 6;
const COLS = 5;

let answer = "";
let currentRow = 0;
let currentCol = 0;
let guesses = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
let gameOver = false;
let wins = 0;
let streak = 0;

const keyboardRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "back"],
];

const keyButtons = new Map();

const resizeCanvas = () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
};

const setMessage = (text) => {
  message.textContent = text;
};

const pickWord = () => WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();

const resetBoard = () => {
  board.innerHTML = "";
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.row = row;
      tile.dataset.col = col;
      board.appendChild(tile);
    }
  }
};

const resetKeyboard = () => {
  keyboard.innerHTML = "";
  keyButtons.clear();
  keyboardRows.forEach((row) => {
    row.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key === "back" ? "⌫" : key;
      button.classList.add("key");
      if (key === "enter" || key === "back") {
        button.classList.add("wide");
      }
      button.dataset.key = key;
      button.addEventListener("click", () => handleKey(key));
      keyboard.appendChild(button);
      keyButtons.set(key, button);
    });
  });
};

const updateStats = () => {
  winsLabel.textContent = wins;
  streakLabel.textContent = streak;
};

const startGame = () => {
  answer = pickWord();
  currentRow = 0;
  currentCol = 0;
  guesses = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  gameOver = false;
  resetBoard();
  resetKeyboard();
  setMessage("Good luck! Guess the new word.");
};

const getTile = (row, col) =>
  board.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);

const setTileLetter = (row, col, letter) => {
  const tile = getTile(row, col);
  if (!tile) return;
  tile.textContent = letter;
  tile.classList.add("pop");
  setTimeout(() => tile.classList.remove("pop"), 200);
};

const clearTileLetter = (row, col) => {
  const tile = getTile(row, col);
  if (!tile) return;
  tile.textContent = "";
};

const animateShake = () => {
  board.classList.add("shake");
  setTimeout(() => board.classList.remove("shake"), 300);
};

const isValidWord = (word) => WORDS.includes(word.toLowerCase());

const applyFeedback = (guess) => {
  const answerArray = answer.split("");
  const result = Array(COLS).fill("absent");
  const used = Array(COLS).fill(false);

  guess.split("").forEach((letter, idx) => {
    if (letter === answerArray[idx]) {
      result[idx] = "correct";
      used[idx] = true;
    }
  });

  guess.split("").forEach((letter, idx) => {
    if (result[idx] === "correct") return;
    const foundIndex = answerArray.findIndex(
      (value, index) => value === letter && !used[index]
    );
    if (foundIndex !== -1) {
      result[idx] = "present";
      used[foundIndex] = true;
    }
  });

  result.forEach((status, col) => {
    const tile = getTile(currentRow, col);
    if (tile) tile.classList.add(status);
    const key = keyButtons.get(guess[col].toLowerCase());
    if (!key) return;
    if (status === "correct") {
      key.classList.remove("present", "absent");
      key.classList.add("correct");
    } else if (status === "present") {
      if (!key.classList.contains("correct")) {
        key.classList.remove("absent");
        key.classList.add("present");
      }
    } else if (!key.classList.contains("correct") && !key.classList.contains("present")) {
      key.classList.add("absent");
    }
  });

  return result;
};

const triggerConfetti = () => {
  resizeCanvas();
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    size: 6 + Math.random() * 6,
    speed: 2 + Math.random() * 3,
    color: ["#6ae1ff", "#7b5cff", "#2fdd92", "#f5b82e"][
      Math.floor(Math.random() * 4)
    ],
    tilt: Math.random() * 10,
  }));

  let frame = 0;
  const animate = () => {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += Math.sin((frame + piece.tilt) * 0.05) * 1.5;
      confettiCtx.fillStyle = piece.color;
      confettiCtx.fillRect(piece.x, piece.y, piece.size, piece.size);
    });
    frame += 1;
    if (frame < 120) {
      requestAnimationFrame(animate);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  };

  animate();
};

const submitGuess = () => {
  if (currentCol < COLS) {
    setMessage("Not enough letters yet.");
    animateShake();
    return;
  }

  const guess = guesses[currentRow].join("");
  if (!isValidWord(guess)) {
    setMessage("That word is not in our list.");
    animateShake();
    return;
  }

  const result = applyFeedback(guess);
  if (guess === answer) {
    gameOver = true;
    wins += 1;
    streak += 1;
    updateStats();
    setMessage("You got it! Fancy another round?");
    triggerConfetti();
    return;
  }

  currentRow += 1;
  currentCol = 0;

  if (currentRow >= ROWS) {
    gameOver = true;
    streak = 0;
    updateStats();
    setMessage(`Out of tries! The word was ${answer}.`);
  } else {
    setMessage("Keep going! Try another guess.");
  }

  if (result.every((value) => value === "absent")) {
    setMessage("No matches there. Try a new angle!");
  }
};

const handleKey = (key) => {
  if (gameOver) return;

  if (key === "enter") {
    submitGuess();
    return;
  }

  if (key === "back") {
    if (currentCol === 0) return;
    currentCol -= 1;
    guesses[currentRow][currentCol] = "";
    clearTileLetter(currentRow, currentCol);
    return;
  }

  if (/^[a-z]$/i.test(key) && currentCol < COLS) {
    const letter = key.toUpperCase();
    guesses[currentRow][currentCol] = letter;
    setTileLetter(currentRow, currentCol, letter);
    currentCol += 1;
  }
};

const handlePhysicalKey = (event) => {
  const key = event.key.toLowerCase();
  if (key === "backspace") {
    handleKey("back");
    return;
  }
  if (key === "enter") {
    handleKey("enter");
    return;
  }
  if (/^[a-z]$/i.test(key)) {
    handleKey(key);
  }
};

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", handlePhysicalKey);
newGameButton.addEventListener("click", startGame);

resizeCanvas();
startGame();
updateStats();
