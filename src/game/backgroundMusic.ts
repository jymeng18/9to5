const MUSIC_SRC = "/sounds/corporate_music.mp3";
const MUSIC_VOLUME = 0.18;

let music: HTMLAudioElement | null = null;
let desiredPlaying = false;
let duckTimer: number | null = null;

function ensureMusic(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = true;
    music.volume = MUSIC_VOLUME;
    music.preload = "auto";
  }
  return music;
}

function tryPlayBackgroundMusic() {
  if (!desiredPlaying || duckTimer !== null) return;
  const element = ensureMusic();
  if (!element || !element.paused) return;
  void element.play().catch(() => {
    // Autoplay can be blocked until the next user gesture; callers retry later.
  });
}

/**
 * Declare whether the passive track should be audible. Pausing is immediate;
 * resuming is deferred while a notification is ducking the music.
 */
export function setBackgroundMusicDesired(desired: boolean) {
  desiredPlaying = desired;
  if (!desired) {
    music?.pause();
    return;
  }
  tryPlayBackgroundMusic();
}

/**
 * Silence the music immediately and keep it silent for `duckMs`, then resume it
 * if it is still wanted. Used so a notification can play over clean silence.
 */
export function duckBackgroundMusic(duckMs: number) {
  music?.pause();
  if (duckTimer !== null) window.clearTimeout(duckTimer);
  duckTimer = window.setTimeout(() => {
    duckTimer = null;
    tryPlayBackgroundMusic();
  }, duckMs);
}
