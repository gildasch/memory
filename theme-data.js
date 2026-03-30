function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const THEME_CONFIG = {
  animals: {
    label: "Animals",
    accent: "Quiet fauna studies",
    palettes: [
      ["#f8efe4", "#efc28d", "#6f4a2d", "#1f2b1f"],
      ["#eef2e6", "#b7d19d", "#496037", "#1f2b1f"],
      ["#eef4f7", "#b2d1dc", "#3b5e6e", "#182126"],
      ["#f4ece6", "#d6b39a", "#7d533a", "#201915"],
    ],
    items: ["Fox", "Otter", "Snow Leopard", "Hare", "Owl", "Whale", "Deer", "Bear", "Lynx", "Badger", "Wolf", "Seal", "Tiger", "Red Panda", "Falcon", "Bison", "Panther", "Moose", "Swan", "Tortoise"],
  },
  french: {
    label: "French Cards",
    accent: "Salon deck illustrations",
    palettes: [
      ["#f9f1ed", "#e86b62", "#7f261f", "#2f1715"],
      ["#f2f1ef", "#1d1d1d", "#5a5a5a", "#121212"],
      ["#f8f4ea", "#c9a14e", "#6c4c21", "#241a13"],
      ["#f4f0f6", "#8e4ad9", "#432068", "#1e132d"],
    ],
    items: ["Ace", "King", "Queen", "Jack", "Ten", "Nine", "Eight", "Seven", "Hearts", "Diamonds", "Clubs", "Spades", "Trick", "Atout", "Salon", "Velvet", "Gold Leaf", "Rouge", "Noir", "Coup"],
  },
  birds: {
    label: "Garden Birds",
    accent: "Bird table moments",
    palettes: [
      ["#eef5eb", "#9cc27d", "#4b6a35", "#1f2d1d"],
      ["#eef4f8", "#8ab9de", "#3b5f7a", "#18212a"],
      ["#f7efe5", "#d5b07b", "#7b5633", "#261c16"],
      ["#f4eef8", "#b69ed7", "#5c4a79", "#231d2d"],
    ],
    items: ["Robin", "Blue Tit", "Goldfinch", "Wren", "Sparrow", "Blackbird", "Bullfinch", "Dunnock", "Nuthatch", "Chaffinch", "Starling", "Thrush", "Great Tit", "Woodpecker", "Warbler", "Swallow", "Finch", "Jay", "Siskin", "Magpie"],
  },
  space: {
    label: "Space",
    accent: "Orbital postcards",
    palettes: [
      ["#0f1328", "#5d6fff", "#bcc3ff", "#f4f6ff"],
      ["#11172d", "#32c1ff", "#8fe7ff", "#effcff"],
      ["#1b1030", "#d56aff", "#f0baff", "#faf1ff"],
      ["#151515", "#ffb84d", "#ffe3b3", "#fffaf0"],
    ],
    items: ["Moon", "Mars", "Saturn", "Comet", "Rocket", "Nebula", "Eclipse", "Aurora", "Orbiter", "Lander", "Beacon", "Meteor", "Galaxy", "Nova", "Capsule", "Telescope", "Drift", "Cosmos", "Zenith", "Signal"],
  },
  western: {
    label: "Western",
    accent: "Dust and brass",
    palettes: [
      ["#f7efe5", "#d6aa61", "#8a5b2a", "#25180f"],
      ["#f4e6de", "#d38163", "#7c3f2b", "#271813"],
      ["#efe9df", "#9c8b63", "#5c4e30", "#201a12"],
      ["#f5edd9", "#d8b25e", "#7c652b", "#281f10"],
    ],
    items: ["Ranch", "Mesa", "Dust", "Saddle", "Spur", "Lariat", "Saloon", "Sheriff", "Canyon", "Mustang", "Outpost", "Prairie", "Bonfire", "Stagecoach", "Copper", "Trail", "Apache", "Desert Rose", "Buckskin", "Sunset"],
  },
  fashion: {
    label: "Fashion",
    accent: "Studio accessories",
    palettes: [
      ["#f9eff3", "#ef8fb1", "#8b3558", "#2d1821"],
      ["#f4f0ea", "#d6b996", "#6f563d", "#231b16"],
      ["#f1f3f7", "#8fa5d9", "#3d507f", "#171e2c"],
      ["#f7eef7", "#c596d6", "#6b4178", "#241627"],
    ],
    items: ["Atelier", "Silk", "Velvet", "Tailored", "Runway", "Pearl", "Linen", "Satin", "Noir", "Blush", "Muse", "Clutch", "Pendant", "Couture", "Pleat", "Trench", "Scarf", "Loafer", "Jewel", "Parfum"],
  },
  watches: {
    label: "Watches",
    accent: "Dial studies",
    palettes: [
      ["#f4f4f1", "#b7b7b2", "#5f5f5a", "#161616"],
      ["#eef4f8", "#8eb8d6", "#33536a", "#121c22"],
      ["#f7f0e6", "#d6b47a", "#72562f", "#1d1811"],
      ["#f4eef4", "#c9aacd", "#6a4d70", "#1f1521"],
    ],
    items: ["Diver", "Field", "Dress", "Pilot", "Chronograph", "GMT", "Moonphase", "Skeleton", "Tachymeter", "Ceramic", "Titanium", "Bronze", "Lume", "Automatic", "Manual", "Regulator", "Subseconds", "Explorer", "Marine", "Datejust"],
  },
  mountain: {
    label: "Mountain",
    accent: "High country studies",
    palettes: [
      ["#eef4f7", "#9ec0d6", "#446375", "#162028"],
      ["#eef0e8", "#aac19a", "#536947", "#1b2218"],
      ["#f6efe5", "#d8b388", "#7a5838", "#231a13"],
      ["#f3eef7", "#b7a4d2", "#5f4f78", "#211927"],
    ],
    items: ["Summit", "Ridge", "Pine", "Cabin", "Alpine", "Lake", "Glacier", "Goat", "Pass", "Trail", "Granite", "Snowline", "Moraine", "Dawn", "Basin", "Ski", "Cliff", "Valley", "Tarn", "North Face"],
  },
};

