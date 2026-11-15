'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  RotateCw,
  Ruler,
  Sparkles,
  Sun,
} from 'lucide-react';

interface AngleCaptureGuideProps {
  locale: 'ckb' | 'ar' | 'en';
  targetAngles: 8 | 12 | 16 | 24;
  capturedCount: number;
  view360Type: 'auto' | 'chair' | 'table' | 'lamp' | 'vase';
  category: string;
  finishColor?: string;
  onGenerateDemoFrames?: (frames: string[]) => void;
}

function resolveGuideShape(
  view360Type: 'auto' | 'chair' | 'table' | 'lamp' | 'vase',
  category: string
): 'chair' | 'table' | 'lamp' | 'vase' {
  if (view360Type !== 'auto') return view360Type;
  const cat = category.toLowerCase();
  if (cat.includes('table') || cat.includes('desk')) return 'table';
  if (cat.includes('lamp') || cat.includes('light')) return 'lamp';
  if (cat.includes('vase') || cat.includes('ceramic') || cat.includes('bowl')) return 'vase';
  return 'chair';
}

function buildReferenceFurniture(
  shape: 'chair' | 'table' | 'lamp' | 'vase',
  finishHex: string
): { group: THREE.Group; disposables: Array<{ dispose: () => void }> } {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const primaryMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(finishHex || '#d8c4a4'),
    roughness: shape === 'chair' ? 0.78 : shape === 'lamp' ? 0.35 : 0.58,
    metalness: shape === 'lamp' ? 0.55 : 0.05,
    clearcoat: shape === 'table' ? 0.25 : 0,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#342920'),
    roughness: 0.65,
    metalness: 0.05,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c89d54'),
    roughness: 0.32,
    metalness: 0.8,
  });
  disposables.push(primaryMat, darkWoodMat, brassMat);

  const addMesh = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    rot?: [number, number, number]
  ) => {
    disposables.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  if (shape === 'chair') {
    // Seat cushion
    addMesh(new THREE.BoxGeometry(1.45, 0.34, 1.38), primaryMat, [0, 0.82, 0.05]);
    // Open curved backrest clearly distinguishing Front vs Back!
    const backGeo = new THREE.CylinderGeometry(
      0.84,
      0.84,
      0.78,
      28,
      1,
      true,
      -Math.PI * 0.65,
      Math.PI * 1.3
    );
    const backMat = primaryMat.clone();
    backMat.side = THREE.DoubleSide;
    disposables.push(backMat);
    addMesh(backGeo, backMat, [0, 1.32, -0.14]);
    addMesh(new THREE.TorusGeometry(0.82, 0.11, 14, 28, Math.PI * 1.28), primaryMat, [0, 1.7, -0.14], [
      Math.PI / 2,
      0,
      Math.PI * 0.36,
    ]);
    // Subframe
    addMesh(new THREE.BoxGeometry(1.3, 0.1, 1.25), darkWoodMat, [0, 0.6, 0.04]);
    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.045, 0.03, 0.58, 12);
    disposables.push(legGeo);
    const legs: Array<[number, number, number, number, number]> = [
      [-0.55, 0.29, 0.52, 0.08, 0.08],
      [0.55, 0.29, 0.52, 0.08, -0.08],
      [-0.55, 0.29, -0.48, -0.08, 0.08],
      [0.55, 0.29, -0.48, -0.08, -0.08],
    ];
    legs.forEach(([x, y, z, rx, rz]) => {
      const l = new THREE.Mesh(legGeo, darkWoodMat);
      l.position.set(x, y, z);
      l.rotation.set(rx, 0, rz);
      group.add(l);
    });
  } else if (shape === 'table') {
    addMesh(new THREE.BoxGeometry(2.1, 0.1, 1.25), primaryMat, [0, 1.22, 0]);
    addMesh(new THREE.BoxGeometry(1.9, 0.06, 1.05), darkWoodMat, [0, 1.14, 0]);
    const legGeo = new THREE.CylinderGeometry(0.055, 0.038, 1.12, 16);
    disposables.push(legGeo);
    [
      [-0.85, 0.56, 0.45],
      [0.85, 0.56, 0.45],
      [-0.85, 0.56, -0.45],
      [0.85, 0.56, -0.45],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, darkWoodMat);
      leg.position.set(x, y, z);
      group.add(leg);
    });
  } else if (shape === 'lamp') {
    const shadeMat = primaryMat.clone();
    shadeMat.side = THREE.DoubleSide;
    disposables.push(shadeMat);
    addMesh(new THREE.CylinderGeometry(0.42, 0.72, 0.62, 32, 1, true), shadeMat, [0, 1.56, 0]);
    addMesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 20), brassMat, [0, 0.72, 0]);
    addMesh(new THREE.CylinderGeometry(0.38, 0.42, 0.07, 32), brassMat, [0, 0.035, 0]);
  } else {
    const pts = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.45, 0.02),
      new THREE.Vector2(0.65, 0.38),
      new THREE.Vector2(0.54, 0.78),
      new THREE.Vector2(0.24, 1.15),
      new THREE.Vector2(0.28, 1.38),
      new THREE.Vector2(0.18, 1.38),
      new THREE.Vector2(0.16, 1.08),
      new THREE.Vector2(0.35, 0.34),
      new THREE.Vector2(0, 0.04),
    ];
    addMesh(new THREE.LatheGeometry(pts, 40), primaryMat, [0, 0, 0]);
  }

  // Subtle floor turntable ring beneath piece so user clearly sees rotation alignment
  const ringGeo = new THREE.RingGeometry(1.22, 1.26, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#8f7e65',
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  disposables.push(ringGeo, ringMat);
  addMesh(ringGeo, ringMat, [0, 0.01, 0], [-Math.PI / 2, 0, 0]);

  return { group, disposables };
}

