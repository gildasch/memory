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

const board = document.querySelector("#board");
const appShell = document.querySelector(".app-shell");
const statusText = document.querySelector("#status");
const movesValue = document.querySelector("#moves");
const timerValue = document.querySelector("#timer");
const pairsLeftValue = document.querySelector("#pairs-left");
const newGameButton = document.querySelector("#new-game");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const themeModeToggle = document.querySelector("#theme-mode-toggle");
const playersSelect = document.querySelector("#players-select");
const themeSelect = document.querySelector("#theme-select");
const pairsSelect = document.querySelector("#pairs-select");
const playerBannerText = document.querySelector("#player-banner-text");
const THEME_MODE_STORAGE_KEY = "memory-theme-mode";
const GAME_SETTINGS_STORAGE_KEY = "memory-game-settings";
const GAME_SESSION_STORAGE_KEY = "memory-game-session";

const state = {
  cards: [],
  flippedCards: [],
  pendingMismatch: null,
  matchedPairs: 0,
  moves: 0,
  busy: false,
  timerId: null,
  startTime: null,
  elapsedSeconds: 0,
  playerCount: 1,
  currentPlayerIndex: 0,
  playerTurns: [0],
  selectedThemeId: "animals",
  pairCount: 8,
  rowLengths: [],
  sidebarOpen: false,
  themeMode: "light",
};

function applyThemeMode() {
  document.documentElement.dataset.theme = state.themeMode;
  themeModeToggle.setAttribute("aria-pressed", String(state.themeMode === "dark"));
  themeModeToggle.setAttribute("aria-label", state.themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode");
  themeModeToggle.setAttribute("title", state.themeMode === "dark" ? "Light mode" : "Dark mode");
}

function loadThemeMode() {
  const storedThemeMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (storedThemeMode === "dark" || storedThemeMode === "light") {
    state.themeMode = storedThemeMode;
    return;
  }
  state.themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function saveGameSettings() {
  window.localStorage.setItem(
    GAME_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      playerCount: state.playerCount,
      selectedThemeId: state.selectedThemeId,
      pairCount: state.pairCount,
    }),
  );
}

function loadGameSettings() {
  const rawSettings = window.localStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
  if (!rawSettings) {
    return;
  }

  try {
    const parsedSettings = JSON.parse(rawSettings);
    if (Number.isFinite(parsedSettings.playerCount)) {
      state.playerCount = Math.max(1, Math.min(4, parsedSettings.playerCount));
    }
    if (parsedSettings.selectedThemeId in THEMES) {
      state.selectedThemeId = parsedSettings.selectedThemeId;
    }
    if (Number.isFinite(parsedSettings.pairCount)) {
      state.pairCount = parsedSettings.pairCount;
    }
  } catch {
    window.localStorage.removeItem(GAME_SETTINGS_STORAGE_KEY);
  }
}

function getArtworkById(themeId, artworkId) {
  return THEMES[themeId].items.find((artwork) => artwork.id === artworkId) ?? null;
}

function getCardFace(card, openCardKeys, pendingMismatchKeys) {
  if (card.matched) {
    return "front";
  }
  if (openCardKeys.has(card.key) || pendingMismatchKeys.has(card.key)) {
    return "front";
  }
  return "back";
}

function saveGameSession() {
  if (!state.cards.length) {
    return;
  }

  const openCardKeys = new Set(state.flippedCards.map((card) => card.key));
  const pendingMismatchKeys = new Set((state.pendingMismatch ?? []).map((card) => card.key));

  window.localStorage.setItem(
    GAME_SESSION_STORAGE_KEY,
    JSON.stringify({
      selectedThemeId: state.selectedThemeId,
      pairCount: state.pairCount,
      playerCount: state.playerCount,
      currentPlayerIndex: state.currentPlayerIndex,
      playerTurns: state.playerTurns,
      moves: state.moves,
      matchedPairs: state.matchedPairs,
      elapsedSeconds: state.elapsedSeconds,
      statusMessage: statusText.textContent,
      sidebarOpen: state.sidebarOpen,
      cards: state.cards.map((card) => ({
        key: card.key,
        pairId: card.pairId,
        artworkId: card.artwork.id,
        matched: card.matched,
        face: getCardFace(card, openCardKeys, pendingMismatchKeys),
      })),
      flippedCardKeys: [...openCardKeys],
      pendingMismatchKeys: [...pendingMismatchKeys],
    }),
  );
}

