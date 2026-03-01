import { useState, useEffect, useRef } from "react";

const S = { IDLE: "idle", LISTEN: "listen", THINK: "think", SPEAK: "speak" } as const;
type State = (typeof S)[keyof typeof S];

const LABEL: Record<State, string> = {
  [S.IDLE]: "Нажмите, чтобы начать сеанс",
  [S.LISTEN]: "Я вас внимательно слушаю…",
  [S.THINK]: "Позвольте подумать…",
  [S.SPEAK]: "Хочу поделиться мыслями…",
};

const PAL: Record<State, { a: string; g: string; bg: string }> = {
  [S.IDLE]:   { a: "#88c8f8", g: "#5090d0", bg: "#2a4060" },
  [S.LISTEN]: { a: "#7bc4a8", g: "#58aa88", bg: "#2a5040" },
  [S.THINK]:  { a: "#d8b468", g: "#c09838", bg: "#504020" },
  [S.SPEAK]:  { a: "#a088d8", g: "#7858b8", bg: "#3a2860" },
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

  const cycle = () => {
    if (externalState) return;
    setSt(p => {
      const o: State[] = [S.IDLE, S.LISTEN, S.THINK, S.SPEAK];
      return o[(o.indexOf(p) + 1) % o.length];
    });
  };

  // Inject keyframes once
  useEffect(() => {
    const id = "psy-orb-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes orb-ring1 {
        0% { transform: scale(0.9); opacity: 0.35; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes orb-ring2 {
        0% { transform: scale(0.9); opacity: 0.25; }
        100% { transform: scale(2.6); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Canvas animation for the sphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = 120;
    canvas.width = size * 2;
    canvas.height = size * 2;
    let t = 0;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const targetColor = { r: 0, g: 0, b: 0 };
    const currentColor = { r: 136, g: 200, b: 248 };

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      t += 0.016;
      ctx.clearRect(0, 0, size * 2, size * 2);

      const cx = size;
      const cy = size;
      const baseR = 44;

      // Lerp color
      const tc = hexToRgb(c.a);
      targetColor.r = tc.r; targetColor.g = tc.g; targetColor.b = tc.b;
      currentColor.r += (targetColor.r - currentColor.r) * 0.02;
      currentColor.g += (targetColor.g - currentColor.g) * 0.02;
      currentColor.b += (targetColor.b - currentColor.b) * 0.02;
      const cr = Math.round(currentColor.r);
      const cg = Math.round(currentColor.g);
      const cb = Math.round(currentColor.b);

      // Breathing scale
      const s = currentState;
      const breathSpeed = s === "speak" ? 5 : s === "listen" ? 1.5 : s === "think" ? 2.5 : 0.8;
      const breathAmp = s === "speak" ? 0.12 : s === "listen" ? 0.04 : s === "think" ? 0.06 : 0.03;
      const breath = 1 + Math.sin(t * breathSpeed) * breathAmp;

      // Wobble for speak
      const wobbleX = s === "speak" ? Math.sin(t * 7) * 2 : 0;
      const wobbleY = s === "speak" ? Math.cos(t * 5.5) * 1.5 : 0;

      const r = baseR * breath;
      const ox = cx + wobbleX;
      const oy = cy + wobbleY;

      // Outer glow
      const glow = ctx.createRadialGradient(ox, oy, r * 0.5, ox, oy, r * 2.5);
      glow.addColorStop(0, `rgba(${cr},${cg},${cb},0.12)`);
      glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size * 2, size * 2);

      // Main sphere gradient
      const grad = ctx.createRadialGradient(ox - r * 0.3, oy - r * 0.3, r * 0.05, ox, oy, r);
      grad.addColorStop(0, `rgba(${Math.min(cr + 80, 255)},${Math.min(cg + 80, 255)},${Math.min(cb + 80, 255)},0.95)`);
      grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.85)`);
      grad.addColorStop(0.85, `rgba(${Math.max(cr - 40, 0)},${Math.max(cg - 40, 0)},${Math.max(cb - 40, 0)},0.9)`);
      grad.addColorStop(1, `rgba(${Math.max(cr - 80, 0)},${Math.max(cg - 80, 0)},${Math.max(cb - 80, 0)},0.6)`);

      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlight
      const spec = ctx.createRadialGradient(ox - r * 0.25, oy - r * 0.3, 0, ox - r * 0.2, oy - r * 0.2, r * 0.55);
      spec.addColorStop(0, "rgba(255,255,255,0.45)");
      spec.addColorStop(0.4, "rgba(255,255,255,0.1)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();

      // Edge shine (thin rim)
      ctx.beginPath();
      ctx.arc(ox, oy, r - 1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${Math.min(cr + 50, 255)},${Math.min(cg + 50, 255)},${Math.min(cb + 50, 255)},0.2)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [c.a, currentState]);

  const ringDuration = currentState === "speak" ? "1.5s" : currentState === "listen" ? "2.5s" : "3.5s";

  return (
    <div
      className={className}
      onClick={cycle}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#0e0e1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: externalState ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {/* Background ambient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at center, ${c.bg}30 0%, transparent 65%)`,
        transition: "background 2s",
      }} />

      {/* Pulsing rings */}
      <div style={{
        position: "absolute",
        width: 88,
        height: 88,
        borderRadius: "50%",
        border: `1.5px solid ${c.a}25`,
        animation: `orb-ring1 ${ringDuration} ease-out infinite`,
        transition: "border-color 1.5s",
      }} />
      <div style={{
        position: "absolute",
        width: 88,
        height: 88,
        borderRadius: "50%",
        border: `1px solid ${c.a}18`,
        animation: `orb-ring2 ${ringDuration} ease-out 0.5s infinite`,
        transition: "border-color 1.5s",
      }} />

      {/* Sphere canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: 120, height: 120, marginBottom: 4 }}
      />

      {/* Status label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        position: "relative",
      }}>
        <div style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.a,
          boxShadow: `0 0 6px ${c.g}`,
          transition: "all 1.2s",
        }} />
        <span style={{
          color: `${c.a}99`,
          fontSize: 11,
          fontStyle: "italic",
          transition: "color 1.5s",
          fontFamily: "system-ui, sans-serif",
        }}>
          {LABEL[currentState]}
        </span>
      </div>
    </div>
  );
}
