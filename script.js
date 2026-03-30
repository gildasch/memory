const variants = [
  {
    id: "velvet-hinge",
    number: "01",
    name: "Velvet Hinge",
    summary: "Closest to the classic tabletop feel. Gentle rise, soft settle, very playable.",
    cues: ["calm", "refined", "classic"],
    stats: {
      pace: "0.96s",
      mood: "Soft settle",
      bias: "subtle hinge",
    },
    motion: {
      duration: 960,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      mid: 0.5,
      lift: [6, 9],
      pitch: [6, 9],
      roll: [1.8, 3.2],
      overshoot: 6,
      scale: 1.004,
      shadowBoost: 1.08,
    },
  },
  {
    id: "arc-sweep",
    number: "02",
    name: "Arc Sweep",
    summary: "A slightly bolder arc that feels like the card is sweeping through space.",
    cues: ["showcase", "floating", "lively"],
    stats: {
      pace: "1.04s",
      mood: "Longer arc",
      bias: "more lift",
    },
    motion: {
      duration: 1040,
      easing: "cubic-bezier(0.19, 0.97, 0.34, 1)",
      mid: 0.48,
      lift: [8, 11],
      pitch: [7, 10],
      roll: [2.6, 4.6],
      overshoot: 7,
      scale: 1.006,
      shadowBoost: 1.12,
    },
  },
  {
    id: "snap-turn",
    number: "03",
    name: "Snap Turn",
    summary: "Quicker and crisper, with a neat little settle at the end for pair-matching speed.",
    cues: ["fast", "playful", "clean"],
    stats: {
      pace: "0.74s",
      mood: "Quick snap",
      bias: "tight settle",
    },
    motion: {
      duration: 740,
      easing: "cubic-bezier(0.34, 1.56, 0.46, 1)",
      mid: 0.44,
      lift: [4, 7],
      pitch: [5, 7],
      roll: [1.3, 2.4],
      overshoot: 8,
      scale: 1.002,
      shadowBoost: 1.04,
    },
  },
  {
    id: "gallery-turn",
    number: "04",
    name: "Gallery Turn",
    summary: "Slightly slower and more elegant, like turning over a little framed print.",
    cues: ["luxury", "quiet", "intentional"],
    stats: {
      pace: "1.18s",
      mood: "Graceful drift",
      bias: "tiny roll",
    },
    motion: {
      duration: 1180,
      easing: "cubic-bezier(0.2, 0.85, 0.24, 1)",
      mid: 0.52,
      lift: [7, 10],
      pitch: [6, 9],
      roll: [2.8, 4.4],
      overshoot: 5,
      scale: 1.004,
      shadowBoost: 1.1,
    },
  },
];

const artworks = [
  { className: "art--berries", label: "Berry Cluster" },
  { className: "art--iris", label: "Blue Iris" },
  { className: "art--tree", label: "Tree Canopy" },
  { className: "art--gulls", label: "Seagull Flight" },
  { className: "art--meadow", label: "Meadow Flowers" },
  { className: "art--horse", label: "Coastal Horses" },
];

const catalog = document.querySelector("#catalog");
const boardPreview = document.querySelector("#board-preview");
const flipAllButton = document.querySelector("#flip-all");
const resetAllButton = document.querySelector("#reset-all");

function renderBoardPreview() {
  const previewMarkup = Array.from({ length: 8 }, (_, index) => {
    const artwork = artworks[index % artworks.length];
    const isFaceUp = index % 3 === 0;
    return `
      <div class="mini-card mini-card--${isFaceUp ? "front" : "back"} mini-card--${index + 1}">
        <div class="mini-card__tile">
          ${
            isFaceUp
              ? `<div class="mini-card__art ${artwork.className}" aria-label="${artwork.label}"></div>`
              : `<div class="mini-card__pattern"></div>`
          }
        </div>
      </div>
    `;
  }).join("");

  boardPreview.innerHTML = previewMarkup;
}

