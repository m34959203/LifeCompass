import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const S = { IDLE: "idle", LISTEN: "listen", THINK: "think", SPEAK: "speak" } as const;
type State = (typeof S)[keyof typeof S];

const LABEL: Record<State, string> = {
  [S.IDLE]: "Нажмите, чтобы начать сеанс",
  [S.LISTEN]: "Я вас внимательно слушаю…",
  [S.THINK]: "Позвольте подумать…",
  [S.SPEAK]: "Хочу поделиться мыслями…",
};

const PAL: Record<State, { a: string; b: string; g: string }> = {
  [S.IDLE]:   { a: "#88c8f8", b: "#a0d8ff", g: "#5090d0" },
  [S.LISTEN]: { a: "#7bc4a8", b: "#a8dcc8", g: "#58aa88" },
  [S.THINK]:  { a: "#d8b468", b: "#e8d098", g: "#c09838" },
  [S.SPEAK]:  { a: "#a088d8", b: "#c0a8f0", g: "#7858b8" },
};

interface PsychologistProps {
  state?: State;
  className?: string;
}

export function PsychologistAvatar({ state: externalState, className }: PsychologistProps) {
  const box = useRef<HTMLDivElement>(null);
  const sr = useRef<State>(S.IDLE);
  const [st, setSt] = useState<State>(S.IDLE);

  const currentState = externalState ?? st;

  useEffect(() => { sr.current = currentState; }, [currentState]);

  const build = useCallback((scene: THREE.Scene) => {
    const root = new THREE.Group();

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({ color: "#e8e8f0", roughness: 0.3, metalness: 0.6 });
    const bodyDark = new THREE.MeshStandardMaterial({ color: "#b8b8c8", roughness: 0.35, metalness: 0.5 });
    const accent = new THREE.MeshStandardMaterial({ color: "#88c8f8", roughness: 0.2, metalness: 0.3, emissive: new THREE.Color("#88c8f8"), emissiveIntensity: 0.15 });
    const dark = new THREE.MeshStandardMaterial({ color: "#2a2a3a", roughness: 0.4, metalness: 0.7 });
    const screenMat = new THREE.MeshStandardMaterial({ color: "#1a1a2e", roughness: 0.1, metalness: 0.8 });
    const eyeGlow = new THREE.MeshBasicMaterial({ color: "#88c8f8" });
    const mouthGlow = new THREE.MeshBasicMaterial({ color: "#88c8f8" });
    const jointMat = new THREE.MeshStandardMaterial({ color: "#606078", roughness: 0.3, metalness: 0.8 });

    // === HEAD ===
    const hd = new THREE.Group();
    hd.position.y = 1.15;

    // Main head - rounded box shape (sphere scaled)
    const headMain = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), bodyMat);
    headMain.scale.set(1.1, 0.9, 0.9);
    hd.add(headMain);

    // Face screen (dark visor)
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 16, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.2, Math.PI * 0.55), screenMat);
    visor.position.z = 0.05;
    hd.add(visor);

    // Eyes - glowing circles
    const makeEye = (x: number) => {
      const eg = new THREE.Group();
      eg.position.set(x, 0.05, 0.44);

      // Outer ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 24), accent);
      eg.add(ring);

      // Inner glow
      const inner = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), eyeGlow);
      inner.position.z = 0.01;
      eg.add(inner);

      // Pupil
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
      pupil.position.z = 0.02;
      eg.add(pupil);

      return { group: eg, inner, ring, pupil };
    };

    const le = makeEye(-0.18);
    const re = makeEye(0.18);
    hd.add(le.group);
    hd.add(re.group);

    // Mouth - LED strip
    const mouthG = new THREE.Group();
    mouthG.position.set(0, -0.18, 0.44);

    const mouthParts: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.025, 8), mouthGlow);
      dot.position.x = (i - 2) * 0.07;
      mouthG.add(dot);
      mouthParts.push(dot);
    }
    hd.add(mouthG);

    // Antenna
    const antennaG = new THREE.Group();
    antennaG.position.set(0, 0.45, 0);

    const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.22, 8), dark);
    antPole.position.y = 0.11;
    antennaG.add(antPole);

    const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), accent);
    antBall.position.y = 0.26;
    antennaG.add(antBall);

    hd.add(antennaG);

    // Ear panels
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), bodyDark);
      ear.position.set(sx * 0.55, 0.05, 0);
      ear.rotation.z = Math.PI / 2;
      hd.add(ear);

      const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 16), accent);
      earRing.position.set(sx * 0.58, 0.05, 0);
      earRing.rotation.y = Math.PI / 2;
      hd.add(earRing);
    }

    root.add(hd);

    // === NECK ===
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12), jointMat);
    neck.position.y = 0.7;
    root.add(neck);

    // Neck rings
    for (let i = 0; i < 3; i++) {
      const nr = new THREE.Mesh(new THREE.TorusGeometry(0.11 + i * 0.005, 0.008, 6, 16), dark);
      nr.position.y = 0.65 + i * 0.05;
      nr.rotation.x = Math.PI / 2;
      root.add(nr);
    }

    // === BODY ===
    const bd = new THREE.Group();

    // Torso - rounded cylinder
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.7, 16), bodyMat);
    torso.position.y = 0.25;
    bd.add(torso);

    // Chest plate
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyDark);
    chest.position.set(0, 0.35, 0.12);
    chest.scale.set(0.8, 0.7, 0.3);
    bd.add(chest);

    // Heart light (center chest indicator)
    const heartLight = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: "#88c8f8" }));
    heartLight.position.set(0, 0.35, 0.26);
    bd.add(heartLight);

    // Chest detail lines
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.2 - i * 0.04, 0.008, 0.01), accent);
      line.position.set(0, 0.22 - i * 0.06, 0.26);
      bd.add(line);
    }

    // Belly panel
    const bellyPanel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.02), screenMat);
    bellyPanel.position.set(0, 0.05, 0.27);
    bd.add(bellyPanel);

    // Belly LEDs
    const bellyLeds: THREE.Mesh[] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const led = new THREE.Mesh(
          new THREE.CircleGeometry(0.015, 8),
          new THREE.MeshBasicMaterial({ color: "#88c8f8", transparent: true, opacity: 0.5 })
        );
        led.position.set(-0.04 + c * 0.04, 0.09 - r * 0.06, 0.285);
        bd.add(led);
        bellyLeds.push(led);
      }
    }

    root.add(bd);

    // === ARMS ===
    const makeArm = (sx: number) => {
      const ag = new THREE.Group();
      ag.position.set(sx * 0.42, 0.5, 0);

      // Shoulder joint
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), jointMat);
      ag.add(shoulder);

      // Upper arm
      const ua = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.3, 10), bodyMat);
      ua.position.y = -0.2;
      ag.add(ua);

      // Elbow joint
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), jointMat);
      elbow.position.y = -0.37;
      ag.add(elbow);

      // Forearm
      const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.25, 10), bodyDark);
      fa.position.y = -0.52;
      ag.add(fa);

      // Hand - round claw
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), bodyMat);
      hand.position.y = -0.68;
      hand.scale.set(1, 0.7, 1.1);
      ag.add(hand);

      // Fingers (3 stubby)
      for (let f = 0; f < 3; f++) {
        const ang = ((f - 1) * 0.4) * sx;
        const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.06, 6), jointMat);
        finger.position.set(Math.sin(ang) * 0.04 * sx, -0.73, Math.cos(ang) * 0.04);
        finger.rotation.x = 0.3;
        finger.rotation.z = -ang * 0.3;
        ag.add(finger);
      }

      return ag;
    };

    const la = makeArm(-1);
    const ra = makeArm(1);
    root.add(la);
    root.add(ra);

    root.position.y = -0.6;
    scene.add(root);

    return {
      root, hd, le, re, mouthG, mouthParts, antennaG, antBall,
      heartLight, bellyLeds, la, ra, eyeGlow, mouthGlow, accent
    };
  }, []);

  const init = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0e0e1a");
    scene.fog = new THREE.FogExp2(0x0e0e1a, 0.06);

    const cam = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);
    cam.position.set(0, 0.8, 3.0);
    cam.lookAt(0, 0.5, 0);

    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setSize(W, H);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.toneMapping = THREE.ACESFilmicToneMapping;
    ren.toneMappingExposure = 1.2;
    el.appendChild(ren.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0x1a1a2e, 0.8));

    const key = new THREE.DirectionalLight(0xc8d8ff, 1.2);
    key.position.set(2, 4, 4);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8888cc, 0.4);
    fill.position.set(-3, 2, 2);
    scene.add(fill);

    const rimLight = new THREE.PointLight(0x4488ff, 0.8, 6);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    const faceLight = new THREE.PointLight(0x88c8f8, 0.4, 4);
    faceLight.position.set(0, 1.2, 2);
    scene.add(faceLight);

    // Background - subtle grid floor
    const gridFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: "#0a0a14", roughness: 0.9 })
    );
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.y = -1.2;
    scene.add(gridFloor);

    // Grid lines
    const gridMat = new THREE.MeshBasicMaterial({ color: "#1a1a3a", transparent: true, opacity: 0.3 });
    for (let i = -5; i <= 5; i++) {
      const lineH = new THREE.Mesh(new THREE.BoxGeometry(10, 0.003, 0.003), gridMat);
      lineH.position.set(0, -1.19, i);
      scene.add(lineH);
      const lineV = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 10), gridMat);
      lineV.position.set(i, -1.19, 0);
      scene.add(lineV);
    }

    // Floating particles (digital sparks)
    const pN = 60;
    const pGeo = new THREE.BufferGeometry();
    const pp = new Float32Array(pN * 3);
    for (let i = 0; i < pN; i++) {
      pp[i * 3] = (Math.random() - 0.5) * 5;
      pp[i * 3 + 1] = Math.random() * 3 - 0.5;
      pp[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: "#88c8f8", size: 0.015, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending
    }));
    scene.add(pts);

    const p = build(scene);

    // Animate
    let fid: number;
    const clk = new THREE.Clock();
    let blinkT = 0, blinking = false, blinkP = 0;

    const anim = () => {
      fid = requestAnimationFrame(anim);
      const t = clk.getElapsedTime();
      const s = sr.current;
      const c = PAL[s];
      const cColor = new THREE.Color(c.a);

      // Update accent colors smoothly
      p.eyeGlow.color.lerp(cColor, 0.02);
      p.mouthGlow.color.lerp(cColor, 0.02);
      p.accent.color.lerp(cColor, 0.02);
      p.accent.emissive.lerp(cColor, 0.02);
      (p.heartLight.material as THREE.MeshBasicMaterial).color.lerp(cColor, 0.02);
      faceLight.color.lerp(cColor, 0.02);

      // Blink
      blinkT += 0.016;
      if (!blinking && blinkT > 3 + Math.random() * 3) { blinking = true; blinkP = 0; blinkT = 0; }
      if (blinking) { blinkP += 0.14; if (blinkP >= 1) { blinking = false; blinkP = 0; } }
      const bv = blinking ? Math.sin(blinkP * Math.PI) : 0;
      const es = 1 - bv * 0.95;
      p.le.inner.scale.y = es;
      p.re.inner.scale.y = es;
      p.le.ring.scale.y = es;
      p.re.ring.scale.y = es;
      p.le.pupil.scale.y = es;
      p.re.pupil.scale.y = es;

      // Head movement
      const hby = 1.15;
      if (s === S.IDLE) {
        p.hd.rotation.x = Math.sin(t * 0.4) * 0.03;
        p.hd.rotation.y = Math.sin(t * 0.25) * 0.05;
        p.hd.rotation.z = Math.sin(t * 0.3) * 0.02;
        p.hd.position.y = hby + Math.sin(t * 0.8) * 0.015;
      } else if (s === S.LISTEN) {
        p.hd.rotation.x = Math.sin(t * 1.0) * 0.06 - 0.04;
        p.hd.rotation.y = Math.sin(t * 0.3) * 0.03;
        p.hd.rotation.z = Math.sin(t * 0.5) * 0.06;
        p.hd.position.y = hby;
      } else if (s === S.THINK) {
        p.hd.rotation.x = -0.05;
        p.hd.rotation.y = Math.sin(t * 0.4) * 0.2 + 0.12;
        p.hd.rotation.z = 0.05;
        p.hd.position.y = hby + 0.01;
      } else {
        p.hd.rotation.x = Math.sin(t * 1.2) * 0.04;
        p.hd.rotation.y = Math.sin(t * 0.7) * 0.06;
        p.hd.rotation.z = Math.sin(t * 0.9) * 0.03;
        p.hd.position.y = hby + Math.sin(t * 1.8) * 0.008;
      }

      // Antenna wobble
      p.antennaG.rotation.z = Math.sin(t * 1.5) * 0.08;
      p.antennaG.rotation.x = Math.sin(t * 1.2) * 0.05;
      const antPulse = 0.8 + Math.sin(t * 3) * 0.2;
      (p.antBall.material as THREE.MeshStandardMaterial).emissiveIntensity = antPulse * 0.3;

      // Mouth animation
      if (s === S.SPEAK) {
        p.mouthParts.forEach((dot, i) => {
          const scale = 0.6 + Math.abs(Math.sin(t * 8 + i * 1.2)) * 0.8;
          dot.scale.set(1, scale, 1);
        });
      } else if (s === S.LISTEN) {
        p.mouthParts.forEach((dot, i) => {
          dot.scale.set(1, i === 2 ? 1.1 : 0.8, 1);
        });
      } else if (s === S.THINK) {
        p.mouthParts.forEach((dot, i) => {
          const vis = i <= Math.floor(t * 2 % 5) ? 1 : 0.3;
          dot.scale.set(vis, vis, 1);
        });
      } else {
        p.mouthParts.forEach((dot) => {
          dot.scale.set(1, 0.6, 1);
        });
      }

      // Heart light pulse
      const heartPulse = s === S.LISTEN ? 0.6 + Math.sin(t * 2) * 0.4 :
                         s === S.THINK ? 0.3 + Math.sin(t * 4) * 0.2 :
                         s === S.SPEAK ? 0.5 + Math.abs(Math.sin(t * 5)) * 0.5 :
                         0.4 + Math.sin(t * 1.2) * 0.2;
      (p.heartLight.material as THREE.MeshBasicMaterial).opacity = heartPulse;

      // Belly LEDs
      p.bellyLeds.forEach((led, i) => {
        const phase = t * 2 + i * 0.8;
        (led.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(phase) * 0.3;
      });

      // Arms
      if (s === S.IDLE) {
        p.la.rotation.z = 0.08 + Math.sin(t * 0.5) * 0.02;
        p.ra.rotation.z = -0.08 - Math.sin(t * 0.5) * 0.02;
        p.la.rotation.x = 0; p.ra.rotation.x = 0;
      } else if (s === S.LISTEN) {
        p.la.rotation.z = 0.15 + Math.sin(t * 0.4) * 0.02;
        p.ra.rotation.z = -0.15 - Math.sin(t * 0.4) * 0.02;
        p.la.rotation.x = -0.06; p.ra.rotation.x = -0.06;
      } else if (s === S.THINK) {
        p.la.rotation.z = 0.1; p.la.rotation.x = -0.08;
        p.ra.rotation.z = -0.35; p.ra.rotation.x = -0.5;
      } else {
        p.la.rotation.z = 0.15 + Math.sin(t * 1.3) * 0.12;
        p.la.rotation.x = -0.1 + Math.sin(t * 1.0) * 0.08;
        p.ra.rotation.z = -0.15 - Math.sin(t * 1.3 + 0.7) * 0.12;
        p.ra.rotation.x = -0.1 + Math.sin(t * 1.0 + 0.7) * 0.08;
      }

      // Hover / float
      p.root.position.y = -0.6 + Math.sin(t * 1.0) * 0.025;

      // Particles drift
      const dp = pts.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pN; i++) {
        dp[i * 3 + 1] += Math.sin(t * 0.2 + i) * 0.0004;
        dp[i * 3] += Math.cos(t * 0.15 + i * 0.5) * 0.0003;
      }
      pts.geometry.attributes.position.needsUpdate = true;

      // Camera
      cam.position.x = Math.sin(t * 0.08) * 0.08;
      cam.position.y = 0.8 + Math.sin(t * 0.06) * 0.04;
      cam.lookAt(0, 0.5, 0);

      ren.render(scene, cam);
    };
    anim();

    const onR = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); ren.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(fid); window.removeEventListener("resize", onR); ren.dispose(); if (el.contains(ren.domElement)) el.removeChild(ren.domElement); };
  }, [build]);

  useEffect(() => { const cleanup = init(box.current); return cleanup; }, [init]);

  const cycle = () => {
    if (externalState) return;
    setSt(p => { const o: State[] = [S.IDLE, S.LISTEN, S.THINK, S.SPEAK]; return o[(o.indexOf(p) + 1) % o.length]; });
  };

  const c = PAL[currentState];

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", background: "#0e0e1a" }}>
      <div ref={box} style={{ position: "absolute", inset: 0, cursor: externalState ? "default" : "pointer" }} onClick={cycle} />

      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${c.g}12 0%, transparent 70%)`, pointerEvents: "none", transition: "background 3s" }} />

      {/* Status label */}
      <div style={{ position: "absolute", top: 12, left: 0, right: 0, zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.a, boxShadow: `0 0 8px ${c.g}`, transition: "all 1.2s" }} />
        <span style={{ color: `${c.a}90`, fontSize: 11, fontStyle: "italic", transition: "color 1.5s", fontFamily: "system-ui, sans-serif" }}>
          {LABEL[currentState]}
        </span>
      </div>
    </div>
  );
}
