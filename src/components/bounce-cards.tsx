/* Componente "sanfona de cards" portado do projeto Worky (BounceCards). */
import { Children, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Slot = { x: number; y: number; rotate: number };

type Body = Slot & {
  scale: number;
  vx: number;
  vy: number;
  vr: number;
  vs: number;
  born: number;
};

const step = (
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] => {
  const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
  return [value + next * dt, next];
};

type BounceCardsProps = {
  children: ReactNode;
  containerWidth?: number;
  containerHeight?: number;
  cardWidth?: number;
  cardHeight?: number;
  spread?: number;
  rotation?: number;
  arc?: number;
  animationDelay?: number;
  animationStagger?: number;
  bounciness?: number;
  pushDistance?: number;
  hoverScale?: number;
};

export default function BounceCards({
  children,
  containerWidth = 800,
  containerHeight = 150,
  cardWidth = 290,
  cardHeight = 84,
  spread = 165,
  rotation = 6,
  arc = 0,
  animationDelay = 0.3,
  animationStagger = 0.08,
  bounciness = 0.6,
  pushDistance = 125,
  hoverScale = 1.06,
}: BounceCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wakeRef = useRef<(() => void) | null>(null);
  const items = Children.toArray(children);
  const count = items.length;
  const middle = (count - 1) / 2;
  const reach = Math.max(1, middle);
  const slots: Slot[] = items.map((_, i) => {
    const offset = i - middle;
    return { x: offset * spread, y: arc * (offset / reach) ** 2, rotate: rotation * PATTERN[i % PATTERN.length] };
  });
  const settings = {
    slots,
    cardWidth,
    cardHeight,
    delay: Math.max(0, animationDelay),
    stagger: Math.max(0, animationStagger),
    bounciness: clamp(bounciness, 0, 1),
    pushDistance,
    hoverScale: clamp(hoverScale, 0.5, 2),
  };
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const bodies: Body[] = [];
    const state = { hovered: -1, time: 0, layer: -1 };
    let raf = 0;
    let last = performance.now();
    let alive = true;

    const body = (i: number): Body => {
      if (!bodies[i]) {
        const slot = settingsRef.current.slots[i] ?? { x: 0, y: 0, rotate: 0 };
        bodies[i] = { ...slot, scale: reduce ? 1 : 0, vx: 0, vy: 0, vr: 0, vs: 0, born: state.time };
      }
      return bodies[i];
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      state.time += dt;
      const hovered = state.hovered;
      const popStiffness = 170;
      const popDamping = 2 * (1 - 0.85 * s.bounciness) * Math.sqrt(popStiffness);
      const moveStiffness = 210;
      const moveDamping = 2 * (reduce ? 1 : 0.72) * Math.sqrt(moveStiffness);
      const substeps = Math.ceil(dt / (1 / 240));
      const h = dt / substeps;
      let moving = 0;

      for (let i = 0; i < s.slots.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const card = body(i);
        const slot = s.slots[i];
        const appeared = reduce || state.time - card.born >= s.delay + i * s.stagger;
        let targetX = slot.x;
        let targetY = slot.y;
        let targetRotate = slot.rotate;
        let targetScale = appeared ? 1 : 0;
        if (hovered >= 0 && appeared) {
          if (i === hovered) {
            targetY = slot.y - s.cardHeight * 0.06;
            targetRotate = 0;
            targetScale = s.hoverScale;
          } else {
            targetX = slot.x + Math.sign(i - hovered) * s.pushDistance;
          }
        }
        for (let k = 0; k < substeps; k++) {
          [card.x, card.vx] = step(card.x, card.vx, targetX, moveStiffness, moveDamping, h);
          [card.y, card.vy] = step(card.y, card.vy, targetY, moveStiffness, moveDamping, h);
          [card.rotate, card.vr] = step(card.rotate, card.vr, targetRotate, moveStiffness, moveDamping, h);
          if (reduce) {
            card.scale = targetScale;
            card.vs = 0;
          } else {
            [card.scale, card.vs] = step(card.scale, card.vs, targetScale, popStiffness, popDamping, h);
          }
        }
        moving +=
          Math.abs(card.vx) +
          Math.abs(card.vy) +
          Math.abs(card.vr) +
          Math.abs(card.vs) * 100 +
          Math.abs(targetX - card.x) +
          Math.abs(targetY - card.y) +
          Math.abs(targetRotate - card.rotate) +
          Math.abs(targetScale - card.scale) * 100 +
          (appeared ? 0 : 1);
        el.style.transform = `translate(-50%, -50%) translate(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px) rotate(${card.rotate.toFixed(3)}deg) scale(${Math.max(0, card.scale).toFixed(4)})`;
      }

      if (state.layer !== hovered) {
        state.layer = hovered;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.zIndex = i === hovered ? String(s.slots.length + 1) : String(i + 1);
        });
      }

      if (moving > 0.02) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const pick = (event: PointerEvent) => {
      const s = settingsRef.current;
      const rect = root.getBoundingClientRect();
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      let best = -1;
      let distance = Infinity;
      s.slots.forEach((slot, i) => {
        const gap = Math.abs(px - (bodies[i]?.x ?? slot.x));
        if (gap < distance) {
          distance = gap;
          best = i;
        }
      });
      if (best < 0) return -1;
      const slot = bodies[best] ?? s.slots[best];
      if (Math.abs(py - slot.y) > s.cardHeight / 2 + 12 || distance > s.cardWidth / 2 + 12) return -1;
      if (state.hovered >= 0 && state.hovered !== best) {
        const current = bodies[state.hovered] ?? s.slots[state.hovered];
        if (current && Math.abs(px - current.x) - distance < 6) return state.hovered;
      }
      return best;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const next = pick(event);
      if (next !== state.hovered) {
        state.hovered = next;
        wake();
      }
    };
    const onLeave = () => {
      if (state.hovered !== -1) {
        state.hovered = -1;
        wake();
      }
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  const style: CSSProperties = {
    width: containerWidth,
    height: containerHeight,
    maxWidth: "100%",
    position: "relative",
    margin: "0 auto",
  };

  return (
    <div ref={rootRef} style={style}>
      {items.map((item, i) => (
        <div
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: cardWidth,
            height: cardHeight,
            zIndex: i + 1,
            transform: "translate(-50%, -50%) scale(0)",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
