"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Point { x: number; y: number }
interface Ripple { x: number; y: number; radius: number; opacity: number; born: number }

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;

const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.13 };
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  base: { r: number; g: number; b: number; a: number },
  active: { r: number; g: number; b: number; a: number },
  t: number,
): string {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/**
 * Grade cinética (21st.dev). Adaptações para o projeto:
 * - `vc`: preto + vermelho Affairs, com fundo transparente para a luz vermelha aparecer por trás;
 * - `contained`: o canvas ocupa o contêiner (e não a janela) e o mouse é medido relativo a ele;
 * - `still`: desenha um quadro estático (movimento reduzido).
 */
export default function KineticGrid({
  children,
  className,
  globalColor = "default",
  contained = false,
  still = false,
}: {
  children?: ReactNode;
  className?: string;
  globalColor?: "default" | "monochrome" | "vc";
  contained?: boolean;
  still?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 });
  const dotsRef = useRef<HTMLCanvasElement | null>(null);
  const visibleRef = useRef(true);

  const getWarpedPoint = useCallback(
    (gx: number, gy: number, col: number, row: number, mouse: Point, ripples: Ripple[], cols: number, rows: number): { pt: Point; proximity: number } => {
      const edgeMargin = 1.5;
      const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
      const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
      const pinFactor = colPin * colPin * rowPin * rowPin;

      const dx = gx - mouse.x;
      const dy = gy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

      let rx = 0, ry = 0;
      for (const r of ripples) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 55;
        const diff = rdist - r.radius;
        if (Math.abs(diff) < waveWidth) {
          const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pinFactor;
          const angle = Math.atan2(rdy, rdx);
          const sign = diff < 0 ? -1 : 1;
          rx += Math.cos(angle) * strength * sign * -1;
          ry += Math.sin(angle) * strength * sign * -1;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const warpAmt = eased * MAX_WARP * pinFactor;
        const angle = Math.atan2(dy, dx);
        return { pt: { x: gx - Math.cos(angle) * warpAmt + rx, y: gy - Math.sin(angle) * warpAmt + ry }, proximity };
      }

      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    [],
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w: W, h: H, dpr } = sizeRef.current;
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;

      const theme = {
        default: { bg: "#161618", lineActive: { r: 74, g: 158, b: 255, a: 0.9 }, nodeActive: { r: 74, g: 158, b: 255, a: 1.0 }, glow: "74,158,255", ripple: "100,180,255" },
        monochrome: { bg: "#000000", lineActive: { r: 255, g: 255, b: 255, a: 0.9 }, nodeActive: { r: 255, g: 255, b: 255, a: 1.0 }, glow: "255,255,255", ripple: "255,255,255" },
        vc: { bg: "", lineActive: { r: 247, g: 5, b: 5, a: 0.95 }, nodeActive: { r: 255, g: 70, b: 60, a: 1.0 }, glow: "247,5,5", ripple: "247,5,5" },
      }[globalColor ?? "default"];

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (theme.bg) {
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, W, H);
      }

      if (dotsRef.current) {
        ctx.drawImage(dotsRef.current, 0, 0, W, H);
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 400);
        r.opacity = Math.max(0, 1 - age * 1.2);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
      const cellW = W / (cols - 1);
      const cellH = H / (rows - 1);

      const pts: Point[][] = [];
      const prox: number[][] = [];

      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = getWarpedPoint(col * cellW, row * cellH, col, row, mouse, ripples, cols, rows);
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      // linhas em repouso (sem influência) vão num único traço; só as ativas são desenhadas uma a uma
      const basePath = new Path2D();
      const active: [Point, Point, number][] = [];
      const addSeg = (p1: Point, p2: Point, pr1: number, pr2: number) => {
        const avg = (pr1 + pr2) / 2;
        if (avg <= 0.001) {
          basePath.moveTo(p1.x, p1.y);
          basePath.lineTo(p2.x, p2.y);
        } else {
          active.push([p1, p2, avg * avg * (3 - 2 * avg)]);
        }
      };

      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          addSeg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);

      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          addSeg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

      ctx.lineCap = "butt";
      ctx.strokeStyle = lerpColor(LINE_BASE, theme.lineActive, 0);
      ctx.lineWidth = 0.8;
      ctx.stroke(basePath);
      for (const [p1, p2, t] of active) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, theme.lineActive, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke();
      }

      const idleNodes = new Path2D();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const pr = prox[row][col];
          if (pr <= 0.001) {
            idleNodes.moveTo(p.x + NODE_BASE_RADIUS, p.y);
            idleNodes.arc(p.x, p.y, NODE_BASE_RADIUS, 0, Math.PI * 2);
            continue;
          }
          const t = pr * pr * (3 - 2 * pr);
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

          if (t > 0.3) {
            const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
            grd.addColorStop(0, `rgba(${theme.glow},${(t * 0.3).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${theme.glow},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor({ r: 255, g: 255, b: 255, a: 0.2 }, theme.nodeActive, t);
          ctx.fill();
        }
      }
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fill(idleNodes);

      for (const r of ripples) {
        const safeRadius = Math.max(0, r.radius);
        ctx.beginPath();
        ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${theme.ripple},${(r.opacity * 0.28).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [getWarpedPoint, globalColor],
  );

  const dirtyRef = useRef(true);
  const animate = useCallback(
    (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (!visibleRef.current) return;
      const m = mouseRef.current;
      const t = targetMouseRef.current;
      if (m.x === -9999 && t.x !== -9999) { m.x = t.x; m.y = t.y; }
      const moving = Math.abs(t.x - m.x) > 0.25 || Math.abs(t.y - m.y) > 0.25;
      if (moving) {
        m.x = lerpN(m.x, t.x, LERP_SPEED);
        m.y = lerpN(m.y, t.y, LERP_SPEED);
      }
      // sem movimento, sem ondas e sem mudança de tamanho, o quadro anterior continua valendo
      if (!moving && ripplesRef.current.length === 0 && !dirtyRef.current) return;
      dirtyRef.current = false;
      draw(now);
    },
    [draw],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const setSize = () => {
      const w = contained ? wrap.clientWidth : window.innerWidth;
      const h = contained ? wrap.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sizeRef.current = { w, h, dpr };
      const dots = document.createElement("canvas");
      dots.width = Math.round(w * dpr);
      dots.height = Math.round(h * dpr);
      const dctx = dots.getContext("2d");
      if (dctx) {
        dctx.scale(dpr, dpr);
        dctx.fillStyle = "rgba(255,255,255,0.05)";
        for (let x = DOT_SPACING / 2; x < w; x += DOT_SPACING)
          for (let y = DOT_SPACING / 2; y < h; y += DOT_SPACING) {
            dctx.beginPath();
            dctx.arc(x, y, 0.7, 0, Math.PI * 2);
            dctx.fill();
          }
      }
      dotsRef.current = dots;
      dirtyRef.current = true;
      if (still) draw(performance.now());
    };

    setSize();
    const ro = contained ? new ResizeObserver(setSize) : null;
    ro?.observe(wrap);
    window.addEventListener("resize", setSize);

    const local = (e: MouseEvent): Point => {
      if (!contained) return { x: e.clientX, y: e.clientY };
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onMouseMove = (e: MouseEvent) => { targetMouseRef.current = local(e); };
    const onClick = (e: MouseEvent) => {
      const p = local(e);
      ripplesRef.current.push({ x: p.x, y: p.y, radius: 0, opacity: 1, born: performance.now() });
    };

    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; if (e.isIntersecting) dirtyRef.current = true; });
    io.observe(wrap);

    if (!still) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("click", onClick);
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      ro?.disconnect();
      io.disconnect();
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, contained, still, draw]);

  return (
    <div
      ref={wrapRef}
      aria-hidden={children ? undefined : true}
      className={cn(
        "relative w-full overflow-hidden",
        contained ? "h-full" : "min-h-screen",
        globalColor === "monochrome" ? "bg-[#000000]" : globalColor === "vc" ? "bg-transparent" : "bg-[#161618]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn("inset-0 h-full w-full z-0 pointer-events-none", contained ? "absolute" : "fixed")}
      />
      {children ? <div className="relative z-10 w-full h-full">{children}</div> : null}
    </div>
  );
}