function getAngleLabel(deg: number, locale: 'ckb' | 'ar' | 'en'): string {
  const norm = ((deg % 360) + 360) % 360;
  if (norm === 0) {
    return locale === 'ckb' ? 'پێشەوە (Front)' : locale === 'ar' ? 'أمامي (0°)' : 'Straight Front';
  }
  if (norm > 0 && norm < 75) {
    return locale === 'ckb'
      ? 'گۆشەی پێش-ڕاست'
      : locale === 'ar'
      ? 'زاوية أمامية يمين'
      : 'Front-Right 3/4';
  }
  if (norm >= 75 && norm <= 105) {
    return locale === 'ckb' ? 'تەنیشتی ڕاست' : locale === 'ar' ? 'الجانب الأيمن' : 'Right Side Profile';
  }
  if (norm > 105 && norm < 165) {
    return locale === 'ckb'
      ? 'گۆشەی پشت-ڕاست'
      : locale === 'ar'
      ? 'زاوية خلفية يمين'
      : 'Back-Right 3/4';
  }
  if (norm >= 165 && norm <= 195) {
    return locale === 'ckb' ? 'پشتەوە' : locale === 'ar' ? 'من الخلف' : 'Straight Back';
  }
  if (norm > 195 && norm < 255) {
    return locale === 'ckb'
      ? 'گۆشەی پشت-چەپ'
      : locale === 'ar'
      ? 'زاوية خلفية يسار'
      : 'Back-Left 3/4';
  }
  if (norm >= 255 && norm <= 285) {
    return locale === 'ckb' ? 'تەنیشتی چەپ' : locale === 'ar' ? 'الجانب الأيسر' : 'Left Side Profile';
  }
  return locale === 'ckb'
    ? 'گۆشەی پێش-چەپ'
    : locale === 'ar'
    ? 'زاوية أمامية يسار'
    : 'Front-Left 3/4';
}

