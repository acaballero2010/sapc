import React, { useRef, useState, useCallback, useEffect } from "react";

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const hasMovedRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Allow small epsilon for subpixel precision
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    checkScroll();

    // Resize observer to detect container and content width changes
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    // Also observe children mutations if dynamic items change
    const mutationObserver = new MutationObserver(() => {
      checkScroll();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const onMouseDown = useCallback((e: React.MouseEvent<T>) => {
    if (!ref.current) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!isDragging || !ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
      e.preventDefault();
    }
    ref.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  }, [isDragging, startX, scrollLeft, checkScroll]);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
    }
  }, []);

  const scrollBy = useCallback((offset: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  }, [checkScroll]);

  return {
    ref,
    isDragging,
    canScrollLeft,
    canScrollRight,
    checkScroll,
    scrollBy,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
      onClickCapture
    }
  };
}