function renderCatalog() {
  catalog.innerHTML = variants
    .map((variant, index) => {
      const artwork = artworks[index % artworks.length];

      return `
        <article class="catalog-item variant-${variant.id}">
          <div class="catalog-item__copy">
            <div class="catalog-item__heading">
              <p class="catalog-item__number">${variant.number}</p>
              <div>
                <h3>${variant.name}</h3>
                <p class="catalog-item__summary">${variant.summary}</p>
              </div>
            </div>

            <div class="catalog-item__chips">
              ${variant.cues.map((cue) => `<span>${cue}</span>`).join("")}
            </div>

            <dl class="catalog-item__stats">
              <div>
                <dt>Pace</dt>
                <dd>${variant.stats.pace}</dd>
              </div>
              <div>
                <dt>Feel</dt>
                <dd>${variant.stats.mood}</dd>
              </div>
              <div>
                <dt>Bias</dt>
                <dd>${variant.stats.bias}</dd>
              </div>
            </dl>

            <div class="catalog-item__actions">
              <button class="catalog-item__button catalog-item__button--primary" data-action="flip" type="button">
                Flip sample
              </button>
              <button class="catalog-item__button" data-action="loop" type="button">
                Auto loop
              </button>
            </div>

            <div class="catalog-item__telemetry" aria-live="polite">
              <span data-field="direction">Entry: right</span>
              <span data-field="tilt">Tilt: +0.0deg</span>
              <span data-field="roll">Roll: +0.0deg</span>
            </div>
          </div>

          <div class="catalog-item__scene">
            <div class="catalog-item__glow"></div>
            <button
              class="memory-card"
              type="button"
              data-variant="${variant.id}"
              data-face="back"
              aria-label="Flip ${variant.name} card sample"
            >
              <span class="memory-card__shadow"></span>
              <span class="memory-card__body">
                <span class="memory-card__face memory-card__face--back">
                  <span class="memory-card__back-pattern"></span>
                  <span class="memory-card__seal">memory</span>
                </span>
                <span class="memory-card__face memory-card__face--front">
                  <span class="memory-card__print">
                    <span class="memory-card__art ${artwork.className}" aria-hidden="true"></span>
                  </span>
                </span>
              </span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}deg`;
}

function motionTransform({ rotation, pitch, roll, lift, scale }) {
  return `translate3d(0, ${lift}px, 0) scale(${scale}) rotateX(${pitch}deg) rotateY(${rotation}deg) rotateZ(${roll}deg)`;
}

function shadowTransform(direction, distance) {
  const offset = direction === "left" ? -distance : distance;
  return `translate3d(${offset}px, 8px, 0) scale(${1 + Math.abs(offset) / 90})`;
}

function flipCard(card, forceFace) {
  const variant = variants.find((entry) => entry.id === card.dataset.variant);

  if (!variant || card.dataset.animating === "true") {
    return;
  }

  const body = card.querySelector(".memory-card__body");
  const shadow = card.querySelector(".memory-card__shadow");
  const telemetry = card
    .closest(".catalog-item")
    .querySelector(".catalog-item__telemetry");

  const currentFace = card.dataset.face;
  const nextFace = forceFace ?? (currentFace === "back" ? "front" : "back");
  const direction = Math.random() > 0.5 ? "left" : "right";
  const sign = direction === "left" ? -1 : 1;
  const liftPeak = -randomBetween(...variant.motion.lift);
  const pitchPeak = randomBetween(...variant.motion.pitch);
  const rollPeak = randomBetween(...variant.motion.roll) * sign;
  const settleRoll = rollPeak * 0.22;
  const currentRotation = currentFace === "front" ? 180 : 0;
  const targetRotation = nextFace === "front" ? 180 : 0;
  const midpointRotation =
    currentRotation + (targetRotation - currentRotation) * variant.motion.mid + variant.motion.overshoot * sign;

  card.dataset.animating = "true";
  card.dataset.direction = direction;
  body.style.transformOrigin = "50% 50%";
  shadow.style.transformOrigin = "50% 50%";
  card.style.setProperty("--flip-direction", sign);
  card.style.setProperty("--flip-glint-shift", `${sign * 10}px`);

  telemetry.querySelector('[data-field="direction"]').textContent = `Entry: ${direction}`;
  telemetry.querySelector('[data-field="tilt"]').textContent = `Tilt: ${formatSigned(
    pitchPeak,
  )}`;
  telemetry.querySelector('[data-field="roll"]').textContent = `Roll: ${formatSigned(rollPeak)}`;

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
        offset: variant.motion.mid,
        transform: motionTransform({
          rotation: midpointRotation,
          pitch: pitchPeak,
          roll: rollPeak,
          lift: liftPeak,
          scale: variant.motion.scale,
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
      duration: variant.motion.duration,
      easing: variant.motion.easing,
      fill: "forwards",
    },
  );

  shadow.animate(
    [
      { opacity: 0.22, transform: shadowTransform(direction, 0), filter: "blur(12px)" },
      {
        offset: 0.45,
        opacity: 0.3,
        transform: shadowTransform(direction, 6 * variant.motion.shadowBoost),
        filter: "blur(14px)",
      },
      { opacity: 0.22, transform: shadowTransform(direction, 2), filter: "blur(12px)" },
    ],
    {
      duration: variant.motion.duration,
      easing: variant.motion.easing,
      fill: "forwards",
    },
  );

  bodyAnimation.addEventListener("finish", () => {
    card.dataset.face = nextFace;
    card.dataset.animating = "false";
    body.style.transform = motionTransform({
      rotation: targetRotation,
      pitch: 0,
      roll: 0,
      lift: 0,
      scale: 1,
    });
    shadow.style.transform = shadowTransform(direction, 2);
    shadow.style.opacity = "0.22";
  });
}

function attachEvents() {
  const cards = document.querySelectorAll(".memory-card");
  const loopTimers = new WeakMap();

  cards.forEach((card) => {
    const container = card.closest(".catalog-item");
    const flipButton = container.querySelector('[data-action="flip"]');
    const loopButton = container.querySelector('[data-action="loop"]');

    card.addEventListener("click", () => flipCard(card));
    flipButton.addEventListener("click", () => flipCard(card));

    loopButton.addEventListener("click", () => {
      const activeTimer = loopTimers.get(card);

      if (activeTimer) {
        clearInterval(activeTimer);
        loopTimers.delete(card);
        loopButton.textContent = "Auto loop";
        loopButton.dataset.active = "false";
        return;
      }

      flipCard(card);
      const timer = window.setInterval(() => flipCard(card), 1800);
      loopTimers.set(card, timer);
      loopButton.textContent = "Stop loop";
      loopButton.dataset.active = "true";
    });
  });

  flipAllButton.addEventListener("click", () => {
    cards.forEach((card, index) => {
      window.setTimeout(() => flipCard(card), index * 120);
    });
  });

  resetAllButton.addEventListener("click", () => {
    cards.forEach((card, index) => {
      const container = card.closest(".catalog-item");
      const loopButton = container.querySelector('[data-action="loop"]');
      const activeTimer = loopTimers.get(card);

      if (activeTimer) {
        clearInterval(activeTimer);
        loopTimers.delete(card);
      }

      loopButton.textContent = "Auto loop";
      loopButton.dataset.active = "false";

      if (card.dataset.face === "front") {
        window.setTimeout(() => flipCard(card, "back"), index * 80);
      }
    });
  });
}

renderBoardPreview();
renderCatalog();
attachEvents();