export function AngleCaptureGuide({
  locale,
  targetAngles,
  capturedCount,
  view360Type,
  category,
  finishColor = '#d8c4a4',
  onGenerateDemoFrames,
}: AngleCaptureGuideProps) {
  const [expanded, setExpanded] = useState(true);
  // Track optional manual inspection click; null means automatically follow the NEXT capture angle
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const targetAzimuthRef = useRef(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const shape = useMemo(
    () => resolveGuideShape(view360Type, category),
    [view360Type, category]
  );

  const nextStepIndex = capturedCount % targetAngles;
  const activeIndex = inspectedIndex !== null ? inspectedIndex % targetAngles : nextStepIndex;
  const activeDeg = Math.round((activeIndex / targetAngles) * 360);
  const stepDeg = Math.round(360 / targetAngles);

  // Sync smooth target azimuth whenever activeIndex changes
  useEffect(() => {
    targetAzimuthRef.current = (activeIndex / targetAngles) * Math.PI * 2;
  }, [activeIndex, targetAngles]);

  // Mount single Three.js reference preview canvas
  useEffect(() => {
    if (!expanded) return;
    const container = canvasHostRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    cameraRef.current = camera;

    const keyLight = new THREE.DirectionalLight('#fff8f0', 2.0);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const hemi = new THREE.HemisphereLight('#f8f5ef', '#e5dccb', 0.9);
    scene.add(hemi);

    const { group, disposables } = buildReferenceFurniture(shape, finishColor);
    scene.add(group);

    let currentAzimuth = targetAzimuthRef.current;
    const radius = 3.85;
    const elevationHeight = 2.05; // ~20°–22° ideal furniture photography tilt angle
    const lookTarget = new THREE.Vector3(0, 0.85, 0);

    let rafId: number;
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);

      // Shortest angular interpolation
      let diff = targetAzimuthRef.current - currentAzimuth;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      currentAzimuth += diff * 0.14;

      camera.position.set(
        Math.sin(currentAzimuth) * radius,
        elevationHeight,
        Math.cos(currentAzimuth) * radius
      );
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(renderLoop);

    const resizeObs = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObs.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      disposables.forEach((d) => d.dispose());
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [expanded, shape, finishColor]);

  // Snapshot N angles cleanly from the Three.js reference model so user can test full Photo 360 immediately
  const handleSnapshotSampleSet = () => {
    if (!onGenerateDemoFrames || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }
    setGeneratingDemo(true);
    try {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;

      const prevPos = camera.position.clone();
      const radius = 3.85;
      const elevationHeight = 2.05;
      const lookTarget = new THREE.Vector3(0, 0.85, 0);

      const captured: string[] = [];
      for (let i = 0; i < targetAngles; i++) {
        const az = (i / targetAngles) * Math.PI * 2;
        camera.position.set(Math.sin(az) * radius, elevationHeight, Math.cos(az) * radius);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
        captured.push(renderer.domElement.toDataURL('image/webp', 0.72));
      }

      camera.position.copy(prevPos);
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
      onGenerateDemoFrames(captured);
    } finally {
      setGeneratingDemo(false);
    }
  };

  const angleSpots = useMemo(() => {
    return Array.from({ length: targetAngles }, (_, i) => {
      const deg = Math.round((i / targetAngles) * 360);
      // Put 0° at the bottom (6 o'clock, standing in front of furniture) and go clockwise
      const rad = ((deg + 90) * Math.PI) / 180;
      const radiusPct = 39;
      const x = 50 + Math.cos(rad) * radiusPct;
      const y = 50 + Math.sin(rad) * radiusPct;
      return {
        index: i,
        deg,
        x,
        y,
        isCaptured: i < capturedCount,
        isNext: i === nextStepIndex && capturedCount < targetAngles,
      };
    });
  }, [targetAngles, capturedCount, nextStepIndex]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-canvas/85">
      {/* Header Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/80 bg-card/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-accent" />
          <span className="text-[12.5px] font-semibold text-ink">
            {locale === 'ckb'
              ? 'نموونەی زیندووی گۆشەکانی وێنەگرتن (Visual Angle Guide)'
              : locale === 'ar'
              ? 'دليل زوايا التصوير التفاعلي (أمثلة حية)'
              : 'Interactive 360° Shooting Angle Guide & Visual Examples'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-canvas px-3 py-1 text-[11px] font-medium text-ink ring-1 ring-line hover:bg-sand"
        >
          <Eye className="size-3" />
          <span>
            {expanded
              ? locale === 'ckb'
                ? 'شاردنەوەی نموونە'
                : 'Hide Guide'
              : locale === 'ckb'
              ? 'پیشاندانی نموونەی گۆشەکان'
              : 'Show Angle Examples'}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left: Overhead Camera Orbit Map (Where to stand around the piece) */}
            <div className="flex flex-col justify-between rounded-xl border border-line bg-card p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
                  {locale === 'ckb'
                    ? '١. نەخشەی سەرەوە · شوێنی وەستانی کامێرا'
                    : locale === 'ar'
                    ? '1. خريطة الوقوف حول القطعة'
                    : '1. Overhead Camera Orbit Ring'}
                </span>
                <span dir="ltr" className="font-mono text-[10.5px] font-semibold text-accent">
                  +{stepDeg}° / shot
                </span>
              </div>

              {/* Circular Orbit Ring */}
              <div className="relative mx-auto my-3 aspect-square w-full max-w-[235px]">
                {/* Distance Track Ring */}
                <div className="absolute inset-[11%] rounded-full border-2 border-dashed border-ink/20" />

                {/* Clockwise Direction Hint */}
                <div className="pointer-events-none absolute inset-[23%] rounded-full border border-line/60" />

                {/* Center Furniture Box */}
                <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-ink/25 bg-sand/70 text-center shadow-xs">
                  <RotateCw className="size-4 text-ink/70" />
                  <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase text-ink">
                    {shape}
                  </span>
                </div>

                {/* Angle Station Dots */}
                {angleSpots.map((spot) => {
                  const isActive = spot.index === activeIndex;
                  return (
                    <button
                      key={spot.index}
                      type="button"
                      onClick={() => setInspectedIndex(spot.index)}
                      title={`#${spot.index + 1} · ${spot.deg}°`}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-all ${
                        isActive
                          ? 'z-20 scale-115 bg-ink text-canvas ring-4 ring-accent/40 shadow-sm'
                          : spot.isCaptured
                          ? 'z-10 bg-ok text-white'
                          : spot.isNext
                          ? 'z-10 bg-accent text-ink ring-2 ring-ink/30'
                          : 'bg-canvas text-ink-soft ring-1 ring-line hover:bg-sand hover:text-ink'
                      }`}
                    >
                      {spot.isCaptured && !isActive ? (
                        <Check className="size-3.5" />
                      ) : (
                        spot.index + 1
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Orbit Shortcuts */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {[
                  { label: locale === 'ckb' ? 'پێشەوە 0°' : 'Front 0°', ratio: 0 },
                  { label: locale === 'ckb' ? 'تەنیشت 90°' : 'Side 90°', ratio: 0.25 },
                  { label: locale === 'ckb' ? 'پشتەوە 180°' : 'Back 180°', ratio: 0.5 },
                  { label: locale === 'ckb' ? 'چەپ 270°' : 'Left 270°', ratio: 0.75 },
                ].map((preset) => {
                  const targetIdx = Math.round(preset.ratio * targetAngles) % targetAngles;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setInspectedIndex(targetIdx)}
                      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium transition-colors ${
                        activeIndex === targetIdx
                          ? 'bg-ink text-canvas'
                          : 'bg-canvas text-ink-soft ring-1 ring-line hover:text-ink'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                {inspectedIndex !== null && (
                  <button
                    type="button"
                    onClick={() => setInspectedIndex(null)}
                    className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10.5px] font-medium text-ink hover:bg-accent/35"
                  >
                    {locale === 'ckb' ? 'گۆشەی داهاتوو' : 'Follow Next'}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Live Camera Lens Framing Example at that exact Angle */}
            <div className="flex flex-col justify-between rounded-xl border border-line bg-card p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
                  {locale === 'ckb'
                    ? '٢. دیمەنی ناو شاشەی کامێراکەت'
                    : locale === 'ar'
                    ? '2. شكل الصورة من هذه الزاوية'
                    : '2. Camera Lens Example'}
                </span>
                <span dir="ltr" className="font-mono text-[11px] font-semibold text-ink">
                  #{activeIndex + 1}/{targetAngles} · {activeDeg}°
                </span>
              </div>

              {/* 3D Angle Example Viewport */}
              <div className="relative my-2.5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone/60">
                <div ref={canvasHostRef} className="size-full" />

                {/* Safe Camera Framing Guides Overlay */}
                <div className="pointer-events-none absolute inset-[12%] rounded-lg border border-dashed border-ink/25" />

                {/* Camera Angle Badge Overlay */}
                <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-[10.5px] font-semibold text-ink shadow-xs backdrop-blur">
                    {getAngleLabel(activeDeg, locale)}
                  </span>
                  <span
                    dir="ltr"
                    className="rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] text-canvas backdrop-blur"
                  >
                    Tilt ~20° ↓
                  </span>
                </div>

                {/* Stepper Controls */}
                <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setInspectedIndex(
                        (activeIndex - 1 + targetAngles) % targetAngles
                      )
                    }
                    className="grid size-7 place-items-center rounded-full bg-card/90 text-ink shadow-xs backdrop-blur hover:bg-ink hover:text-canvas"
                    title="Previous angle example"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <span className="rounded-full bg-card/90 px-2.5 py-0.5 font-mono text-[10px] text-ink-soft backdrop-blur">
                    {locale === 'ckb'
                      ? 'بۆشایی ١٥٪ لە چوارچێوەدا بەجێبهێڵە'
                      : 'Keep ~15% margin inside dashed box'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setInspectedIndex((activeIndex + 1) % targetAngles)
                    }
                    className="grid size-7 place-items-center rounded-full bg-card/90 text-ink shadow-xs backdrop-blur hover:bg-ink hover:text-canvas"
                    title="Next angle example"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Optional 1-click Demo Sequence Generator */}
              {onGenerateDemoFrames && (
                <button
                  type="button"
                  onClick={handleSnapshotSampleSet}
                  disabled={generatingDemo}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sand/75 px-3 py-2 text-[11.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-canvas disabled:opacity-50"
                >
                  <Sparkles className="size-3.5 text-accent" />
                  <span>
                    {generatingDemo
                      ? '...'
                      : locale === 'ckb'
                      ? `تاقیکردنەوە بە دروستکردنی ${targetAngles} وێنەی نموونەیی ئێستا`
                      : locale === 'ar'
                      ? `توليد ${targetAngles} صور تجريبية لاختبار الدوران فوراً`
                      : `Auto-Generate ${targetAngles}-Angle Sample Set to Test 360° Now`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Golden Rules for Shooting Crisp 360° Angles */}
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-start gap-2 rounded-xl bg-card p-2.5 ring-1 ring-line/70">
              <Ruler className="mt-0.5 size-3.5 shrink-0 text-accent" />
              <div className="text-[11px] leading-snug">
                <p className="font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'بەرزی و دووری یەکسان'
                    : locale === 'ar'
                    ? 'ارتفاع ومسافة ثابتة'
                    : 'Fixed Height & Distance'}
                </p>
                <p className="mt-0.5 text-ink-soft">
                  {locale === 'ckb'
                    ? 'کامێراکە لە ئاستی سنگ (~115 سم) ڕابگرە و کەمێک (20°) بەرەو خوارەوە بینوێنە، بە هەمان دووری 1.8 مەتر لە دەوری پارچەکە.'
                    : locale === 'ar'
                    ? 'امسك الهاتف على مستوى الصدر (~115 سم) مع إمالة بسيطة للأسفل (20°) وبنفس البعد حول القطعة.'
                    : 'Hold camera at chest level (~115 cm), tilted ~20° down, keeping ~1.8m distance around all sides.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-card p-2.5 ring-1 ring-line/70">
              <Camera className="mt-0.5 size-3.5 shrink-0 text-accent" />
              <div className="text-[11px] leading-snug">
                <p className="font-semibold text-ink">
                  {locale === 'ckb'
                    ? `هەنگاوی ${stepDeg}° بە ئاراستەی کاتژمێر`
                    : locale === 'ar'
                    ? `خطوات متساوية كل ${stepDeg}°`
                    : `Even ${stepDeg}° Clockwise Steps`}
                </p>
                <p className="mt-0.5 text-ink-soft">
                  {locale === 'ckb'
                    ? `بۆ ${targetAngles} وێنە، هەر ${stepDeg} پلە جارێک بوەستە و وێنە بگرە. لە ناوەڕاستدا پارچەکە لە ناو بازنەکەدا بهێڵەرەوە.`
                    : locale === 'ar'
                    ? `لـ ${targetAngles} صورة، التقط لقطة كل ${stepDeg}° بنفس الاتجاه مع إبقاء القطعة في منتصف الإطار.`
                    : `For ${targetAngles} shots, step ${stepDeg}° per photo in one circle. Use the Ghost Overlay to match scale.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-card p-2.5 ring-1 ring-line/70">
              <Sun className="mt-0.5 size-3.5 shrink-0 text-accent" />
              <div className="text-[11px] leading-snug">
                <p className="font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'ڕووناکی یەکسان و پاشبنەمای سادە'
                    : locale === 'ar'
                    ? 'إضاءة ناعمة وخلفية هادئة'
                    : 'Soft Even Lighting'}
                </p>
                <p className="mt-0.5 text-ink-soft">
                  {locale === 'ckb'
                    ? 'پشت بە دیوارێکی سادە ببەستە و دووربکەوە لە سێبەری خۆت لەسەر مۆبیلیاتەکە کاتی گەڕان بە دەوریدا.'
                    : locale === 'ar'
                    ? 'صوّر أمام خلفية بسيطة وتجنب سقوط ظلك على الأثاث أثناء الدوران.'
                    : 'Shoot against a neutral wall/floor and keep lighting soft so colors stay identical across angles.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
