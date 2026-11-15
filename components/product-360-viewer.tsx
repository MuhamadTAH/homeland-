'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  ZoomIn,
  ZoomOut,
  ArrowLeftRight,
  Camera,
  Box,
} from 'lucide-react';
import { Product } from '@/lib/catalog';
import { useShowroom } from '@/components/providers';

interface Product360ViewerProps {
  product: Product;
  activeFinishColor?: string;
  activeFinishName?: string;
  tintBg?: string;
}

// Procedural wood / surface micro-texture generator (Zero 404 / zero external files)
function createProceduralTexture(
  type: 'wood' | 'fabric' | 'stone' | 'metal',
  baseHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const baseCol = new THREE.Color(baseHex);
  ctx.fillStyle = `rgb(${Math.round(baseCol.r * 255)}, ${Math.round(baseCol.g * 255)}, ${Math.round(baseCol.b * 255)})`;
  ctx.fillRect(0, 0, 512, 512);

  if (type === 'wood') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const y = Math.random() * 512;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        170,
        y + (Math.random() - 0.5) * 40,
        340,
        y + (Math.random() - 0.5) * 40,
        512,
        y
      );
      ctx.stroke();
    }
  } else if (type === 'fabric') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < 512; x += 4) {
      ctx.fillRect(x, 0, 2, 512);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 512, 2);
    }
  } else if (type === 'stone') {
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 2 + 1;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// Procedural contact shadow texture
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    gradient.addColorStop(0, 'rgba(25, 24, 22, 0.45)');
    gradient.addColorStop(0.35, 'rgba(25, 24, 22, 0.22)');
    gradient.addColorStop(0.7, 'rgba(25, 24, 22, 0.08)');
    gradient.addColorStop(1, 'rgba(25, 24, 22, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural 3–12 part architectural models tuned to piece categories
function buildProceduralFurnitureModel(
  product: Product,
  finishColorHex: string
): {
  group: THREE.Group;
  materials: THREE.Material[];
} {
  const group = new THREE.Group();
  const materials: THREE.Material[] = [];

  const catLower = product.category.toLowerCase();
  const nameLower = product.name.toLowerCase();
  const idLower = product.id.toLowerCase();
  const explicitType =
    product.view360Type && product.view360Type !== 'auto' ? product.view360Type : null;

  const isChairOrSofa =
    explicitType === 'chair' ||
    (!explicitType &&
      (catLower === 'seating' ||
        catLower.includes('sofa') ||
        catLower.includes('chair') ||
        idLower.includes('chair') ||
        idLower.includes('sofa') ||
        idLower.includes('stool') ||
        nameLower.includes('chair') ||
        nameLower.includes('lounge') ||
        nameLower.includes('sofa')));

  const isTable =
    explicitType === 'table' ||
    (!explicitType &&
      (catLower === 'tables' ||
        catLower.includes('table') ||
        idLower.includes('table') ||
        nameLower.includes('table') ||
        nameLower.includes('desk')));

  const isLamp =
    explicitType === 'lamp' ||
    (!explicitType &&
      (catLower === 'lighting' ||
        catLower.includes('lamp') ||
        catLower.includes('light') ||
        idLower.includes('lamp') ||
        idLower.includes('pendant') ||
        nameLower.includes('lamp') ||
        nameLower.includes('light')));

  const texType = isChairOrSofa ? 'fabric' : isTable ? 'wood' : isLamp ? 'metal' : 'stone';
  const texture = createProceduralTexture(texType, finishColorHex);

  const primaryMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(finishColorHex),
    roughness: isChairOrSofa ? 0.8 : isTable ? 0.6 : isLamp ? 0.25 : 0.7,
    metalness: isLamp ? 0.7 : 0.05,
    clearcoat: isTable ? 0.2 : 0,
    clearcoatRoughness: 0.3,
    map: texture,
  });
  materials.push(primaryMat);

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(isChairOrSofa ? '#2b231d' : '#3d3227'),
    roughness: 0.65,
    metalness: 0.05,
  });
  materials.push(darkWoodMat);

  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d4af37'),
    roughness: 0.3,
    metalness: 0.85,
  });
  materials.push(brassMat);

  if (isChairOrSofa) {
    const seatGeo = new THREE.BoxGeometry(1.6, 0.38, 1.5, 12, 6, 12);
    const pos = seatGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = pos.getY(i);
      if (y > 0) {
        pos.setY(i, y - 0.03 * (x * x + z * z));
      }
    }
    seatGeo.computeVertexNormals();
    const seat = new THREE.Mesh(seatGeo, primaryMat);
    seat.position.y = 0.85;
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    const backGeo = new THREE.CylinderGeometry(
      0.9,
      0.9,
      0.8,
      32,
      8,
      true,
      -Math.PI * 0.7,
      Math.PI * 1.4
    );
    const backMat = primaryMat.clone();
    backMat.side = THREE.DoubleSide;
    materials.push(backMat);
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(0, 1.35, -0.15);
    back.castShadow = true;
    group.add(back);

    const rimGeo = new THREE.TorusGeometry(0.88, 0.12, 16, 32, Math.PI * 1.35);
    const rim = new THREE.Mesh(rimGeo, primaryMat);
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = Math.PI * 0.32;
    rim.position.set(0, 1.74, -0.15);
    rim.castShadow = true;
    group.add(rim);

    const baseGeo = new THREE.BoxGeometry(1.45, 0.12, 1.35);
    const base = new THREE.Mesh(baseGeo, darkWoodMat);
    base.position.y = 0.62;
    base.castShadow = true;
    group.add(base);

    const legGeo = new THREE.CylinderGeometry(0.045, 0.03, 0.6, 16);
    const legPositions = [
      [-0.62, 0.3, 0.55, 0.08, 0.08],
      [0.62, 0.3, 0.55, 0.08, -0.08],
      [-0.62, 0.3, -0.55, -0.08, 0.08],
      [0.62, 0.3, -0.55, -0.08, -0.08],
    ];
    legPositions.forEach(([x, y, z, rx, rz]) => {
      const leg = new THREE.Mesh(legGeo, darkWoodMat);
      leg.position.set(x, y, z);
      leg.rotation.x = rx;
      leg.rotation.z = rz;
      leg.castShadow = true;
      group.add(leg);

      const capGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.06, 16);
      const cap = new THREE.Mesh(capGeo, brassMat);
      cap.position.set(x * 1.05, 0.03, z * 1.05);
      group.add(cap);
    });
  } else if (isTable) {
    const topGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.09, 48);
    const top = new THREE.Mesh(topGeo, primaryMat);
    top.position.y = 1.25;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const subTopGeo = new THREE.CylinderGeometry(1.08, 1.18, 0.04, 48);
    const subTop = new THREE.Mesh(subTopGeo, darkWoodMat);
    subTop.position.y = 1.19;
    group.add(subTop);

    const colGeo = new THREE.CylinderGeometry(0.24, 0.32, 1.15, 32);
    const col = new THREE.Mesh(colGeo, darkWoodMat);
    col.position.y = 0.6;
    col.castShadow = true;
    group.add(col);

    const baseGeo = new THREE.CylinderGeometry(0.72, 0.76, 0.08, 48);
    const base = new THREE.Mesh(baseGeo, darkWoodMat);
    base.position.y = 0.04;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const ringGeo = new THREE.TorusGeometry(0.26, 0.015, 12, 32);
    const ring = new THREE.Mesh(ringGeo, brassMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.16;
    group.add(ring);
  } else if (isLamp) {
    const shadeGeo = new THREE.CylinderGeometry(0.45, 0.75, 0.65, 36, 1, true);
    const shadeMat = primaryMat.clone();
    shadeMat.side = THREE.DoubleSide;
    materials.push(shadeMat);
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.y = 1.6;
    shade.castShadow = true;
    group.add(shade);

    const diffGeo = new THREE.CircleGeometry(0.72, 32);
    const diffMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fff9ea'),
      emissive: new THREE.Color('#ffe8b0'),
      emissiveIntensity: 0.8,
      roughness: 0.9,
    });
    materials.push(diffMat);
    const diff = new THREE.Mesh(diffGeo, diffMat);
    diff.rotation.x = Math.PI / 2;
    diff.position.y = 1.32;
    group.add(diff);

    const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.45, 24);
    const stem = new THREE.Mesh(stemGeo, brassMat);
    stem.position.y = 0.75;
    stem.castShadow = true;
    group.add(stem);

    const baseGeo = new THREE.CylinderGeometry(0.4, 0.42, 0.06, 36);
    const base = new THREE.Mesh(baseGeo, brassMat);
    base.position.y = 0.03;
    base.castShadow = true;
    group.add(base);

    const lampLight = new THREE.PointLight('#ffecd1', 1.6, 4);
    lampLight.position.set(0, 1.45, 0);
    group.add(lampLight);
  } else {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0.02, 0.0));
    points.push(new THREE.Vector2(0.45, 0.02));
    points.push(new THREE.Vector2(0.68, 0.35));
    points.push(new THREE.Vector2(0.58, 0.75));
    points.push(new THREE.Vector2(0.24, 1.15));
    points.push(new THREE.Vector2(0.28, 1.4));
    points.push(new THREE.Vector2(0.25, 1.45));
    points.push(new THREE.Vector2(0.18, 1.4));
    points.push(new THREE.Vector2(0.16, 1.1));
    points.push(new THREE.Vector2(0.38, 0.3));
    points.push(new THREE.Vector2(0.0, 0.05));

    const latheGeo = new THREE.LatheGeometry(points, 48);
    latheGeo.computeVertexNormals();
    const vase = new THREE.Mesh(latheGeo, primaryMat);
    vase.castShadow = true;
    vase.receiveShadow = true;
    group.add(vase);
  }

  const shadowTex = createContactShadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  materials.push(shadowMat);
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.005;
  group.add(shadowPlane);

  return { group, materials };
}

