import { useEffect, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

interface AREffectsPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  effect: string;
}

export const AREffectsPanel = ({ videoRef, effect }: AREffectsPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Apply different effects based on selection
        switch (effect) {
          case "dog":
            drawDogEars(ctx, landmarks, canvas);
            drawDogNose(ctx, landmarks, canvas);
            break;
          case "cat":
            drawCatEars(ctx, landmarks, canvas);
            drawCatWhiskers(ctx, landmarks, canvas);
            break;
          case "sunglasses":
            drawSunglasses(ctx, landmarks, canvas);
            break;
          case "crown":
            drawCrown(ctx, landmarks, canvas);
            break;
          case "heart":
            drawHeartEyes(ctx, landmarks, canvas);
            break;
        }
      }
    });

    faceMeshRef.current = faceMesh;

    // Start camera
    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMesh && videoRef.current) {
            await faceMesh.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
      cameraRef.current = camera;
    }

    return () => {
      faceMesh.close();
      cameraRef.current?.stop();
    };
  }, [videoRef, effect]);

  // Effect drawing functions
  const drawDogEars = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const forehead = landmarks[10];
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];

    // Left ear
    ctx.save();
    ctx.translate(leftEar.x * canvas.width, leftEar.y * canvas.height - 60);
    ctx.rotate(-0.5);
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFB6C1";
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right ear
    ctx.save();
    ctx.translate(rightEar.x * canvas.width, rightEar.y * canvas.height - 60);
    ctx.rotate(0.5);
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFB6C1";
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawDogNose = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const nose = landmarks[4];
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCatEars = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];

    // Left ear
    ctx.fillStyle = "#FFB6C1";
    ctx.beginPath();
    ctx.moveTo(leftEar.x * canvas.width - 30, leftEar.y * canvas.height - 20);
    ctx.lineTo(leftEar.x * canvas.width - 60, leftEar.y * canvas.height - 100);
    ctx.lineTo(leftEar.x * canvas.width, leftEar.y * canvas.height - 20);
    ctx.fill();
    ctx.strokeStyle = "#FF69B4";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right ear
    ctx.beginPath();
    ctx.moveTo(rightEar.x * canvas.width + 30, rightEar.y * canvas.height - 20);
    ctx.lineTo(rightEar.x * canvas.width + 60, rightEar.y * canvas.height - 100);
    ctx.lineTo(rightEar.x * canvas.width, rightEar.y * canvas.height - 20);
    ctx.fill();
    ctx.stroke();
  };

  const drawCatWhiskers = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const nose = landmarks[4];
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    // Left whiskers
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(nose.x * canvas.width, nose.y * canvas.height);
      ctx.lineTo(nose.x * canvas.width - 60 - i * 10, nose.y * canvas.height - 20 + i * 15);
      ctx.stroke();
    }

    // Right whiskers
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(nose.x * canvas.width, nose.y * canvas.height);
      ctx.lineTo(nose.x * canvas.width + 60 + i * 10, nose.y * canvas.height - 20 + i * 15);
      ctx.stroke();
    }
  };

  const drawSunglasses = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const nose = landmarks[4];

    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 4;

    // Left lens
    ctx.beginPath();
    ctx.ellipse(leftEye.x * canvas.width, leftEye.y * canvas.height, 50, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.ellipse(rightEye.x * canvas.width, rightEye.y * canvas.height, 50, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(leftEye.x * canvas.width + 50, leftEye.y * canvas.height);
    ctx.lineTo(rightEye.x * canvas.width - 50, rightEye.y * canvas.height);
    ctx.stroke();

    // Shine effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(leftEye.x * canvas.width - 15, leftEye.y * canvas.height - 10, 15, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rightEye.x * canvas.width - 15, rightEye.y * canvas.height - 10, 15, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCrown = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const forehead = landmarks[10];
    
    ctx.save();
    ctx.translate(forehead.x * canvas.width, forehead.y * canvas.height - 100);
    
    // Crown base
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#FFA500";
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(-80, 30);
    ctx.lineTo(-60, -20);
    ctx.lineTo(-40, 20);
    ctx.lineTo(-20, -30);
    ctx.lineTo(0, 20);
    ctx.lineTo(20, -30);
    ctx.lineTo(40, 20);
    ctx.lineTo(60, -20);
    ctx.lineTo(80, 30);
    ctx.lineTo(80, 50);
    ctx.lineTo(-80, 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Jewels
    const jewels = [-50, -15, 20, 55];
    ctx.fillStyle = "#FF0000";
    jewels.forEach(x => {
      ctx.beginPath();
      ctx.arc(x, 35, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  };

  const drawHeartEyes = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    const drawHeart = (x: number, y: number, size: number) => {
      ctx.fillStyle = "#FF1493";
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.bezierCurveTo(x, y, x - size / 2, y - size / 2, x - size / 2, y + size / 4);
      ctx.bezierCurveTo(x - size / 2, y + size * 0.75, x, y + size, x, y + size);
      ctx.bezierCurveTo(x, y + size, x + size / 2, y + size * 0.75, x + size / 2, y + size / 4);
      ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y, x, y + size / 4);
      ctx.fill();
    };

    drawHeart(leftEye.x * canvas.width, leftEye.y * canvas.height, 40);
    drawHeart(rightEye.x * canvas.width, rightEye.y * canvas.height, 40);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      width={1280}
      height={720}
    />
  );
};
