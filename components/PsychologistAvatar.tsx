import { useState, useEffect, useRef } from "react";

const S = { IDLE: "idle", LISTEN: "listen", THINK: "think", SPEAK: "speak" } as const;
type State = (typeof S)[keyof typeof S];

const PAL: Record<State, { a: string; g: string; bg: string }> = {
  [S.IDLE]:   { a: "#88c8f8", g: "#5090d0", bg: "#2a4060" },
  [S.LISTEN]: { a: "#4ade80", g: "#22c55e", bg: "#1a4030" },
  [S.THINK]:  { a: "#fbbf24", g: "#d97706", bg: "#4a3520" },
  [S.SPEAK]:  { a: "#a78bfa", g: "#7c3aed", bg: "#2a1850" },
};

interface PsychologistProps {
  state?: State;
  className?: string;
}

export function PsychologistAvatar({ state: externalState, className }: PsychologistProps) {
  const [st, setSt] = useState<State>(S.IDLE);
  const currentState = externalState ?? st;
  const c = PAL[currentState];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cycle = () => {
    if (externalState) return;
    setSt(p => {
      const o: State[] = [S.IDLE, S.LISTEN, S.THINK, S.SPEAK];
      return o[(o.indexOf(p) + 1) % o.length];
    });
  };

  useEffect(() => {
    const id = "psy-orb-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes orb-ring1 {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.35; }
        100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
      }
      @keyframes orb-ring2 {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.25; }
        100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let t = 0;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const currentColor = { r: 136, g: 200, b: 248 };

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      t += 0.016;

      const w = container.clientWidth;
      const h = container.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.32;

      // Lerp color
      const tc = hexToRgb(c.a);
      currentColor.r += (tc.r - currentColor.r) * 0.025;
      currentColor.g += (tc.g - currentColor.g) * 0.025;
      currentColor.b += (tc.b - currentColor.b) * 0.025;
      const cr = Math.round(currentColor.r);
      const cg = Math.round(currentColor.g);
      const cb = Math.round(currentColor.b);

      // Breathing
      const s = currentState;
      const breathSpeed = s === "speak" ? 4 : s === "listen" ? 2 : s === "think" ? 3 : 0.8;
      const breathAmp = s === "speak" ? 0.08 : s === "listen" ? 0.06 : s === "think" ? 0.04 : 0.02;
      const breath = 1 + Math.sin(t * breathSpeed) * breathAmp;

      // Wobble
      const wobbleX = s === "speak" ? Math.sin(t * 5) * 3 : s === "listen" ? Math.sin(t * 2) * 1.5 : 0;
      const wobbleY = s === "speak" ? Math.cos(t * 4) * 2 : 0;

      const r = baseR * breath;
      const ox = cx + wobbleX;
      const oy = cy + wobbleY;

      // Outer glow (large)
      const glow = ctx.createRadialGradient(ox, oy, r * 0.3, ox, oy, r * 2.5);
      glow.addColorStop(0, `rgba(${cr},${cg},${cb},0.15)`);
      glow.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.04)`);
      glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Main sphere
      const grad = ctx.createRadialGradient(ox - r * 0.3, oy - r * 0.35, r * 0.05, ox, oy, r);
      grad.addColorStop(0, `rgba(${Math.min(cr + 90, 255)},${Math.min(cg + 90, 255)},${Math.min(cb + 90, 255)},0.95)`);
      grad.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.9)`);
      grad.addColorStop(0.8, `rgba(${Math.max(cr - 50, 0)},${Math.max(cg - 50, 0)},${Math.max(cb - 50, 0)},0.85)`);
      grad.addColorStop(1, `rgba(${Math.max(cr - 100, 0)},${Math.max(cg - 100, 0)},${Math.max(cb - 100, 0)},0.5)`);
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlight
      const spec = ctx.createRadialGradient(ox - r * 0.28, oy - r * 0.32, 0, ox - r * 0.2, oy - r * 0.22, r * 0.5);
      spec.addColorStop(0, "rgba(255,255,255,0.5)");
      spec.addColorStop(0.3, "rgba(255,255,255,0.15)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();

      // Rim light
      ctx.beginPath();
      ctx.arc(ox, oy, r - 1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${Math.min(cr + 60, 255)},${Math.min(cg + 60, 255)},${Math.min(cb + 60, 255)},0.15)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner energy lines (for speak/listen)
      if (s === "speak" || s === "listen") {
        for (let i = 0; i < 6; i++) {
          const a = (t * 0.5 + i * Math.PI / 3) % (Math.PI * 2);
          const lineR = r * (0.5 + Math.sin(t * 3 + i) * 0.2);
          const lx = ox + Math.cos(a) * lineR;
          const ly = oy + Math.sin(a) * lineR;
          const lineGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 0.15);
          lineGrad.addColorStop(0, `rgba(255,255,255,${s === "speak" ? 0.15 : 0.08})`);
          lineGrad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = lineGrad;
          ctx.beginPath();
          ctx.arc(lx, ly, r * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [c.a, currentState]);

  const ringSize = Math.min(200, 120);
  const ringDuration = currentState === "speak" ? "1.2s" : currentState === "listen" ? "2s" : "3.5s";

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={cycle}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: externalState ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {/* Pulsing rings */}
      <div style={{
        position: "absolute",
        width: ringSize,
        height: ringSize,
        left: "50%",
        top: "50%",
        borderRadius: "50%",
        border: `1.5px solid ${c.a}30`,
        animation: `orb-ring1 ${ringDuration} ease-out infinite`,
        transition: "border-color 1.5s",
      }} />
      <div style={{
        position: "absolute",
        width: ringSize,
        height: ringSize,
        left: "50%",
        top: "50%",
        borderRadius: "50%",
        border: `1px solid ${c.a}20`,
        animation: `orb-ring2 ${ringDuration} ease-out 0.6s infinite`,
        transition: "border-color 1.5s",
      }} />

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
