# 9to5

**9to5** is a browser game that satirizes toxic corporate life. The player sits at a Windows XP desktop and works for three bosses in turn: Manager, Senior Manager, Vice President. The player finishes tiny office tasks to earn XP, spends energy doing so, and recovers energy by doomscrolling short videos while a boss tries to catch them. Fill the XP bar, slap the boss in a cutscene, get promoted, meet the next (worse) boss. Beat the VP and become CEO to win. Let energy hit zero and you fall asleep and lose.

## Boss webcam event

The logged-in desktop includes a temporary trigger for the boss webcam sequence. It runs the creep and footstep effect, forces the webcam prompt, detects a head turn with MediaPipe face landmarks, and selects the in-time or too-late cutscene outcome after a ten-second countdown.

Use `/boss-webcam-lab` to tune the isolated webcam window. Sticker position, left/right tilt, the sticker source, countdown length, and both MP4 source placeholders live in `src/game/bossEvent.ts`. Browser-served sticker assets belong under `public/stickers/`; the current source is `public/stickers/friend.png`.