function setCardFaceInstant(cardElement, face) {
  const body = cardElement.querySelector(".memory-card__body");
  cardElement.dataset.face = face;
  cardElement.dataset.animating = "false";
  body.style.transform = motionTransform({
    rotation: face === "front" ? 180 : 0,
    pitch: 0,
    roll: 0,
    lift: 0,
    scale: 1,
  });
}

function setSidebarOpen(isOpen) {
  state.sidebarOpen = isOpen;
  appShell.dataset.sidebarOpen = String(isOpen);
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
  sidebarToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  sidebarToggle.setAttribute("title", isOpen ? "Close menu" : "Open menu");
  window.requestAnimationFrame(updateBoardMetrics);
}

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

function clampPairCount() {
  const maxPairs = THEMES[state.selectedThemeId].items.length;
  state.pairCount = Math.max(2, Math.min(state.pairCount, maxPairs));
}

function syncPlayerState() {
  state.playerCount = Math.max(1, Math.min(4, state.playerCount));
  const nextTurns = Array.from({ length: state.playerCount }, (_, index) => state.playerTurns[index] ?? 0);
  state.playerTurns = nextTurns;
  state.currentPlayerIndex = Math.max(0, Math.min(state.currentPlayerIndex, state.playerCount - 1));
}

function populateThemeSelect() {
  themeSelect.innerHTML = Object.entries(THEMES)
    .map(
      ([themeId, theme]) =>
        `<option value="${themeId}" ${themeId === state.selectedThemeId ? "selected" : ""}>${theme.label}</option>`,
    )
    .join("");
}

function populatePairSelect() {
  const maxPairs = THEMES[state.selectedThemeId].items.length;
  pairsSelect.innerHTML = Array.from({ length: maxPairs - 1 }, (_, index) => index + 2)
    .map(
      (pairCount) =>
        `<option value="${pairCount}" ${pairCount === state.pairCount ? "selected" : ""}>${pairCount}</option>`,
    )
    .join("");
}

function syncControls() {
  syncPlayerState();
  clampPairCount();
  playersSelect.value = String(state.playerCount);
  populateThemeSelect();
  populatePairSelect();
  themeSelect.value = state.selectedThemeId;
  pairsSelect.value = String(state.pairCount);
}

function updateHud() {
  movesValue.textContent = String(state.moves);
  pairsLeftValue.textContent = String((state.cards.length / 2) - state.matchedPairs);
}

function updatePlayerBanner() {
  const turnCount = state.playerTurns[state.currentPlayerIndex] ?? 0;
  const turnLabel = turnCount === 1 ? "1 turn" : `${turnCount} turns`;
  playerBannerText.textContent = `Player ${state.currentPlayerIndex + 1} · ${turnLabel}`;
}

function setStatus(message) {
  statusText.textContent = message;
}

function advanceToNextPlayer() {
  if (state.playerCount <= 1) {
    return;
  }
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
}

function resetTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
  }
  state.timerId = null;
  state.startTime = null;
  state.elapsedSeconds = 0;
  timerValue.textContent = "00:00";
}

