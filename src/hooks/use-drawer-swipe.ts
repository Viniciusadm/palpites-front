import { useEffect, useRef, useState } from "react";

const PANEL_WIDTH = 288;
const EDGE = 24;
const SLOP = 8;

export function useDrawerSwipe(isOpen: boolean, setOpen: (v: boolean) => void) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    const state = {
      tracking: false,
      committed: false,
      startX: 0,
      startY: 0,
    };

    const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

    const reset = () => {
      state.tracking = false;
      state.committed = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1 || !isMobile()) {
        reset();
        return;
      }
      const touch = e.touches[0];
      const open = openRef.current;
      const canOpen = !open && touch.clientX < EDGE;
      const canClose = open;
      if (!canOpen && !canClose) {
        reset();
        return;
      }
      state.tracking = true;
      state.committed = false;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!state.tracking) return;
      const touch = e.touches[0];
      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;

      if (!state.committed) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        if (Math.abs(dx) <= Math.abs(dy)) {
          reset();
          return;
        }
        state.committed = true;
        setDragging(true);
      }

      e.preventDefault();
      const next = openRef.current ? 1 + dx / PANEL_WIDTH : dx / PANEL_WIDTH;
      setProgress(Math.max(0, Math.min(1, next)));
    };

    const onTouchEnd = () => {
      if (!state.tracking) return;
      const wasCommitted = state.committed;
      reset();
      if (!wasCommitted) return;
      setDragging(false);
      setProgress((p) => {
        setOpenRef.current(p > 0.5);
        return p;
      });
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return { dragging, progress };
}
