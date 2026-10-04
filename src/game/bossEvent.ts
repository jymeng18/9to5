import happyEndingCutscene from "@/assets/Happy_Ending_Boss_Sneaking_Up.MP4";
import sadEndingCutscene from "@/assets/Sad_Ending_Boss_Sneaking_Up.MP4";

export const BOSS_TURN_COUNTDOWN_MS = 10_000;

// Webcam silhouette tuning. Positive degrees tilt inward from the visible edge.
export const BOSS_PEEK_LEFT_TILT_DEGREES = 12;
export const BOSS_PEEK_RIGHT_TILT_DEGREES = 16;
export const BOSS_PEEK_OFFSCREEN_RATIO = 0.58;
export const BOSS_PEEK_HEIGHT_RATIO = 0.72;
export const BOSS_PEEK_TOP_RATIO = 0.15;

// Set this to a transparent PNG/WebP path, for example "/stickers/friend.png".
export const BOSS_WEBCAM_STICKER_SRC = "/stickers/friend.png";

export const BOSS_TURN_IN_TIME_CUTSCENE_SRC = happyEndingCutscene;
export const BOSS_TURN_TOO_LATE_CUTSCENE_SRC = sadEndingCutscene;

export const BOSS_WEBCAM_PROMPT =
  "Something feels off… maybe I should open the webcam.";

const BOSS_SILHOUETTE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
  <defs>
    <linearGradient id="rim" x1="0" x2="1">
      <stop offset="0" stop-color="#6b7a99" stop-opacity=".55" />
      <stop offset="1" stop-color="#6b7a99" stop-opacity="0" />
    </linearGradient>
  </defs>
  <path d="M0 420 L0 330 Q10 250 90 232 L210 232 Q290 250 300 330 L300 420 Z" fill="#07070b" />
  <path d="M0 330 Q10 250 90 232" fill="none" stroke="url(#rim)" stroke-width="3" />
  <path d="M118 232 L150 290 L182 232 Z" fill="#14141c" />
  <path d="M142 262 L158 262 L164 360 L150 378 L136 360 Z" fill="#5a1115" />
  <rect x="128" y="190" width="44" height="52" rx="10" fill="#07070b" />
  <ellipse cx="150" cy="130" rx="62" ry="72" fill="#07070b" />
  <path d="M92 110 Q100 62 150 58" fill="none" stroke="url(#rim)" stroke-width="3" />
  <rect x="108" y="116" width="34" height="16" rx="5" fill="#cfd8ee" opacity=".22" />
  <rect x="158" y="116" width="34" height="16" rx="5" fill="#cfd8ee" opacity=".22" />
</svg>`;

export const BOSS_SILHOUETTE_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  BOSS_SILHOUETTE_SVG,
)}`;

const BOSS_WEBCAM_STICKER_PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">
  <path d="M36 405 Q20 300 78 245 Q105 220 120 210 L180 210 Q195 220 222 245 Q280 300 264 405 Z" fill="#ffd966" stroke="#ffffff" stroke-width="12" />
  <circle cx="150" cy="132" r="76" fill="#ffd966" stroke="#ffffff" stroke-width="12" />
  <circle cx="124" cy="122" r="8" fill="#202020" />
  <circle cx="176" cy="122" r="8" fill="#202020" />
  <path d="M120 160 Q150 184 180 160" fill="none" stroke="#202020" stroke-width="8" stroke-linecap="round" />
  <rect x="68" y="300" width="164" height="50" rx="12" fill="#1f4ba5" stroke="#ffffff" stroke-width="8" />
  <text x="150" y="333" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">YOUR STICKER</text>
</svg>`;

export const BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  BOSS_WEBCAM_STICKER_PLACEHOLDER_SVG,
)}`;