function themedMotif(themeId, accent, dark, highlight, variant) {
  const variants = {
    animals: [
      `<circle cx="120" cy="108" r="32" fill="${accent}" /><circle cx="96" cy="82" r="14" fill="${dark}" /><circle cx="144" cy="82" r="14" fill="${dark}" />`,
      `<circle cx="120" cy="124" r="26" fill="${accent}" /><circle cx="90" cy="86" r="12" fill="${dark}" /><circle cx="110" cy="72" r="12" fill="${dark}" /><circle cx="130" cy="72" r="12" fill="${dark}" /><circle cx="150" cy="86" r="12" fill="${dark}" />`,
      `<ellipse cx="120" cy="112" rx="44" ry="24" fill="${accent}" /><circle cx="158" cy="100" r="16" fill="${dark}" />`,
      `<path d="M78 138 Q120 64 162 94 Q138 120 152 150 Q114 150 78 138Z" fill="${accent}" />`,
      `<circle cx="96" cy="92" r="16" fill="${dark}" /><circle cx="144" cy="88" r="18" fill="${accent}" /><circle cx="118" cy="120" r="22" fill="${accent}" /><circle cx="152" cy="126" r="10" fill="${dark}" />`,
    ],
    french: [
      `<path d="M120 154 C74 122 64 90 80 74 C96 58 114 68 120 82 C126 68 144 58 160 74 C176 90 166 122 120 154Z" fill="${accent}" />`,
      `<polygon points="120,54 164,104 120,154 76,104" fill="${accent}" />`,
      `<circle cx="100" cy="90" r="22" fill="${accent}" /><circle cx="140" cy="90" r="22" fill="${accent}" /><circle cx="120" cy="122" r="24" fill="${accent}" /><rect x="112" y="122" width="16" height="34" rx="8" fill="${dark}" />`,
      `<path d="M120 48 C150 78 172 96 172 122 C172 144 154 158 136 158 C126 158 120 150 120 144 C120 150 114 158 104 158 C86 158 68 144 68 122 C68 96 90 78 120 48Z" fill="${accent}" /><rect x="112" y="144" width="16" height="24" rx="8" fill="${dark}" />`,
      `<path d="M120 70 L130 96 L158 98 L136 116 L144 144 L120 128 L96 144 L104 116 L82 98 L110 96 Z" fill="${accent}" /><circle cx="120" cy="68" r="18" fill="${dark}" />`,
    ],
    birds: [
      `<path d="M72 126 Q120 58 166 88 Q136 114 150 154 Q112 150 72 126Z" fill="${accent}" />`,
      `<ellipse cx="120" cy="128" rx="46" ry="20" fill="${accent}" /><ellipse cx="120" cy="128" rx="28" ry="10" fill="${highlight}" />`,
      `<path d="M92 150 Q148 136 150 68 Q114 82 92 150Z" fill="${accent}" />`,
      `<path d="M70 138 Q118 116 170 128" stroke="${dark}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="108" cy="104" r="18" fill="${accent}" /><circle cx="136" cy="96" r="16" fill="${accent}" />`,
      `<path d="M78 130 Q122 78 166 118" stroke="${accent}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="98" cy="94" r="7" fill="${dark}" /><circle cx="122" cy="78" r="6" fill="${dark}" /><circle cx="146" cy="90" r="7" fill="${dark}" />`,
    ],
    space: [
      `<circle cx="120" cy="110" r="38" fill="${accent}" /><ellipse cx="120" cy="110" rx="64" ry="18" fill="none" stroke="${highlight}" stroke-width="10" />`,
      `<path d="M120 60 C150 82 146 126 120 150 C94 126 90 82 120 60Z" fill="${accent}" /><circle cx="120" cy="96" r="11" fill="${dark}" />`,
      `<circle cx="144" cy="90" r="22" fill="${accent}" /><path d="M76 128 Q106 110 126 92" stroke="${highlight}" stroke-width="12" fill="none" stroke-linecap="round"/>`,
      `<path d="M120 58 L134 96 L174 96 L142 120 L154 160 L120 136 L86 160 L98 120 L66 96 L106 96 Z" fill="${accent}" />`,
      `<path d="M148 72 A42 42 0 1 0 148 148 A30 42 0 1 1 148 72Z" fill="${accent}" /><circle cx="86" cy="82" r="4" fill="${highlight}" /><circle cx="154" cy="134" r="5" fill="${highlight}" />`,
    ],
    western: [
      `<path d="M86 124 Q120 76 154 124 L144 130 L96 130 Z" fill="${accent}" /><ellipse cx="120" cy="138" rx="58" ry="12" fill="${dark}" />`,
      `<path d="M90 74 H124 V116 Q132 130 150 132 H164 V150 H88 V130 H104 Q110 126 112 116 V74Z" fill="${accent}" />`,
      `<rect x="112" y="74" width="16" height="82" rx="8" fill="${accent}" /><rect x="86" y="94" width="16" height="44" rx="8" fill="${accent}" /><rect x="138" y="88" width="16" height="52" rx="8" fill="${accent}" />`,
      `<circle cx="120" cy="112" r="42" fill="none" stroke="${accent}" stroke-width="12" /><path d="M148 142 Q166 152 174 168" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      `<circle cx="120" cy="100" r="32" fill="${accent}" /><path d="M64 140 Q120 114 176 140" stroke="${dark}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    ],
    fashion: [
      `<path d="M84 132 Q128 130 146 112 L164 112 L164 128 Q144 130 126 142 L84 142 Z" fill="${accent}" /><rect x="150" y="112" width="10" height="34" rx="4" fill="${dark}" />`,
      `<rect x="84" y="90" width="72" height="62" rx="16" fill="${accent}" /><path d="M98 92 Q120 60 142 92" stroke="${dark}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
      `<path d="M120 84 C138 60 168 80 148 102 C132 120 120 116 120 116 C120 116 108 120 92 102 C72 80 102 60 120 84Z" fill="${accent}" /><path d="M112 116 L98 156 L120 136 L142 156 L128 116" fill="${highlight}" />`,
      `<polygon points="120,62 158,96 140,148 100,148 82,96" fill="${accent}" />`,
      `<rect x="98" y="78" width="44" height="70" rx="18" fill="${accent}" /><rect x="106" y="66" width="28" height="14" rx="7" fill="${dark}" />`,
    ],
    watches: [
      `<circle cx="120" cy="110" r="44" fill="${accent}" /><circle cx="120" cy="110" r="34" fill="${highlight}" /><path d="M120 110 L120 84 M120 110 L140 122" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`,
      `<circle cx="120" cy="110" r="42" fill="${accent}" /><circle cx="102" cy="100" r="8" fill="${dark}" /><circle cx="138" cy="100" r="8" fill="${dark}" /><circle cx="120" cy="126" r="8" fill="${dark}" />`,
      `<circle cx="120" cy="110" r="48" fill="${dark}" /><circle cx="120" cy="110" r="36" fill="${accent}" /><circle cx="120" cy="110" r="4" fill="${highlight}" />`,
      `<rect x="108" y="56" width="24" height="34" rx="10" fill="${dark}" /><circle cx="120" cy="110" r="36" fill="${accent}" /><rect x="108" y="130" width="24" height="36" rx="10" fill="${dark}" />`,
      `<circle cx="120" cy="110" r="42" fill="${accent}" /><circle cx="136" cy="96" r="10" fill="${highlight}" /><circle cx="120" cy="110" r="4" fill="${dark}" />`,
    ],
    mountain: [
      `<polygon points="70,146 116,78 148,122 170,98 196,146" fill="${accent}" /><polygon points="106,92 116,78 124,92" fill="${highlight}" />`,
      `<polygon points="120,66 152,110 136,110 160,140 80,140 104,110 88,110" fill="${accent}" /><rect x="112" y="140" width="16" height="18" rx="6" fill="${dark}" />`,
      `<path d="M72 150 Q96 110 126 102 Q152 96 172 64" stroke="${accent}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M72 150 Q96 110 126 102 Q152 96 172 64" stroke="${highlight}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      `<rect x="88" y="104" width="64" height="42" rx="10" fill="${accent}" /><polygon points="80,110 120,76 160,110" fill="${dark}" /><rect x="114" y="118" width="12" height="28" rx="6" fill="${highlight}" />`,
      `<path d="M74 130 Q110 144 166 128" fill="none" stroke="${dark}" stroke-width="8" stroke-linecap="round" /><ellipse cx="126" cy="104" rx="42" ry="22" fill="${accent}" /><ellipse cx="126" cy="104" rx="22" ry="10" fill="${highlight}" />`,
    ],
  };

  return variants[themeId][variant % variants[themeId].length];
}

function createArtwork(themeId, itemLabel, itemIndex) {
  const theme = THEME_CONFIG[themeId];
  const palette = theme.palettes[itemIndex % theme.palettes.length];
  const [background, accent, dark, text] = palette;
  const highlight = itemIndex % 2 === 0 ? "#ffffff" : "#f7f1e7";
  const labelSize = itemLabel.length > 10 ? 18 : 20;
  const motifLayer = themedMotif(themeId, accent, dark, highlight, itemIndex);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="24" fill="url(#bg)" />
      <rect x="18" y="18" width="204" height="204" rx="20" fill="none" stroke="rgba(0,0,0,0.06)" />
      <circle cx="182" cy="52" r="24" fill="${accent}" opacity="0.12" />
      <circle cx="60" cy="176" r="34" fill="${dark}" opacity="0.07" />
      ${motifLayer}
      <text x="24" y="34" fill="${dark}" font-family="Arial, sans-serif" font-size="10" letter-spacing="2" opacity="0.7">${theme.label.toUpperCase()}</text>
      <text x="24" y="194" fill="${text}" font-family="Georgia, serif" font-size="${labelSize}" font-weight="700">${itemLabel}</text>
      <text x="24" y="214" fill="${dark}" font-family="Arial, sans-serif" font-size="10" letter-spacing="1.5" opacity="0.65">${theme.accent.toUpperCase()}</text>
    </svg>
  `;

  return svgToDataUri(svg);
}

function buildThemes() {
  return Object.fromEntries(
    Object.entries(THEME_CONFIG).map(([themeId, config]) => [
      themeId,
      {
        ...config,
        items: config.items.map((label, index) => ({
          id: `${themeId}-${slugify(label)}`,
          label,
          imageUrl: createArtwork(themeId, label, index),
        })),
      },
    ]),
  );
}

window.THEMES = buildThemes();
