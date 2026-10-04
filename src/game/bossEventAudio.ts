let audioContext: AudioContext | null = null;
let footstepsRequested = false;
let footstepsTimer: number | null = null;
let footstepIndex = 0;
const activeFootstepNodes = new Set<AudioScheduledSourceNode>();

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

/** Call from the trigger click so later event sounds retain user activation. */
export function armBossEventAudio() {
  const context = getAudioContext();
  if (context?.state === "suspended") void context.resume();
}

function trackFootstepNode(node: AudioScheduledSourceNode) {
  activeFootstepNodes.add(node);
  node.addEventListener(
    "ended",
    () => {
      activeFootstepNodes.delete(node);
    },
    { once: true },
  );
}

function playFootstep(context: AudioContext) {
  if (!footstepsRequested || context.state !== "running") return;

  const now = context.currentTime;
  const alternatingPitch = footstepIndex % 2 === 0 ? 88 : 76;
  footstepIndex += 1;

  const thump = context.createOscillator();
  const thumpGain = context.createGain();
  thump.type = "triangle";
  thump.frequency.setValueAtTime(alternatingPitch, now);
  thump.frequency.exponentialRampToValueAtTime(42, now + 0.17);
  thumpGain.gain.setValueAtTime(0.14, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  thump.connect(thumpGain);
  thumpGain.connect(context.destination);

  const scrape = context.createBufferSource();
  const scrapeBuffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * 0.12),
    context.sampleRate,
  );
  const scrapeSamples = scrapeBuffer.getChannelData(0);
  for (let index = 0; index < scrapeSamples.length; index += 1) {
    const decay = 1 - index / scrapeSamples.length;
    scrapeSamples[index] = (Math.random() * 2 - 1) * decay;
  }
  scrape.buffer = scrapeBuffer;
  const scrapeFilter = context.createBiquadFilter();
  scrapeFilter.type = "lowpass";
  scrapeFilter.frequency.value = 420;
  const scrapeGain = context.createGain();
  scrapeGain.gain.setValueAtTime(0.045, now);
  scrapeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  scrape.connect(scrapeFilter);
  scrapeFilter.connect(scrapeGain);
  scrapeGain.connect(context.destination);

  trackFootstepNode(thump);
  trackFootstepNode(scrape);
  thump.start(now);
  scrape.start(now);
  thump.stop(now + 0.21);
  scrape.stop(now + 0.13);
}

function beginFootsteps(context: AudioContext) {
  if (
    !footstepsRequested ||
    footstepsTimer !== null ||
    context.state !== "running"
  ) {
    return;
  }
  footstepIndex = 0;
  playFootstep(context);
  footstepsTimer = window.setInterval(() => playFootstep(context), 540);
}

export function startBossEventFootsteps(muted: boolean) {
  if (muted) {
    stopBossEventFootsteps();
    return;
  }
  footstepsRequested = true;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") {
    void context.resume().then(() => beginFootsteps(context));
    return;
  }
  beginFootsteps(context);
}

export function stopBossEventFootsteps() {
  footstepsRequested = false;
  if (footstepsTimer !== null) {
    window.clearInterval(footstepsTimer);
    footstepsTimer = null;
  }
  for (const node of activeFootstepNodes) {
    try {
      node.stop();
    } catch {
      // A short footstep may already have ended between frames.
    }
  }
  activeFootstepNodes.clear();
}

export function playBossEventTextBlip(muted: boolean, characterIndex: number) {
  if (muted) return;
  const context = getAudioContext();
  if (!context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 430 + (characterIndex % 4) * 24;
  gain.gain.setValueAtTime(0.025, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.035);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.04);
}
