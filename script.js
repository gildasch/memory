const SNAP_TURN = {
  duration: 740,
  easing: "cubic-bezier(0.34, 1.56, 0.46, 1)",
  mid: 0.44,
  lift: [4, 7],
  pitch: [5, 7],
  roll: [1.3, 2.4],
  overshoot: 8,
  scale: 1.002,
  shadowBoost: 1.04,
};

const ARTWORKS = [
  { id: "berries", className: "art--berries", label: "Berry Cluster" },
  { id: "iris", className: "art--iris", label: "Blue Iris" },
  { id: "tree", className: "art--tree", label: "Tree Canopy" },
  { id: "gulls", className: "art--gulls", label: "Seagull Flight" },
  { id: "meadow", className: "art--meadow", label: "Meadow Flowers" },
  { id: "horse", className: "art--horse", label: "Coastal Horses" },
  { id: "berries-2", className: "art--berries", label: "Berry Cluster" },
  { id: "tree-2", className: "art--tree", label: "Tree Canopy" },
];

const board = document.querySelector("#board");
const statusText = document.querySelector("#status");
const movesValue = document.querySelector("#moves");
const timerValue = document.querySelector("#timer");
const pairsLeftValue = document.querySelector("#pairs-left");
const newGameButton = document.querySelector("#new-game");

const state = {
  cards: [],
  flippedCards: [],
  pendingMismatch: null,
  matchedPairs: 0,
  moves: 0,
  busy: false,
  timerId: null,
  startTime: null,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function motionTransform({ rotation, pitch, roll, lift, scale }) {
  return `translate3d(0, ${lift}px, 0) scale(${scale}) rotateX(${pitch}deg) rotateY(${rotation}deg) rotateZ(${roll}deg)`;
}

function shadowTransform(direction, distance) {
  const offset = direction === "left" ? -distance : distance;
  return `translate3d(${offset}px, 8px, 0) scale(${1 + Math.abs(offset) / 90})`;
}

function updateHud() {
  movesValue.textContent = String(state.moves);
  pairsLeftValue.textContent = String((state.cards.length / 2) - state.matchedPairs);
}

function setStatus(message) {
  statusText.textContent = message;
}

function resetTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
  }

  state.timerId = null;
  state.startTime = null;
  timerValue.textContent = "00:00";
}

function startTimerIfNeeded() {
  if (state.timerId || state.startTime) {
    return;
  }

  state.startTime = Date.now();
  state.timerId = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    timerValue.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
  }

  state.timerId = null;
}

function createDeck() {
  return shuffle(
    ARTWORKS.flatMap((artwork) => [
      { key: `${artwork.id}-a`, pairId: artwork.id, artwork },
      { key: `${artwork.id}-b`, pairId: artwork.id, artwork },
    ]),
  );
}

function renderBoard() {
  board.innerHTML = state.cards
    .map(
      (card) => `
        <button
          class="memory-card"
          type="button"
          data-key="${card.key}"
          data-pair-id="${card.pairId}"
          data-face="back"
          data-matched="false"
          aria-label="Hidden card"
        >
          <span class="memory-card__shadow"></span>
          <span class="memory-card__body">
            <span class="memory-card__face memory-card__face--back">
              <span class="memory-card__mark">memory</span>
            </span>
            <span class="memory-card__face memory-card__face--front">
              <span class="memory-card__print">
                <span class="memory-card__art ${card.artwork.className}" aria-hidden="true"></span>
              </span>
            </span>
          </span>
        </button>
      `,
    )
    .join("");
}

