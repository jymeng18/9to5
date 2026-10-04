import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import {
  BOSS_PEEK_HEIGHT_RATIO,
  BOSS_PEEK_LEFT_TILT_DEGREES,
  BOSS_PEEK_OFFSCREEN_RATIO,
  BOSS_PEEK_RIGHT_TILT_DEGREES,
  BOSS_PEEK_TOP_RATIO,
  BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC,
  BOSS_WEBCAM_STICKER_SRC,
} from "@/game/bossEvent";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const FRAME_INTERVAL_MS = 1000 / 15;

export type HeadTurnPhase =
  "idle" | "loading" | "waiting" | "armed" | "turned" | "timedOut";
export type BossSide = "left" | "right";

type HeadTurnOptions = {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
  countdownMs: number;
  onTurn: () => void;
  onTimeout: () => void;
  forcedBossSide?: BossSide | undefined;
  yawThreshold?: number;
  holdMs?: number;
  lostMs?: number;
};

type HeadTurnState = {
  phase: HeadTurnPhase;
  yaw: number;
  remainingMs: number;
  warning: string | null;
  error: string | null;
  retry: () => void;
};

type RuntimeState = Omit<HeadTurnState, "retry">;

function initialState(countdownMs: number): RuntimeState {
  return {
    phase: "idle",
    yaw: 0,
    remainingMs: countdownMs,
    warning: null,
    error: null,
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("The webcam sticker could not be loaded."));
    image.src = src;
  });
}

export function chooseVisibleStickerSide(faceX: number): BossSide {
  return faceX < 0.5 ? "left" : "right";
}

export function getBossPeekGeometry(
  side: BossSide,
  frameWidth: number,
  frameHeight: number,
  imageAspectRatio = 300 / 420,
) {
  const height = frameHeight * BOSS_PEEK_HEIGHT_RATIO;
  const width = height * imageAspectRatio;
  const visibleRatio = 1 - BOSS_PEEK_OFFSCREEN_RATIO;
  const x =
    side === "left"
      ? -width * BOSS_PEEK_OFFSCREEN_RATIO
      : frameWidth - width * visibleRatio;
  const y = frameHeight * BOSS_PEEK_TOP_RATIO;
  const pivotX = side === "left" ? x + width * 0.45 : x + width * 0.55;
  const pivotY = y + height * 0.88;
  // The rendered canvas is mirrored, so raw left appears on the visible right.
  const tiltDegrees =
    side === "left"
      ? BOSS_PEEK_RIGHT_TILT_DEGREES
      : -BOSS_PEEK_LEFT_TILT_DEGREES;
  const angle = (tiltDegrees * Math.PI) / 180;
  return { x, y, width, height, pivotX, pivotY, angle };
}

function drawWebcamWithSticker(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  stickerImage: HTMLImageElement,
  visibleSide: BossSide,
) {
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, width, height);
  context.drawImage(video, 0, 0, width, height);

  // The completed canvas is mirrored by CSS, so draw on the opposite raw edge.
  const rawSide = visibleSide === "left" ? "right" : "left";
  const aspectRatio =
    stickerImage.naturalWidth > 0 && stickerImage.naturalHeight > 0
      ? stickerImage.naturalWidth / stickerImage.naturalHeight
      : 300 / 420;
  const peek = getBossPeekGeometry(rawSide, width, height, aspectRatio);
  context.save();
  context.translate(peek.pivotX, peek.pivotY);
  context.rotate(peek.angle);
  context.drawImage(
    stickerImage,
    peek.x - peek.pivotX,
    peek.y - peek.pivotY,
    peek.width,
    peek.height,
  );
  context.restore();
}

