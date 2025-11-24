"use client";

import Image from "next/image";
import { useCallback, useRef, useState, useEffect } from "react";

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  height?: number;
  industry?: string;
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Vorher",
  afterLabel = "Nachher",
  height = 360,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [pos, setPos] = useState(50);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  // Global pointer event handlers for smooth dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      setFromClientX(e.clientX);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (draggingRef.current) {
        e.preventDefault();
        draggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
      }
    };

    // Always add listeners, they check draggingRef internally
    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp, { passive: false });
    document.addEventListener('pointercancel', handlePointerUp, { passive: false });

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [setFromClientX]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
    setFromClientX(e.clientX);
    
    // Capture pointer to ensure we get all events
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg select-none"
        style={{ 
          height,
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* AFTER (full background) - starr, keine Transformation */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={afterSrc}
            alt={afterLabel}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            style={{ 
              objectPosition: 'center center',
              pointerEvents: 'none',
              userSelect: 'none',
            } as React.CSSProperties}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {/* BEFORE (clipped overlay) - starr, genau an der Slider-Kante */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
          }}
        >
          <Image
            src={beforeSrc}
            alt={beforeLabel}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            style={{ 
              objectPosition: 'left center',
              pointerEvents: 'none',
              userSelect: 'none',
            } as React.CSSProperties}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {/* Interactive overlay for dragging - covers entire container */}
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-20"
          onPointerDown={onPointerDown}
          style={{ 
            touchAction: 'none',
            userSelect: 'none',
          }}
        />

        {/* Divider + handle - visual indicator only */}
        <div
          className="absolute inset-y-0 z-30 pointer-events-none"
          style={{ 
            left: `${pos}%`, 
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex h-full items-center justify-center">
            <div className="h-full w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
            <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border-2 border-slate-300 text-slate-700 text-lg font-medium">
              ↔
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 pointer-events-none z-10">
          {beforeLabel}
        </div>
        <div className="absolute bottom-3 right-3 rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 pointer-events-none z-10">
          {afterLabel}
        </div>
      </div>
    </div>
  );
}