function startTimerIfNeeded() {
  if (state.timerId || state.startTime) {
    return;
  }
  state.startTime = Date.now() - state.elapsedSeconds * 1000;
  state.timerId = window.setInterval(() => {
    state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    timerValue.textContent = formatTime(state.elapsedSeconds);
    saveGameSession();
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
  }
  state.timerId = null;
  state.startTime = null;
}

function alternatingRowOrder(rowCount) {
  const order = [];
  for (let index = 0; index < rowCount; index += 2) {
    order.push(index);
  }
  for (let index = 1; index < rowCount; index += 2) {
    order.push(index);
  }
  return order;
}

function distributeCardsAcrossRows(totalCards, rowCount) {
  const baseLength = Math.floor(totalCards / rowCount);
  if (baseLength < 2) {
    return null;
  }

  const rowLengths = Array(rowCount).fill(baseLength);
  const order = alternatingRowOrder(rowCount);
  const extraCards = totalCards % rowCount;

  for (let index = 0; index < extraCards; index += 1) {
    rowLengths[order[index]] += 1;
  }

  return rowLengths;
}

function getBalancedRowLengths(totalCards) {
  const boardRect = board.getBoundingClientRect();
  const aspectRatio = boardRect.width > 0 && boardRect.height > 0 ? boardRect.width / boardRect.height : 1.2;
  let bestRowLengths = [totalCards];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let rowCount = 2; rowCount <= Math.floor(totalCards / 2); rowCount += 1) {
    const rowLengths = distributeCardsAcrossRows(totalCards, rowCount);
    if (!rowLengths) {
      continue;
    }

    const shortestRow = Math.min(...rowLengths);
    const longestRow = Math.max(...rowLengths);
    const spread = longestRow - shortestRow;
    const layoutAspect = longestRow / rowLengths.length;
    const score =
      spread * 100 +
      Math.abs(rowLengths.length - Math.sqrt(totalCards)) * 40 +
      Math.abs(layoutAspect - aspectRatio) * 12 +
      Math.abs(longestRow - Math.sqrt(totalCards)) * 6 +
      rowCount * 0.1;

    if (score < bestScore) {
      bestScore = score;
      bestRowLengths = rowLengths;
    }
  }

  return bestRowLengths;
}

function createDeck() {
  const theme = THEMES[state.selectedThemeId];
  const chosenItems = shuffle(theme.items).slice(0, state.pairCount);
  return shuffle(
    chosenItems.flatMap((artwork) => [
      { key: `${artwork.id}-a`, pairId: artwork.id, artwork },
      { key: `${artwork.id}-b`, pairId: artwork.id, artwork },
    ]),
  );
}