/** Owns face-turn detection, normal webcam rendering, and the armed countdown. */
export function useHeadTurn({
  videoRef,
  canvasRef,
  enabled,
  countdownMs,
  onTurn,
  onTimeout,
  forcedBossSide,
  yawThreshold = 0.18,
  holdMs = 350,
  lostMs = 600,
}: HeadTurnOptions): HeadTurnState {
  const [state, setState] = useState<RuntimeState>(() =>
    initialState(countdownMs),
  );
  const [attempt, setAttempt] = useState(0);
  const onTurnRef = useRef(onTurn);
  const onTimeoutRef = useRef(onTimeout);
  onTurnRef.current = onTurn;
  onTimeoutRef.current = onTimeout;
  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    if (!enabled) {
      setState(initialState(countdownMs));
      return;
    }

    let stopped = false;
    let frame = 0;
    let stream: MediaStream | null = null;
    let landmarker: FaceLandmarker | null = null;

    async function start() {
      try {
        setState({
          ...initialState(countdownMs),
          phase: "loading",
        });
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not provide webcam access.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
          throw new Error("The webcam preview is unavailable.");
        }
        video.srcObject = stream;
        await video.play();

        let warning: string | null = null;
        let stickerImage: HTMLImageElement;
        if (BOSS_WEBCAM_STICKER_SRC) {
          try {
            stickerImage = await loadImage(BOSS_WEBCAM_STICKER_SRC);
          } catch {
            stickerImage = await loadImage(BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC);
            warning =
              "The configured friend sticker could not be loaded; showing the placeholder.";
          }
        } else {
          stickerImage = await loadImage(BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC);
          warning =
            "Friend sticker not configured; showing the placeholder from bossEvent.ts.";
        }

        const { FaceLandmarker, FilesetResolver } =
          await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_URL },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (stopped) {
          landmarker.close();
          return;
        }

        setState({
          phase: "waiting",
          yaw: 0,
          remainingMs: countdownMs,
          warning,
          error: null,
        });

        let visibleStickerSide = forcedBossSide ?? null;

        let armed = false;
        let deadline = 0;
        let turnSince: number | null = null;
        let lastSeen = performance.now();
        let lastVideoTime = -1;
        let lastFrameAt = 0;
        let lastUiUpdate = 0;

        const detect = (now: number) => {
          if (stopped || !landmarker) return;
          const hasNewFrame = video.currentTime !== lastVideoTime;
          if (
            video.readyState >= 2 &&
            hasNewFrame &&
            now - lastFrameAt >= FRAME_INTERVAL_MS
          ) {
            lastFrameAt = now;
            lastVideoTime = video.currentTime;

            const landmarks = landmarker.detectForVideo(video, now)
              .faceLandmarks[0];
            let turned = false;
            let yaw = 0;

            if (landmarks) {
              lastSeen = now;
              const left = landmarks[234];
              const right = landmarks[454];
              const nose = landmarks[1];
              if (left && right && nose && right.x !== left.x) {
                visibleStickerSide ??= chooseVisibleStickerSide(nose.x);
                yaw = (nose.x - left.x) / (right.x - left.x) - 0.5;
                if (!armed && Math.abs(yaw) < 0.08) {
                  armed = true;
                  deadline = now + countdownMs;
                  setState((current) => ({
                    ...current,
                    phase: "armed",
                    remainingMs: countdownMs,
                  }));
                }
                if (armed && Math.abs(yaw) > yawThreshold) {
                  turnSince ??= now;
                  turned = now - turnSince >= holdMs;
                } else {
                  turnSince = null;
                }
              }
            } else if (armed && now - lastSeen > lostMs) {
              turned = true;
            }

            drawWebcamWithSticker(
              video,
              canvas,
              stickerImage,
              visibleStickerSide ?? "right",
            );

            if (turned) {
              stopped = true;
              setState((current) => ({
                ...current,
                phase: "turned",
                yaw,
                remainingMs: Math.max(0, deadline - now),
              }));
              onTurnRef.current();
              return;
            }

            if (armed && now >= deadline) {
              stopped = true;
              setState((current) => ({
                ...current,
                phase: "timedOut",
                yaw,
                remainingMs: 0,
              }));
              onTimeoutRef.current();
              return;
            }

            if (now - lastUiUpdate > 100) {
              lastUiUpdate = now;
              setState((current) => ({
                ...current,
                yaw,
                remainingMs: armed ? Math.max(0, deadline - now) : countdownMs,
              }));
            }
          }
          frame = requestAnimationFrame(detect);
        };
        frame = requestAnimationFrame(detect);
      } catch (caught) {
        if (!stopped) {
          const message =
            caught instanceof Error
              ? caught.message
              : "Could not start the camera.";
          setState({
            ...initialState(countdownMs),
            error: message,
          });
        }
      }
    }

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      landmarker?.close();
    };
  }, [
    attempt,
    canvasRef,
    countdownMs,
    enabled,
    forcedBossSide,
    holdMs,
    lostMs,
    videoRef,
    yawThreshold,
  ]);

  return { ...state, retry };
}
