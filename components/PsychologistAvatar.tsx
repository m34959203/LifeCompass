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
  [S.IDLE]:   { a: "#d4a574", b: "#e8c9a0", g: "#c89050" },
  [S.LISTEN]: { a: "#7bc4a8", b: "#a8dcc8", g: "#58aa88" },
  [S.THINK]:  { a: "#d8b468", b: "#e8d098", g: "#c09838" },
  [S.SPEAK]:  { a: "#88b0d8", b: "#a8c8e8", g: "#5888b8" },
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

    const skin = new THREE.MeshStandardMaterial({ color: "#f0c8a8", roughness: 0.55, metalness: 0.01 });
    const skinSh = new THREE.MeshStandardMaterial({ color: "#e0b494", roughness: 0.5, metalness: 0.01 });
    const skinLight = new THREE.MeshStandardMaterial({ color: "#f8d8c0", roughness: 0.5, metalness: 0.01 });
    const lip = new THREE.MeshStandardMaterial({ color: "#d08878", roughness: 0.35, metalness: 0.02 });
    const hair = new THREE.MeshStandardMaterial({ color: "#2a1810", roughness: 0.82, metalness: 0.03 });
    const hairHL = new THREE.MeshStandardMaterial({ color: "#4a2818", roughness: 0.78, metalness: 0.03 });
    const eyeW = new THREE.MeshStandardMaterial({ color: "#f8f4f0", roughness: 0.2 });
    const iris = new THREE.MeshStandardMaterial({ color: "#6a5038", roughness: 0.2, emissive: new THREE.Color("#6a5038"), emissiveIntensity: 0.1 });
    const pupil = new THREE.MeshStandardMaterial({ color: "#0e0808" });
    const browM = new THREE.MeshStandardMaterial({ color: "#2a1810", roughness: 0.7 });
    const lashM = new THREE.MeshStandardMaterial({ color: "#1a0e08", roughness: 0.5 });
    const sweater = new THREE.MeshStandardMaterial({ color: "#f0e8dc", roughness: 0.8, metalness: 0.0 });
    const sweaterSh = new THREE.MeshStandardMaterial({ color: "#e0d8c8", roughness: 0.75 });

    // HEAD
    const hd = new THREE.Group();
    hd.position.y = 2.4;

    const sk = new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 32), skin);
    sk.scale.set(0.98, 1.06, 0.94);
    hd.add(sk);

    const ff = new THREE.Mesh(new THREE.SphereGeometry(0.54, 32, 32), skin);
    ff.scale.set(0.88, 0.96, 0.22);
    ff.position.z = 0.38;
    hd.add(ff);

    const fh = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4), skin);
    fh.position.set(0, 0.18, 0.12);
    fh.scale.set(1.05, 0.55, 0.85);
    hd.add(fh);

    for (const sx of [-1, 1]) {
      const ch = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), skinLight);
      ch.position.set(sx * 0.28, -0.08, 0.34);
      ch.scale.set(0.85, 0.7, 0.5);
      hd.add(ch);
      const bl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12),
        new THREE.MeshStandardMaterial({ color: "#f0a898", roughness: 0.6, transparent: true, opacity: 0.3 }));
      bl.position.set(sx * 0.3, -0.12, 0.38);
      bl.scale.set(1.1, 0.55, 0.25);
      hd.add(bl);
    }

    const cn = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skin);
    cn.position.set(0, -0.38, 0.28);
    cn.scale.set(1.0, 0.7, 0.6);
    hd.add(cn);

    const jw = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skin);
    jw.position.set(0, -0.24, 0.1);
    jw.scale.set(1.15, 0.42, 0.7);
    hd.add(jw);

    // Nose
    const nsG = new THREE.Group();
    nsG.position.set(0, -0.02, 0.54);
    const nsBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.038, 0.17, 8), skinSh);
    nsBridge.rotation.x = -0.12;
    nsG.add(nsBridge);
    const nsTip = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), skinSh);
    nsTip.position.set(0, -0.09, 0.012);
    nsG.add(nsTip);
    for (const sx of [-1, 1]) {
      const nt = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), skinSh);
      nt.position.set(sx * 0.028, -0.1, -0.005);
      nsG.add(nt);
    }
    hd.add(nsG);

    // Eyes
    const makeEye = (x: number) => {
      const eg = new THREE.Group();
      eg.position.set(x, 0.06, 0.47);

      const sc = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), skinSh);
      sc.scale.set(1.3, 0.85, 0.45);
      sc.position.z = -0.015;
      eg.add(sc);

      const wh = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 16), eyeW);
      wh.scale.set(1.2, 0.78, 0.52);
      eg.add(wh);

      const ir = new THREE.Mesh(new THREE.CircleGeometry(0.036, 24), iris);
      ir.position.z = 0.036;
      eg.add(ir);

      const pu = new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), pupil);
      pu.position.z = 0.038;
      eg.add(pu);

      const hl = new THREE.Mesh(new THREE.CircleGeometry(0.007, 8), new THREE.MeshBasicMaterial({ color: "#fff" }));
      hl.position.set(0.01, 0.01, 0.04);
      eg.add(hl);
      const hl2 = new THREE.Mesh(new THREE.CircleGeometry(0.004, 6), new THREE.MeshBasicMaterial({ color: "#ffffffc0" }));
      hl2.position.set(-0.008, -0.006, 0.04);
      eg.add(hl2);

      for (let i = 0; i < 8; i++) {
        const ang = -0.8 + (i / 7) * 1.6;
        const lG = new THREE.CylinderGeometry(0.003, 0.001, 0.025, 3);
        const la = new THREE.Mesh(lG, lashM);
        la.position.set(Math.sin(ang) * 0.065, Math.cos(ang) * 0.04 + 0.01, 0.02);
        la.rotation.z = -ang * 0.5;
        la.rotation.x = -0.4;
        eg.add(la);
      }

      const llG = new THREE.TorusGeometry(0.07, 0.004, 4, 12, Math.PI * 0.6);
      const llash = new THREE.Mesh(llG, lashM);
      llash.rotation.z = Math.PI * 0.2;
      llash.position.set(0, -0.02, 0.02);
      eg.add(llash);

      return { group: eg, iris: ir, pupil: pu, white: wh };
    };

    const le = makeEye(-0.18);
    const re = makeEye(0.18);
    hd.add(le.group);
    hd.add(re.group);

    // Eyebrows
    const makeBrow = (x: number, dir: number) => {
      const bg = new THREE.Group();
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const bx = x + (t - 0.5) * 0.12 * dir;
        const by = 0.19 + Math.sin(t * Math.PI) * 0.022 - t * 0.008;
        pts.push(new THREE.Vector3(bx, by, 0.48));
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.007 - i * 0.0005, 0.007 - (i + 1) * 0.0005, pts[i].distanceTo(pts[i + 1]), 4), browM);
        const mid = pts[i].clone().add(pts[i + 1]).multiplyScalar(0.5);
        seg.position.copy(mid);
        const d = pts[i + 1].clone().sub(pts[i]);
        seg.rotation.z = Math.atan2(d.y, d.x) - Math.PI / 2;
        bg.add(seg);
      }
      return bg;
    };
    const lbr = makeBrow(-0.18, -1);
    const rbr = makeBrow(0.18, 1);
    hd.add(lbr);
    hd.add(rbr);

    // Mouth
    const mG = new THREE.Group();
    mG.position.set(0, -0.21, 0.49);

    const ul = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.013, 8, 18, Math.PI * 0.85), lip);
    ul.rotation.z = Math.PI * 0.075;
    ul.position.y = 0.008;
    mG.add(ul);

    const ll = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.016, 8, 16, Math.PI * 0.75), lip);
    ll.position.y = -0.008;
    ll.rotation.z = Math.PI * 0.125;
    mG.add(ll);

    for (const sx of [-1, 1]) {
      const cr = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), lip);
      cr.position.set(sx * 0.06, 0.005, -0.005);
      mG.add(cr);
    }

    const ph = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.04, 6), skinSh);
    ph.position.set(0, 0.028, 0.005);
    mG.add(ph);

    hd.add(mG);

    // Ears
    for (const sx of [-1, 1]) {
      const ea = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), skinSh);
      ea.position.set(sx * 0.53, 0, -0.02);
      ea.scale.set(0.28, 0.8, 0.5);
      hd.add(ea);
    }

    // HAIR
    const hrG = new THREE.Group();

    const htop = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 24), hair);
    htop.scale.set(1.04, 0.65, 1.02);
    htop.position.set(0, 0.2, -0.02);
    hrG.add(htop);

    const frL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hair);
    frL.position.set(-0.35, 0.1, 0.2);
    frL.scale.set(0.55, 0.75, 0.5);
    hrG.add(frL);

    const frR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), hair);
    frR.position.set(0.32, 0.12, 0.18);
    frR.scale.set(0.5, 0.7, 0.45);
    hrG.add(frR);

    const wavesL: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const wv = new THREE.Mesh(
        new THREE.SphereGeometry(0.15 + Math.random() * 0.06, 12, 12),
        i % 2 === 0 ? hair : hairHL
      );
      wv.position.set(-0.5 - Math.sin(i * 0.5) * 0.08, -0.1 - i * 0.18, -0.05 + Math.sin(i * 0.7) * 0.08);
      wv.scale.set(0.6, 0.7, 0.55);
      hrG.add(wv);
      wavesL.push(wv);
    }

    const wavesR: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const wv = new THREE.Mesh(
        new THREE.SphereGeometry(0.14 + Math.random() * 0.05, 12, 12),
        i % 2 === 0 ? hair : hairHL
      );
      wv.position.set(0.48 + Math.sin(i * 0.6) * 0.07, -0.08 - i * 0.17, -0.04 + Math.sin(i * 0.8) * 0.07);
      wv.scale.set(0.55, 0.65, 0.5);
      hrG.add(wv);
      wavesR.push(wv);
    }

    const bkH = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), hair);
    bkH.position.set(0, -0.1, -0.25);
    bkH.scale.set(1.05, 1.15, 0.65);
    hrG.add(bkH);

    for (let i = 0; i < 5; i++) {
      const bf = new THREE.Mesh(new THREE.SphereGeometry(0.2 + Math.random() * 0.08, 10, 10), i % 2 ? hair : hairHL);
      bf.position.set((Math.random() - 0.5) * 0.4, -0.4 - i * 0.22, -0.2 - Math.random() * 0.1);
      bf.scale.set(0.7, 0.6, 0.5);
      hrG.add(bf);
    }

    const part = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), hair);
    part.position.set(-0.12, 0.35, 0.08);
    part.scale.set(0.8, 0.22, 0.7);
    hrG.add(part);

    for (let i = 0; i < 3; i++) {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.008, 0.3 + i * 0.05, 6), hairHL);
      strand.position.set(-0.4 + i * 0.04, -0.05 - i * 0.1, 0.3 - i * 0.02);
      strand.rotation.z = 0.3 - i * 0.1;
      strand.rotation.x = -0.2;
      hrG.add(strand);
    }

    hd.add(hrG);
    root.add(hd);

    // NECK
    const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.32, 16), skin);
    nk.position.y = 1.88;
    root.add(nk);

    const clb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), skin);
    clb.position.set(0, 1.72, 0.08);
    clb.scale.set(1.4, 0.25, 0.6);
    root.add(clb);

    // BODY
    const bd = new THREE.Group();

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.36, 1.1, 16), sweater);
    torso.position.y = 1.0;
    bd.add(torso);

    const vn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.18, 0.35, 3), skin);
    vn.position.set(0, 1.48, 0.28);
    vn.rotation.x = -0.15;
    bd.add(vn);

    for (const sx of [-1, 1]) {
      const ce = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), sweaterSh);
      ce.position.set(sx * 0.1, 1.45, 0.3);
      ce.rotation.z = sx * 0.25;
      ce.rotation.x = -0.2;
      bd.add(ce);
    }

    for (const sx of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), sweater);
      sh.position.set(sx * 0.44, 1.42, 0);
      sh.scale.set(1, 0.6, 0.75);
      bd.add(sh);
    }

    for (let i = 0; i < 8; i++) {
      const ln = new THREE.Mesh(new THREE.TorusGeometry(0.38 - i * 0.008, 0.005, 4, 24, Math.PI), sweaterSh);
      ln.position.set(0, 1.35 - i * 0.1, 0.08);
      ln.rotation.x = Math.PI / 2 + 0.1;
      bd.add(ln);
    }

    root.add(bd);

    // ARMS
    const makeArm = (sx: number) => {
      const ag = new THREE.Group();
      ag.position.set(sx * 0.52, 1.4, 0);

      const ua = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.5, 12), sweater);
      ua.position.y = -0.28;
      ag.add(ua);

      const elb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), sweater);
      elb.position.y = -0.54;
      ag.add(elb);

      const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.45, 12), sweater);
      fa.position.set(sx * -0.08, -0.78, 0.18);
      fa.rotation.x = -0.5;
      fa.rotation.z = sx * 0.3;
      ag.add(fa);

      const wr = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.08, 10), skin);
      wr.position.set(sx * -0.15, -0.98, 0.35);
      wr.rotation.x = -0.5;
      ag.add(wr);

      const ha = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skin);
      ha.position.set(sx * -0.18, -1.04, 0.4);
      ha.scale.set(0.85, 0.5, 1.0);
      ag.add(ha);

      for (let f = 0; f < 4; f++) {
        const fi = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.008, 0.05, 5), skin);
        fi.position.set(sx * -0.18 + (f - 1.5) * 0.013 * -sx, -1.08, 0.41);
        fi.rotation.x = 0.3;
        ag.add(fi);
      }

      return ag;
    };

    const la = makeArm(-1);
    const ra = makeArm(1);
    root.add(la);
    root.add(ra);

    root.position.y = -1.35;
    scene.add(root);

    return { root, hd, le, re, mG, ul, ll, lip, iris, lbr, rbr, la, ra, wavesL, wavesR };
  }, []);

  const init = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1410");
    scene.fog = new THREE.FogExp2(0x1a1410, 0.04);

    const cam = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);
    cam.position.set(0, 1.05, 5.0);
    cam.lookAt(0, 0.85, 0);

    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setSize(W, H);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.toneMapping = THREE.ACESFilmicToneMapping;
    ren.toneMappingExposure = 1.1;
    ren.shadowMap.enabled = true;
    el.appendChild(ren.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0x2a1e14, 0.7));
    const key = new THREE.DirectionalLight(0xffeac8, 1.4);
    key.position.set(2, 4, 4); key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8c0b0, 0.4);
    fill.position.set(-3, 2, 2);
    scene.add(fill);
    const lampLight = new THREE.PointLight(0xffa840, 1.5, 7);
    lampLight.position.set(-2.2, 1.2, -0.5);
    scene.add(lampLight);
    const warmR = new THREE.PointLight(0xffd898, 0.5, 5);
    warmR.position.set(2, 0.5, 2);
    scene.add(warmR);
    const rimC = new THREE.PointLight(0x90a8c0, 0.3, 5);
    rimC.position.set(0, 3, -2);
    scene.add(rimC);

    // Environment
    const wallM = new THREE.MeshStandardMaterial({ color: "#1e1812", roughness: 0.92 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), wallM);
    wall.position.z = -2.8;
    scene.add(wall);

    const shelfMat = new THREE.MeshStandardMaterial({ color: "#5a3a20", roughness: 0.75 });
    const bookColors = ["#8b4513", "#2f4f4f", "#8b1a1a", "#2e4a3e", "#4a3020", "#6a4e3a", "#2a3a5a", "#1a3a4a", "#5a2a2a", "#3a4a2a", "#4a2848", "#c89048"];

    for (let y = 0; y < 4; y++) {
      const pl = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.5), shelfMat);
      pl.position.set(1.2, -0.5 + y * 1.0, -2.2);
      scene.add(pl);
      if (y === 0) {
        const sp1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.8, 0.5), shelfMat);
        sp1.position.set(-0.3, 1.2, -2.2);
        scene.add(sp1);
        const sp2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.8, 0.5), shelfMat);
        sp2.position.set(2.7, 1.2, -2.2);
        scene.add(sp2);
      }
      let bx = -0.2;
      const bc = 8 + Math.floor(Math.random() * 5);
      for (let b = 0; b < bc; b++) {
        const bW = 0.05 + Math.random() * 0.07;
        const bH = 0.4 + Math.random() * 0.35;
        const bD = 0.3 + Math.random() * 0.1;
        const bk = new THREE.Mesh(
          new THREE.BoxGeometry(bW, bH, bD),
          new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)], roughness: 0.7 + Math.random() * 0.2 })
        );
        bk.position.set(bx + 1.2, bH / 2 - 0.45 + y * 1.0, -2.05);
        bk.rotation.z = (Math.random() - 0.5) * 0.04;
        if (Math.random() > 0.9) bk.rotation.z = 0.25;
        scene.add(bk);
        bx += bW + 0.01;
        if (bx > 1.8) break;
      }
    }

    // Lamp
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: "#8a6a48", roughness: 0.4, metalness: 0.5 }));
    lampBase.position.set(-2.0, -0.3, -1.0);
    scene.add(lampBase);
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: "#8a6a48", roughness: 0.3, metalness: 0.6 }));
    lampPole.position.set(-2.0, 0.05, -1.0);
    scene.add(lampPole);
    const shadeGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.25, 12, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({ color: "#f8e8c8", roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(-2.0, 0.45, -1.0);
    scene.add(shade);
    const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: "#ffc860", transparent: true, opacity: 0.6 }));
    glowSphere.position.set(-2.0, 0.38, -1.0);
    scene.add(glowSphere);

    // Curtain
    const curtainMat = new THREE.MeshStandardMaterial({ color: "#c8c0b0", roughness: 0.85, side: THREE.DoubleSide });
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4), curtainMat);
    curtain.position.set(3.2, 1.5, -2.0);
    curtain.rotation.y = -0.15;
    scene.add(curtain);

    // Plant
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: "#8a5a3a", roughness: 0.7 }));
    pot.position.set(2.3, -0.2, -1.2);
    scene.add(pot);
    const leafMat = new THREE.MeshStandardMaterial({ color: "#3a6a38", roughness: 0.6 });
    for (let i = 0; i < 6; i++) {
      const lf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), leafMat);
      const a = (i / 6) * Math.PI * 2;
      lf.position.set(2.3 + Math.cos(a) * 0.12, -0.02 + Math.random() * 0.15, -1.2 + Math.sin(a) * 0.1);
      lf.scale.set(1.2, 0.5, 0.8);
      scene.add(lf);
    }

    // Floor
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ color: "#14100a", roughness: 0.85 }));
    fl.rotation.x = -Math.PI / 2;
    fl.position.y = -2.7;
    scene.add(fl);

    // Dust
    const pN = 100;
    const pGeo = new THREE.BufferGeometry();
    const pp = new Float32Array(pN * 3);
    for (let i = 0; i < pN; i++) {
      pp[i * 3] = (Math.random() - 0.5) * 6;
      pp[i * 3 + 1] = Math.random() * 4;
      pp[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: "#ffe8c0", size: 0.01, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }));
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

      // Blink
      blinkT += 0.016;
      if (!blinking && blinkT > 3 + Math.random() * 2.5) { blinking = true; blinkP = 0; blinkT = 0; }
      if (blinking) { blinkP += 0.11; if (blinkP >= 1) { blinking = false; blinkP = 0; } }
      const bv = blinking ? Math.sin(blinkP * Math.PI) : 0;
      const es = 1 - bv * 0.88;
      p.le.white.scale.y = es * 0.78;
      p.re.white.scale.y = es * 0.78;
      p.le.iris.scale.y = es;
      p.re.iris.scale.y = es;
      p.le.pupil.scale.y = es;
      p.re.pupil.scale.y = es;

      p.iris.color.lerp(new THREE.Color(c.a), 0.015);
      p.iris.emissive.lerp(new THREE.Color(c.a), 0.015);

      // Head
      const hby = 2.4;
      if (s === S.IDLE) {
        p.hd.rotation.x = Math.sin(t * 0.35) * 0.018;
        p.hd.rotation.y = Math.sin(t * 0.22) * 0.03;
        p.hd.position.y = hby + Math.sin(t * 0.6) * 0.005;
      } else if (s === S.LISTEN) {
        p.hd.rotation.x = Math.sin(t * 0.9) * 0.055 - 0.035;
        p.hd.rotation.y = Math.sin(t * 0.25) * 0.02;
        p.hd.rotation.z = Math.sin(t * 0.45) * 0.04;
        p.hd.position.y = hby;
      } else if (s === S.THINK) {
        p.hd.rotation.x = -0.035;
        p.hd.rotation.y = Math.sin(t * 0.35) * 0.18 + 0.1;
        p.hd.rotation.z = 0.04;
        p.hd.position.y = hby + 0.008;
      } else {
        p.hd.rotation.x = Math.sin(t * 1.1) * 0.028 - 0.018;
        p.hd.rotation.y = Math.sin(t * 0.65) * 0.05;
        p.hd.rotation.z = Math.sin(t * 0.85) * 0.02;
        p.hd.position.y = hby + Math.sin(t * 1.5) * 0.004;
      }

      // Eyebrows
      const lbo = s === S.LISTEN ? 0.02 : s === S.THINK ? 0.025 : s === S.SPEAK ? Math.sin(t * 1.8) * 0.01 : 0;
      p.lbr.position.y = lbo;
      p.rbr.position.y = s === S.THINK ? -0.008 : lbo;

      // Mouth
      if (s === S.SPEAK) {
        p.ll.position.y = -0.008 - Math.abs(Math.sin(t * 7)) * 0.03;
        p.mG.scale.x = 1 + Math.sin(t * 4.5) * 0.07;
      } else if (s === S.LISTEN) {
        p.ll.position.y = -0.005;
        p.mG.scale.x = 1.05;
      } else {
        p.ll.position.y = -0.008;
        p.mG.scale.x = 1.02;
      }

      // Arms
      if (s === S.LISTEN) {
        p.la.rotation.z = 0.1 + Math.sin(t * 0.35) * 0.01;
        p.ra.rotation.z = -0.1 - Math.sin(t * 0.35) * 0.01;
        p.la.rotation.x = -0.04; p.ra.rotation.x = -0.04;
      } else if (s === S.THINK) {
        p.la.rotation.z = 0.08; p.la.rotation.x = -0.1;
        p.ra.rotation.z = -0.3; p.ra.rotation.x = -0.42;
      } else if (s === S.SPEAK) {
        p.la.rotation.z = 0.12 + Math.sin(t * 1.1) * 0.09;
        p.la.rotation.x = -0.1 + Math.sin(t * 0.9) * 0.06;
        p.ra.rotation.z = -0.12 - Math.sin(t * 1.1 + 0.7) * 0.09;
        p.ra.rotation.x = -0.1 + Math.sin(t * 0.9 + 0.7) * 0.06;
      } else {
        p.la.rotation.z = 0.05; p.ra.rotation.z = -0.05;
        p.la.rotation.x = 0; p.ra.rotation.x = 0;
      }

      // Hair sway
      p.wavesL.forEach((w, i) => {
        w.position.x += Math.sin(t * 0.3 + i * 0.8) * 0.0002;
        w.position.z += Math.cos(t * 0.25 + i * 0.6) * 0.0001;
      });
      p.wavesR.forEach((w, i) => {
        w.position.x += Math.sin(t * 0.28 + i * 0.9) * 0.0002;
        w.position.z += Math.cos(t * 0.22 + i * 0.7) * 0.0001;
      });

      // Breathe
      p.root.position.y = -1.35 + Math.sin(t * 0.9) * 0.005;

      // Dust
      const dp = pts.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pN; i++) {
        dp[i * 3 + 1] += Math.sin(t * 0.15 + i) * 0.0003;
        dp[i * 3] += Math.cos(t * 0.1 + i * 0.6) * 0.0002;
      }
      pts.geometry.attributes.position.needsUpdate = true;

      // Lamp flicker
      lampLight.intensity = 1.5 + Math.sin(t * 3.2) * 0.06 + Math.sin(t * 7.5) * 0.03;

      // Camera
      cam.position.x = Math.sin(t * 0.07) * 0.08;
      cam.position.y = 1.05 + Math.sin(t * 0.05) * 0.04;
      cam.lookAt(0, 0.85, 0);

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
    <div className={className} style={{ position: "relative", overflow: "hidden", background: "#1a1410" }}>
      <div ref={box} style={{ position: "absolute", inset: 0, cursor: externalState ? "default" : "pointer" }} onClick={cycle} />

      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${c.g}0a 0%, transparent 70%)`, pointerEvents: "none", transition: "background 3s" }} />

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
