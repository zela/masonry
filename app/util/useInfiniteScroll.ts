import { useEffect, useRef } from "react";

/**
 * Hook for the infinite scroll:
 * 1. Sets up IntersectionObserver to watch sentinel element
 * 2. Triggers callback when sentinel becomes visible in viewport
 * 3. Uses root margin for early loading before reaching bottom
 * 4. Prevents concurrent fetches using a loading flag
 * 5. Properly cleans up observer references on unmount or dependency changes
 * 6. Maintains reference stability to prevent unnecessary re-renders
 */
export function useInfiniteScroll(
  callback?: () => void | Promise<void>,
  hasMore?: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (typeof callback !== "function" || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if intersecting and not already loading
        if (entries[0]?.isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true;

          const potentialPromise = callback();

          // Handle async callback completion
          if (potentialPromise && typeof potentialPromise.then === "function") {
            potentialPromise.finally(() => {
              // Reset loading flag only after async operation completes
              isLoadingRef.current = false;
            });
          } else {
            // If callback is synchronous, reset immediately
            isLoadingRef.current = false;
          }
        }
      },
      // Keep the root margin to trigger loading early
      { rootMargin: "400px" },
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
      // Reset loading state on unmount just in case
      isLoadingRef.current = false;
    };
  }, [callback, hasMore]);

  return sentinelRef;
}

/**
 * Basic version without the loading flag
 */
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
      { rootMargin: "400px" },
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
