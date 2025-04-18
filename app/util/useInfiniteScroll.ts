import { useEffect, useRef } from "react";

/**
 * Hook for the infinite scroll:
 * 1. Sets up IntersectionObserver to watch sentinel element
 * 2. Triggers callback when sentinel becomes visible in viewport
 * 3. Uses 200px root margin for early loading before reaching bottom
 * 4. Implements debouncing to prevent duplicate requests during momentum scrolling
 * 5. Properly cleans up observer references on unmount or dependency changes
 * 6. Maintains reference stability to prevent unnecessary re-renders
 */
export function useInfiniteScroll(
  callback?: () => void | Promise<void>,
  hasMore?: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef<number>(0);

  useEffect(() => {
    if (typeof callback !== "function" || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true;
          clearTimeout(timeoutRef.current);

          timeoutRef.current = window.setTimeout(() => {
            const potentialPromise = callback();

            if (
              potentialPromise &&
              typeof potentialPromise.then === "function"
            ) {
              potentialPromise.finally(() => {
                isLoadingRef.current = false;
              });
            } else {
              isLoadingRef.current = false;
            }
          }, 200);
        }
      },
      { rootMargin: "300px" },
    );

    const currentRef = sentinelRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup function
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
      clearTimeout(timeoutRef.current);
      isLoadingRef.current = false;
    };
  }, [callback, hasMore]);

  return sentinelRef;
}

export function useInfiniteScroll0(callback?: () => void, hasMore?: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!callback || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callback();
        }
      },
      { rootMargin: "200px" },
    );

    const currentRef = sentinelRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [callback, hasMore]);

  return sentinelRef;
}
