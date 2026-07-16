import { useEffect, useRef } from "react";

type HeroVideoProps = {
  imageSrc: string;
};

const drawCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) => {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  const drawWidth = imageRatio > canvasRatio ? height * imageRatio : width;
  const drawHeight = imageRatio > canvasRatio ? height : width / imageRatio;

  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
};

export function HeroVideo({ imageSrc }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();
    let animationFrame = 0;
    let isDisposed = false;

    if (!video || !context || !("captureStream" in canvas)) {
      return;
    }

    canvas.width = 1280;
    canvas.height = 720;
    image.src = imageSrc;

    const paintFrame = (time: number) => {
      if (isDisposed) return;

      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(Math.sin(time / 7000) * 20, Math.cos(time / 9000) * 12);
      context.scale(1.08, 1.08);
      drawCover(context, image, width, height);
      context.restore();

      const warmth = context.createLinearGradient(0, 0, width, height);
      warmth.addColorStop(0, "rgba(25, 18, 16, 0.68)");
      warmth.addColorStop(0.5, "rgba(45, 29, 23, 0.22)");
      warmth.addColorStop(1, "rgba(141, 68, 38, 0.46)");
      context.fillStyle = warmth;
      context.fillRect(0, 0, width, height);

      const radius = 280 + Math.sin(time / 2300) * 30;
      const glow = context.createRadialGradient(width * 0.76, height * 0.25, 0, width * 0.76, height * 0.25, radius);
      glow.addColorStop(0, "rgba(238, 191, 123, 0.28)");
      glow.addColorStop(1, "rgba(238, 191, 123, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(255, 242, 225, 0.15)";
      context.lineWidth = 1;
      for (let line = 0; line < 8; line += 1) {
        const y = height * 0.2 + line * 68 + Math.sin(time / 1800 + line) * 9;
        context.beginPath();
        context.moveTo(width * 0.42, y);
        context.lineTo(width, y - 170);
        context.stroke();
      }

    };

    const render = (time: number) => {
      paintFrame(time);
      if (!isDisposed) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const start = async () => {
      try {
        await image.decode();
        paintFrame(window.performance.now());
        const stream = canvas.captureStream(24);
        video.srcObject = stream;
        await video.play();
        animationFrame = window.requestAnimationFrame(render);
      } catch {
        // The CSS poster remains visible when a browser blocks canvas video playback.
      }
    };

    void start();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrame);
      const stream = video.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
    };
  }, [imageSrc]);

  return <video ref={videoRef} aria-hidden="true" className="hero-video" muted playsInline />;
}
