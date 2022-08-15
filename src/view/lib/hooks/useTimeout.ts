import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useTimeout
 *
 * @param {Function} cb - callback function inside setTimeout
 * @param {number} delay - delay in ms
 * @param {boolean} [immediate] - determines whether the timeout is invoked immediately
 * @returns {Function|undefined}
 */
export function useTimeout(cb: () => void, delay: number, immediate = true) {
  const saveCb = useRef<() => void>();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null | "start">(
    null
  );

  useEffect(() => {
    saveCb.current = cb;
  }, [cb]);

  useEffect(() => {
    if (timeoutId !== "start") {
      return undefined;
    }

    const id = setTimeout(() => {
      saveCb.current && saveCb.current();
    }, delay);

    setTimeoutId(id);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, timeoutId]);

  const startTimeout = useCallback(() => {
    typeof timeoutId === "number" && clearTimeout(timeoutId);
    setTimeoutId("start");
  }, [timeoutId]);

  if (immediate) {
    startTimeout();
  }

  return startTimeout;
}