function renderBoard() {
  state.rowLengths = getBalancedRowLengths(state.cards.length);
  let cursor = 0;

  board.innerHTML = state.rowLengths
    .map((rowLength) => {
      const rowCards = state.cards.slice(cursor, cursor + rowLength);
      cursor += rowLength;

      return `
        <div class="board__row" style="--row-columns: ${rowLength}">
          ${rowCards
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
                        <span class="memory-card__art" style="background-image: url('${card.artwork.imageUrl}')" aria-hidden="true"></span>
                      </span>
                    </span>
                  </span>
                </button>
              `,
            )
            .join("")}
        </div>
      `;
    })
    .join("");

  window.requestAnimationFrame(updateBoardMetrics);
}

function updateBoardMetrics() {
  if (!state.rowLengths.length) {
    return;
  }

  const rowCount = state.rowLengths.length;
  const longestRow = Math.max(...state.rowLengths);
  const boardRect = board.getBoundingClientRect();

  if (boardRect.width === 0 || boardRect.height === 0) {
    return;
  }

  const gap = Math.max(6, Math.min(12, Math.floor(Math.min(boardRect.width, boardRect.height) / 42)));
  const cardWidth = (boardRect.width - gap * (longestRow - 1)) / longestRow;
  const cardHeight = (boardRect.height - gap * (rowCount - 1)) / rowCount;
  const cardSize = Math.max(48, Math.floor(Math.min(cardWidth, cardHeight)));

  board.style.setProperty("--board-gap", `${gap}px`);
  board.style.setProperty("--card-size", `${cardSize}px`);
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
      { transform: motionTransform({ rotation: currentRotation, pitch: 0, roll: 0, lift: 0, scale: 1 }) },
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
      { transform: motionTransform({ rotation: targetRotation, pitch: 0.5, roll: settleRoll, lift: -1, scale: 1 }) },
    ],
    { duration: SNAP_TURN.duration, easing: SNAP_TURN.easing, fill: "forwards" },
  );

  shadow.animate(
    [
      { opacity: 0.18, transform: shadowTransform(direction, 0), filter: "blur(12px)" },
      { offset: 0.45, opacity: 0.26, transform: shadowTransform(direction, 6 * SNAP_TURN.shadowBoost), filter: "blur(14px)" },
      { opacity: 0.18, transform: shadowTransform(direction, 2), filter: "blur(12px)" },
    ],
    { duration: SNAP_TURN.duration, easing: SNAP_TURN.easing, fill: "forwards" },
  );

  return new Promise((resolve) => {
    bodyAnimation.addEventListener(
      "finish",
      () => {
        cardElement.dataset.animating = "false";
        body.style.transform = motionTransform({ rotation: targetRotation, pitch: 0, roll: 0, lift: 0, scale: 1 });
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
  advanceToNextPlayer();
  updatePlayerBanner();
  setStatus(state.playerCount > 1 ? `Not a pair. Player ${state.currentPlayerIndex + 1} is up.` : "Not a pair. Click anywhere to hide the cards.");
  saveGameSession();
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
  saveGameSession();
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
  updatePlayerBanner();

  if (state.matchedPairs === state.cards.length / 2) {
    stopTimer();
    setSidebarOpen(true);
    setStatus(state.playerCount > 1 ? `Board cleared in ${state.moves} moves. Player ${state.currentPlayerIndex + 1} finishes ahead.` : `Board cleared in ${state.moves} moves.`);
    saveGameSession();
    return;
  }
  setStatus(state.playerCount > 1 ? `Pair found. Player ${state.currentPlayerIndex + 1} keeps the turn.` : "Pair found. Keep the rhythm.");
  saveGameSession();
}

async function onCardClick(event) {
  const cardElement = event.currentTarget;
  const card = state.cards.find((entry) => entry.key === cardElement.dataset.key);

  if (state.pendingMismatch) {
    const canContinueWithClickedCard =
      card &&
      !state.busy &&
      !card.matched &&
      !state.flippedCards.some((entry) => entry.key === card.key) &&
      cardElement.dataset.face !== "front" &&
      cardElement.dataset.animating !== "true";

    await clearPendingMismatch();

    if (!canContinueWithClickedCard) {
      return;
    }
  }

  if (!card || state.busy || card.matched || state.flippedCards.some((entry) => entry.key === card.key)) return;
  if (cardElement.dataset.face === "front" || cardElement.dataset.animating === "true") return;

  if (state.flippedCards.length >= 2) return;

  startTimerIfNeeded();
  cardElement.setAttribute("aria-label", card.artwork.label);
  card.element = cardElement;
  card.flipPromise = flipCardElement(cardElement, "front");
  state.flippedCards.push(card);
  saveGameSession();

  if (state.flippedCards.length < 2) {
    setStatus(state.playerCount > 1 ? `Player ${state.currentPlayerIndex + 1}: one open card. Find its pair.` : "One open card. Find its pair.");
    return;
  }

  state.moves += 1;
  state.playerTurns[state.currentPlayerIndex] += 1;
  updateHud();
  updatePlayerBanner();
  saveGameSession();

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

async function onBoardClick(event) {
  if (!state.pendingMismatch || state.busy) {
    return;
  }

  if (event.target.closest(".memory-card")) {
    return;
  }

  await clearPendingMismatch();
}

function restoreSavedGameSession() {
  const rawSession = window.localStorage.getItem(GAME_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return false;
  }

  try {
    const session = JSON.parse(rawSession);
    if (!(session.selectedThemeId in THEMES) || !Array.isArray(session.cards) || session.cards.length === 0) {
      throw new Error("Invalid saved session");
    }

    state.selectedThemeId = session.selectedThemeId;
    state.pairCount = session.pairCount;
    state.playerCount = Number.isFinite(session.playerCount) ? session.playerCount : 1;
    state.currentPlayerIndex = Number.isFinite(session.currentPlayerIndex) ? session.currentPlayerIndex : 0;
    state.playerTurns = Array.isArray(session.playerTurns) ? session.playerTurns : [0];
    syncPlayerState();
    clampPairCount();

    const restoredCards = session.cards.map((card) => {
      const artwork = getArtworkById(session.selectedThemeId, card.artworkId);
      if (!artwork) {
        throw new Error("Missing artwork");
      }

      return {
        key: card.key,
        pairId: card.pairId,
        artwork,
        matched: Boolean(card.matched),
        element: null,
        flipPromise: null,
      };
    });

    state.cards = restoredCards;
    state.moves = Number.isFinite(session.moves) ? session.moves : 0;
    state.matchedPairs = Number.isFinite(session.matchedPairs) ? session.matchedPairs : restoredCards.filter((card) => card.matched).length / 2;
    state.elapsedSeconds = Number.isFinite(session.elapsedSeconds) ? session.elapsedSeconds : 0;
    state.pendingMismatch = null;
    state.flippedCards = [];
    state.busy = false;

    syncControls();
    renderBoard();
    attachBoardEvents();

    const cardByKey = new Map(state.cards.map((card) => [card.key, card]));
    const openCardKeys = new Set(Array.isArray(session.flippedCardKeys) ? session.flippedCardKeys : []);
    const pendingMismatchKeys = new Set(Array.isArray(session.pendingMismatchKeys) ? session.pendingMismatchKeys : []);

    state.cards.forEach((card, index) => {
      const cardElement = board.querySelector(`.memory-card[data-key="${card.key}"]`);
      card.element = cardElement;

      const savedCard = session.cards[index];
      const face = savedCard?.face === "front" || card.matched ? "front" : "back";
      setCardFaceInstant(cardElement, face);

      if (card.matched) {
        cardElement.dataset.matched = "true";
        cardElement.classList.add("is-matched");
        cardElement.setAttribute("aria-label", `${card.artwork.label}, matched`);
      } else if (face === "front") {
        cardElement.setAttribute("aria-label", card.artwork.label);
      }
    });

    state.flippedCards = [...openCardKeys].map((key) => cardByKey.get(key)).filter(Boolean);
    const pendingMismatchCards = [...pendingMismatchKeys].map((key) => cardByKey.get(key)).filter(Boolean);
    state.pendingMismatch = pendingMismatchCards.length ? pendingMismatchCards : null;

    updateHud();
    updatePlayerBanner();
    timerValue.textContent = formatTime(state.elapsedSeconds);
    setStatus(typeof session.statusMessage === "string" && session.statusMessage ? session.statusMessage : `${THEMES[state.selectedThemeId].label}. ${state.pairCount} pairs selected.`);
    setSidebarOpen(Boolean(session.sidebarOpen));
    saveGameSession();
    return true;
  } catch {
    window.localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
    return false;
  }
}

function newGame({ collapseSidebar = true } = {}) {
  resetTimer();
  syncPlayerState();
  clampPairCount();
  saveGameSettings();
  state.cards = createDeck().map((card) => ({ ...card, matched: false, element: null, flipPromise: null }));
  state.flippedCards = [];
  state.pendingMismatch = null;
  state.matchedPairs = 0;
  state.moves = 0;
  state.currentPlayerIndex = 0;
  state.playerTurns = Array(state.playerCount).fill(0);
  state.busy = false;
  if (collapseSidebar) {
    setSidebarOpen(false);
  }
  renderBoard();
  attachBoardEvents();
  updateHud();
  updatePlayerBanner();
  setStatus(state.playerCount > 1 ? `${THEMES[state.selectedThemeId].label}. ${state.pairCount} pairs selected. Player 1 starts.` : `${THEMES[state.selectedThemeId].label}. ${state.pairCount} pairs selected. New games draw a random subset from twenty themed fronts.`);
  saveGameSession();
}

playersSelect.addEventListener("change", () => {
  state.playerCount = Number(playersSelect.value);
  saveGameSettings();
  newGame({ collapseSidebar: false });
});

themeSelect.addEventListener("change", () => {
  state.selectedThemeId = themeSelect.value;
  clampPairCount();
  populatePairSelect();
  pairsSelect.value = String(state.pairCount);
  saveGameSettings();
  newGame({ collapseSidebar: false });
});

pairsSelect.addEventListener("change", () => {
  state.pairCount = Number(pairsSelect.value);
  saveGameSettings();
  newGame({ collapseSidebar: false });
});

newGameButton.addEventListener("click", newGame);
sidebarToggle.addEventListener("click", () => {
  setSidebarOpen(!state.sidebarOpen);
});
themeModeToggle.addEventListener("click", () => {
  state.themeMode = state.themeMode === "dark" ? "light" : "dark";
  window.localStorage.setItem(THEME_MODE_STORAGE_KEY, state.themeMode);
  applyThemeMode();
});
window.addEventListener("resize", updateBoardMetrics);
board.addEventListener("click", onBoardClick);

loadThemeMode();
applyThemeMode();
if (!restoreSavedGameSession()) {
  loadGameSettings();
  syncControls();
  newGame();
}
