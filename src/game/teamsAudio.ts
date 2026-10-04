import { duckBackgroundMusic } from "./backgroundMusic";

const NOTIFICATION_DELAY_MS = 300;
const NOTIFICATION_TAIL_MS = 1400;

let notificationAudio: HTMLAudioElement | null = null;

/**
 * Duck the background music first, wait a beat so the two never overlap, then
 * play the Teams notification. The music is held silent for the ding's tail.
 */
export function playTeamsNotification(muted: boolean) {
  if (muted || typeof window === "undefined") return;
  duckBackgroundMusic(NOTIFICATION_DELAY_MS + NOTIFICATION_TAIL_MS);
  window.setTimeout(() => {
    notificationAudio ??= new Audio("/sounds/teams_notification.mp3");
    notificationAudio.currentTime = 0;
    void notificationAudio.play().catch(() => {
      // Autoplay may be blocked until the next user gesture; ignore silently.
    });
  }, NOTIFICATION_DELAY_MS);
}
