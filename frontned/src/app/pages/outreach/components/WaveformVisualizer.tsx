"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  state:
    | "IDLE"
    | "CONNECTING"
    | "RINGING"
    | "CONNECTED"
    | "LISTENING"
    | "THINKING"
    | "SPEAKING"
    | "COMPLETED"
    | "FAILED";
  className?: string;
}

export function WaveformVisualizer({ state, className = "" }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const numBars = 32;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / numBars - 2;
      const centerY = height / 2;

      let baseAmplitude = 4;
      let speed = 0.05;
      let color1 = "rgba(56, 189, 248, 0.4)"; // Sky
      let color2 = "rgba(14, 165, 233, 0.8)";

      if (state === "SPEAKING") {
        baseAmplitude = 22;
        speed = 0.18;
        color1 = "rgba(56, 189, 248, 0.9)";
        color2 = "rgba(99, 102, 241, 0.95)";
      } else if (state === "LISTENING") {
        baseAmplitude = 14;
        speed = 0.12;
        color1 = "rgba(52, 211, 153, 0.85)";
        color2 = "rgba(16, 185, 129, 0.95)";
      } else if (state === "THINKING") {
        baseAmplitude = 8;
        speed = 0.08;
        color1 = "rgba(168, 85, 247, 0.8)";
        color2 = "rgba(236, 72, 153, 0.85)";
      } else if (state === "CONNECTED") {
        baseAmplitude = 6;
        speed = 0.06;
      }

      phase += speed;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2) + 1;
        const normalized = (i - numBars / 2) / (numBars / 2);
        const gaussian = Math.exp(-Math.pow(normalized, 2) * 2.5);

        const sin1 = Math.sin(phase + i * 0.35);
        const sin2 = Math.cos(phase * 0.8 + i * 0.2);
        const currentAmp = baseAmplitude * gaussian * (0.4 + 0.6 * Math.abs(sin1 + sin2));

        const barHeight = Math.max(3, currentAmp);

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color1);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 3);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} width={340} height={64} className="h-16 w-full max-w-sm rounded-lg" />
    </div>
  );
}