function flipCardElement(cardElement, nextFace) {
  if (cardElement.dataset.animating === "true") {
    return Promise.resolve();
  }

  const body = cardElement.querySelector(".memory-card__body");
  const shadow = cardElement.querySelector(".memory-card__shadow");
  const currentFace = cardElement.dataset.face;
  const direction = Math.random() > 0.5 ? "left" : "right";
  const sign = direction === "left" ? -1 : 1;
  const liftPeak = -randomBetween(...SNAP_TURN.lift);
  const pitchPeak = randomBetween(...SNAP_TURN.pitch);
  const rollPeak = randomBetween(...SNAP_TURN.roll) * sign;
  const settleRoll = rollPeak * 0.22;
  const currentRotation = currentFace === "front" ? 180 : 0;
  const targetRotation = nextFace === "front" ? 180 : 0;
  const midpointRotation =
    currentRotation + (targetRotation - currentRotation) * SNAP_TURN.mid + SNAP_TURN.overshoot * sign;

  cardElement.dataset.animating = "true";
  cardElement.dataset.face = nextFace;
  cardElement.style.setProperty("--flip-glint-shift", `${sign * 8}px`);

  const bodyAnimation = body.animate(
    [
      {
        transform: motionTransform({
          rotation: currentRotation,
          pitch: 0,
          roll: 0,
          lift: 0,
          scale: 1,
        }),
      },
      {
        offset: SNAP_TURN.mid,
        transform: motionTransform({
          rotation: midpointRotation,
          pitch: pitchPeak,
          roll: rollPeak,
          lift: liftPeak,
          scale: SNAP_TURN.scale,
        }),
      },
      {
        transform: motionTransform({
          rotation: targetRotation,
          pitch: 0.5,
          roll: settleRoll,
          lift: -1,
          scale: 1,
        }),
      },
    ],
    {
      duration: SNAP_TURN.duration,
      easing: SNAP_TURN.easing,
      fill: "forwards",
    },
  );

  shadow.animate(
    [
      { opacity: 0.18, transform: shadowTransform(direction, 0), filter: "blur(12px)" },
      {
        offset: 0.45,
        opacity: 0.26,
        transform: shadowTransform(direction, 6 * SNAP_TURN.shadowBoost),
        filter: "blur(14px)",
      },
      { opacity: 0.18, transform: shadowTransform(direction, 2), filter: "blur(12px)" },
    ],
    {
      duration: SNAP_TURN.duration,
      easing: SNAP_TURN.easing,
      fill: "forwards",
    },
  );

  return new Promise((resolve) => {
    bodyAnimation.addEventListener(
      "finish",
      () => {
        cardElement.dataset.animating = "false";
        body.style.transform = motionTransform({
          rotation: targetRotation,
          pitch: 0,
          roll: 0,
          lift: 0,
          scale: 1,
        });
        shadow.style.transform = shadowTransform(direction, 2);
        shadow.style.opacity = "0.18";
        resolve();
      },
      { once: true },
    );
  });
}

function handleMismatch() {
  state.pendingMismatch = [...state.flippedCards];
  setStatus("Not a pair. Pick a different card to begin the next turn.");
}

async function clearPendingMismatch() {
  if (!state.pendingMismatch) {
    return;
  }

  const pendingPair = state.pendingMismatch;
  state.pendingMismatch = null;
  state.busy = true;

  await Promise.all(pendingPair.map((card) => card.flipPromise));

  pendingPair.forEach((card) => {
    card.flipPromise = flipCardElement(card.element, "back").then(() => {
      card.element.setAttribute("aria-label", "Hidden card");
    });
  });

  state.flippedCards = [];
  state.busy = false;
}

function handleMatch() {
  const [firstCard, secondCard] = state.flippedCards;
  firstCard.matched = true;
  secondCard.matched = true;
  firstCard.element.dataset.matched = "true";
  secondCard.element.dataset.matched = "true";
  firstCard.element.classList.add("is-matched");
  secondCard.element.classList.add("is-matched");
  firstCard.element.setAttribute("aria-label", `${firstCard.artwork.label}, matched`);
  secondCard.element.setAttribute("aria-label", `${secondCard.artwork.label}, matched`);
  state.flippedCards = [];
  state.matchedPairs += 1;
  updateHud();

  if (state.matchedPairs === state.cards.length / 2) {
    stopTimer();
    setStatus(`Board cleared in ${state.moves} moves.`);
    return;
  }

  setStatus("Pair found. Keep the rhythm.");
}

async function onCardClick(event) {
  const cardElement = event.currentTarget;
  const card = state.cards.find((entry) => entry.key === cardElement.dataset.key);

  if (!card || state.busy || card.matched || state.flippedCards.some((entry) => entry.key === card.key)) {
    return;
  }

  if (cardElement.dataset.face === "front") {
    return;
  }

  if (cardElement.dataset.animating === "true") {
    return;
  }

  if (state.pendingMismatch) {
    if (state.pendingMismatch.some((entry) => entry.key === card.key)) {
      return;
    }

    await clearPendingMismatch();
  }

  if (state.flippedCards.length >= 2) {
    return;
  }

  startTimerIfNeeded();
  cardElement.setAttribute("aria-label", card.artwork.label);
  card.element = cardElement;
  card.flipPromise = flipCardElement(cardElement, "front");
  state.flippedCards.push(card);

  if (state.flippedCards.length < 2) {
    setStatus("One open card. Find its pair.");
    return;
  }

  state.moves += 1;
  updateHud();

  const [firstCard, secondCard] = state.flippedCards;

  if (firstCard.pairId === secondCard.pairId) {
    handleMatch();
    return;
  }

  handleMismatch();
}

function attachBoardEvents() {
  board.querySelectorAll(".memory-card").forEach((cardElement) => {
    cardElement.addEventListener("click", onCardClick);
  });
}

function newGame() {
  resetTimer();
  state.cards = createDeck().map((card) => ({ ...card, matched: false, element: null, flipPromise: null }));
  state.flippedCards = [];
  state.pendingMismatch = null;
  state.matchedPairs = 0;
  state.moves = 0;
  state.busy = false;
  renderBoard();
  attachBoardEvents();
  updateHud();
  setStatus("Find all matching pairs. Cards flip with a slight left or right bias, but stay inside the grid.");
}

newGameButton.addEventListener("click", newGame);

newGame();