/**
 * Interactive Multi-Angle Photo 360 Turntable
 * Assembles captured/uploaded multi-angle photos into a continuous horizontal drag,
 * momentum-inertia, scrubbable, zoomable, auto-spinning 360 degree viewer.
 */
function Photo360Turntable({
  frames,
  productName,
  activeFinishColor,
  activeFinishName,
  onSwitchTo3D,
}: {
  frames: string[];
  productName: string;
  activeFinishColor?: string;
  activeFinishName?: string;
  onSwitchTo3D: () => void;
}) {
  const { t } = useShowroom();
  const totalFrames = frames.length;

  const [frameIndex, setFrameIndex] = useState(0);
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [reverseSpin, setReverseSpin] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    lastX: number;
    accumulatedPx: number;
    velocity: number;
    lastTime: number;
  }>({
    active: false,
    startX: 0,
    lastX: 0,
    accumulatedPx: 0,
    velocity: 0,
    lastTime: 0,
  });

  // Normalize index smoothly into [0, totalFrames - 1]
  const safeIndex = ((frameIndex % totalFrames) + totalFrames) % totalFrames;
  const currentSrc = frames[safeIndex] ?? frames[0];
  const currentDegrees = Math.round((safeIndex / totalFrames) * 360);

  // Preload all frames so dragging has zero flicker
  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  // Step frame helper
  const stepFrames = useCallback(
    (delta: number) => {
      setFrameIndex((prev) => {
        const next = (prev + delta) % totalFrames;
        return next < 0 ? next + totalFrames : next;
      });
    },
    [totalFrames]
  );

  // Auto-spin timer proportional to frame count (~1 full rotation every 6.5s)
  useEffect(() => {
    if (!isAutoSpin || totalFrames < 2) return;
    const intervalMs = Math.max(95, Math.min(480, Math.round(6500 / totalFrames)));
    const timer = window.setInterval(() => {
      if (!dragRef.current.active) {
        stepFrames(reverseSpin ? -1 : 1);
      }
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isAutoSpin, reverseSpin, totalFrames, stepFrames]);

  // Momentum inertia after drag release
  useEffect(() => {
    let rafId: number;
    const runMomentum = () => {
      const d = dragRef.current;
      if (!d.active && Math.abs(d.velocity) > 0.15) {
        d.accumulatedPx += d.velocity * 12;
        d.velocity *= 0.9;
        const pxPerFrame = Math.max(12, Math.round(280 / totalFrames));
        if (Math.abs(d.accumulatedPx) >= pxPerFrame) {
          const steps = Math.trunc(d.accumulatedPx / pxPerFrame);
          d.accumulatedPx -= steps * pxPerFrame;
          stepFrames(reverseSpin ? -steps : steps);
        }
        rafId = requestAnimationFrame(runMomentum);
      }
    };
    if (!dragRef.current.active && Math.abs(dragRef.current.velocity) > 0.15) {
      rafId = requestAnimationFrame(runMomentum);
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasInteracted, reverseSpin, totalFrames, stepFrames]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setHasInteracted(true);
    setIsAutoSpin(false);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      lastX: e.clientX,
      accumulatedPx: 0,
      velocity: 0,
      lastTime: performance.now(),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;

    const now = performance.now();
    const dx = e.clientX - d.lastX;
    const dt = Math.max(1, now - d.lastTime);

    d.velocity = dx / dt;
    d.lastX = e.clientX;
    d.lastTime = now;
    d.accumulatedPx += dx;

    const pxPerFrame = Math.max(12, Math.round(320 / totalFrames));
    if (Math.abs(d.accumulatedPx) >= pxPerFrame) {
      const steps = Math.trunc(d.accumulatedPx / pxPerFrame);
      d.accumulatedPx -= steps * pxPerFrame;
      stepFrames(reverseSpin ? -steps : steps);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current.active = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > 0) {
      setHasInteracted(true);
      setZoom((prev) => {
        const next = prev + (e.deltaY < 0 ? 0.14 : -0.14);
        return Math.min(2.2, Math.max(1, Number(next.toFixed(2))));
      });
    }
  };

  const jumpToRatio = (ratio: number) => {
    setHasInteracted(true);
    setIsAutoSpin(false);
    setFrameIndex(Math.round(ratio * totalFrames) % totalFrames);
  };

  return (
    <div
      className="relative size-full overflow-hidden select-none touch-pan-y"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          setIsAutoSpin(false);
          stepFrames(1);
        } else if (e.key === 'ArrowLeft') {
          setIsAutoSpin(false);
          stepFrames(-1);
        }
      }}
      tabIndex={0}
    >
      {/* Interactive Drag Canvas */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative flex size-full cursor-grab items-center justify-center p-8 active:cursor-grabbing sm:p-12"
        title={t.stage360PhotoHint}
      >
        {/* Subtle floor contact shadow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[26%] bottom-[12%] h-[6%] rounded-[50%] bg-[#1e1e14]/22 blur-2xl"
        />

        <img
          src={currentSrc}
          alt={`${productName} - ${currentDegrees}°`}
          referrerPolicy="no-referrer"
          draggable={false}
          className="relative max-h-[82%] max-w-[82%] object-contain transition-transform duration-150 will-change-transform"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Top Left Status Pill: Angle + Frame Index */}
      <div className="pointer-events-none absolute start-4 top-4 z-10 flex flex-wrap items-center gap-2 sm:start-5 sm:top-5">
        <span
          dir="ltr"
          className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 font-mono text-[12px] font-semibold text-ink shadow-sm backdrop-blur"
        >
          <Camera className="size-3.5 text-accent" />
          <span>
            {currentDegrees}° · {safeIndex + 1}/{totalFrames}
          </span>
        </span>
        {activeFinishName && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1 text-[12px] font-medium text-ink backdrop-blur">
            <span
              className="size-3 rounded-full ring-1 ring-ink/20"
              style={{ backgroundColor: activeFinishColor }}
            />
            {activeFinishName}
          </span>
        )}
      </div>

      {/* Top Right Mode Switcher + Zoom */}
      <div className="absolute end-4 top-4 z-10 flex items-center gap-1.5 sm:end-5 sm:top-5">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
          disabled={zoom <= 1}
          title={t.stage360ZoomOut}
          aria-label={t.stage360ZoomOut}
          className="grid size-8 place-items-center rounded-full bg-card/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-card disabled:opacity-40"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.25).toFixed(2))))}
          disabled={zoom >= 2.2}
          title={t.stage360ZoomIn}
          aria-label={t.stage360ZoomIn}
          className="grid size-8 place-items-center rounded-full bg-card/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-card disabled:opacity-40"
        >
          <ZoomIn className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={onSwitchTo3D}
          className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-[11.5px] font-medium text-ink shadow-sm backdrop-blur transition-colors hover:bg-ink hover:text-canvas"
          title={t.stage360Mode3D}
        >
          <Box className="size-3.5" />
          <span className="hidden sm:inline">{t.stage360Mode3D}</span>
        </button>
      </div>

      {/* First-time Interaction Hint Bubble */}
      {!hasInteracted && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink/80 px-4 py-1.5 text-[12px] text-canvas shadow-lift backdrop-blur">
            <Sparkles className="size-3.5 text-accent" />
            <span>{t.stage360PhotoHint}</span>
          </div>
        </div>
      )}

      {/* Bottom Dock: Angle Scrubber + Quick Angle Snap + Auto Spin */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 px-3">
        {/* Continuous Angle Scrubber */}
        <div className="pointer-events-auto flex w-full max-w-xs items-center gap-2 rounded-full bg-card/90 px-3 py-1 shadow-sm ring-1 ring-line/60 backdrop-blur-md">
          <span dir="ltr" className="font-mono text-[10px] text-ink-soft">
            0°
          </span>
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={safeIndex}
            onChange={(e) => {
              setHasInteracted(true);
              setIsAutoSpin(false);
              setFrameIndex(Number(e.target.value));
            }}
            aria-label="360 angle scrubber"
            className="h-1.5 flex-1 cursor-pointer accent-ink"
          />
          <span dir="ltr" className="font-mono text-[10px] text-ink-soft">
            360°
          </span>
        </div>

        {/* Controls Bar */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full bg-card/90 p-1 shadow-tile ring-1 ring-line/70 backdrop-blur-md">
          <button
            type="button"
            onClick={() => jumpToRatio(0)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              safeIndex === 0 ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleFront}
          </button>
          <button
            type="button"
            onClick={() => jumpToRatio(0.25)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              Math.abs(safeIndex - Math.round(totalFrames * 0.25)) === 0
                ? 'bg-ink text-canvas'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleSide}
          </button>
          <button
            type="button"
            onClick={() => jumpToRatio(0.5)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              Math.abs(safeIndex - Math.round(totalFrames * 0.5)) === 0
                ? 'bg-ink text-canvas'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleBack}
          </button>
          <button
            type="button"
            onClick={() => jumpToRatio(0.75)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              Math.abs(safeIndex - Math.round(totalFrames * 0.75)) === 0
                ? 'bg-ink text-canvas'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleLeft}
          </button>

          <span className="mx-0.5 h-3.5 w-px bg-line" />

          <button
            type="button"
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isAutoSpin ? 'bg-accent/20 text-ink' : 'text-ink-soft hover:text-ink'
            }`}
            title={t.stage360Auto}
          >
            {isAutoSpin ? <Pause className="size-3" /> : <Play className="size-3" />}
            <span>{t.stage360Auto}</span>
          </button>

          <button
            type="button"
            onClick={() => setReverseSpin((v) => !v)}
            className={`rounded-full p-1.5 transition-colors ${
              reverseSpin ? 'bg-sand text-ink' : 'text-ink-soft hover:bg-canvas hover:text-ink'
            }`}
            title={t.stage360Direction}
            aria-label={t.stage360Direction}
          >
            <ArrowLeftRight className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setFrameIndex(0);
              setZoom(1);
              setIsAutoSpin(true);
            }}
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
            title={t.stage360Reset}
            aria-label={t.stage360Reset}
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Product360Viewer({
  product,
  activeFinishColor = '#d8cfbe',
  activeFinishName,
}: Product360ViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { t } = useShowroom();

  const frames360 = useMemo(
    () => (Array.isArray(product.frames360) ? product.frames360.filter(Boolean) : []),
    [product.frames360]
  );
  const hasPhotoFrames = frames360.length >= 2;
  const [force3dForId, setForce3dForId] = useState<string | null>(null);
  const viewerMode: 'photos' | '3d' =
    hasPhotoFrames && force3dForId !== product.id ? 'photos' : '3d';

  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeAnglePreset, setActiveAnglePreset] = useState<'iso' | 'front' | 'side' | 'top'>(
    'iso'
  );

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);

  // Initialize Three.js procedural scene (runs only when showing 3D mode)
  useEffect(() => {
    if (viewerMode === 'photos' && hasPhotoFrames) return;
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(3.4, 2.3, 3.4);
    cameraRef.current = camera;

    const keyLight = new THREE.DirectionalLight('#fff8f0', 2.2);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#f5f2eb', '#e6dec8', 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#e6f0fa', 1.0);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const { group: modelGroup, materials } = buildProceduralFurnitureModel(
      product,
      activeFinishColor
    );
    scene.add(modelGroup);

    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const targetLookAt = new THREE.Vector3(0, center.y, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(targetLookAt);
    controls.minDistance = 1.8;
    controls.maxDistance = 6.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minPolarAngle = 0.1;
    controlsRef.current = controls;

    let isUserDragging = false;
    const handleStart = () => {
      isUserDragging = true;
      setHasInteracted(true);
      targetCameraPos.current = null;
    };
    const handleEnd = () => {
      isUserDragging = false;
    };
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (isAutoSpin && !isUserDragging) {
        modelGroup.rotation.y += delta * 0.45;
      }

      if (targetCameraPos.current) {
        camera.position.lerp(targetCameraPos.current, 0.08);
        if (camera.position.distanceTo(targetCameraPos.current) < 0.02) {
          targetCameraPos.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      controls.dispose();

      materials.forEach((m) => m.dispose());
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [product, activeFinishColor, isAutoSpin, viewerMode, hasPhotoFrames]);

  if (viewerMode === 'photos' && hasPhotoFrames) {
    return (
      <Photo360Turntable
        frames={frames360}
        productName={product.name}
        activeFinishColor={activeFinishColor}
        activeFinishName={activeFinishName}
        onSwitchTo3D={() => setForce3dForId(product.id)}
      />
    );
  }

  const setPresetAngle = (preset: 'iso' | 'front' | 'side' | 'top') => {
    setActiveAnglePreset(preset);
    setHasInteracted(true);
    if (!cameraRef.current) return;

    if (preset === 'front') {
      targetCameraPos.current = new THREE.Vector3(0, 1.4, 4.4);
    } else if (preset === 'side') {
      targetCameraPos.current = new THREE.Vector3(4.4, 1.4, 0);
    } else if (preset === 'top') {
      targetCameraPos.current = new THREE.Vector3(0.01, 5.0, 0.01);
    } else {
      targetCameraPos.current = new THREE.Vector3(3.2, 2.2, 3.2);
    }
  };

  const handleReset = () => {
    setPresetAngle('iso');
    setIsAutoSpin(true);
  };

  return (
    <div className="relative size-full overflow-hidden select-none">
      <div
        ref={mountRef}
        className="size-full cursor-grab active:cursor-grabbing"
        title={t.stage360Hint}
      />

      <div className="pointer-events-none absolute start-5 top-5 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 font-mono text-[12px] font-semibold text-ink shadow-sm backdrop-blur">
          <RotateCcw className="size-3.5 text-ink animate-spin [animation-duration:12s]" />
          360° Studio
        </span>
        {activeFinishName && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1 text-[12px] font-medium text-ink backdrop-blur">
            <span
              className="size-3 rounded-full ring-1 ring-ink/20"
              style={{ backgroundColor: activeFinishColor }}
            />
            {activeFinishName}
          </span>
        )}
      </div>

      {/* Mode Switcher back to Captured Photos if product has frames360 */}
      {hasPhotoFrames && (
        <div className="absolute end-5 top-5 z-10">
          <button
            type="button"
            onClick={() => setForce3dForId(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[11.5px] font-medium text-canvas shadow-sm transition-colors hover:bg-accent"
          >
            <Camera className="size-3.5" />
            <span>{t.stage360ModePhotos} ({frames360.length})</span>
          </button>
        </div>
      )}

      {!hasInteracted && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink/80 px-4 py-1.5 text-[12px] text-canvas shadow-lift backdrop-blur">
            <Sparkles className="size-3.5 text-accent" />
            <span>{t.stage360Hint}</span>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-card/90 p-1.5 shadow-tile ring-1 ring-line/70 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPresetAngle('iso')}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeAnglePreset === 'iso' ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleIso}
          </button>
          <button
            type="button"
            onClick={() => setPresetAngle('front')}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeAnglePreset === 'front' ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleFront}
          </button>
          <button
            type="button"
            onClick={() => setPresetAngle('side')}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeAnglePreset === 'side' ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleSide}
          </button>
          <button
            type="button"
            onClick={() => setPresetAngle('top')}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeAnglePreset === 'top' ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.stage360AngleTop}
          </button>

          <span className="mx-0.5 h-3.5 w-px bg-line" />

          <button
            type="button"
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isAutoSpin ? 'bg-accent/20 text-ink' : 'text-ink-soft hover:text-ink'
            }`}
            title={t.stage360Auto}
          >
            {isAutoSpin ? <Pause className="size-3" /> : <Play className="size-3" />}
            <span>{t.stage360Auto}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
            title={t.stage360Reset}
            aria-label={t.stage360Reset}
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
