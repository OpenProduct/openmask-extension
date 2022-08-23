import copyToClipboard from "copy-to-clipboard";
import { useCallback, useState } from "react";
import { useTimeout } from "./useTimeout";

/**
 * useCopyToClipboard
 *
 * @param {number} [delay=2000] - delay in ms
 * @returns {[boolean, Function]}
 */
const DEFAULT_DELAY = 1000 * 2;

export function useCopyToClipboard(delay = DEFAULT_DELAY) {
  const [copied, setCopied] = useState(false);
  const startTimeout = useTimeout(() => setCopied(false), delay, false);

  const handleCopy = useCallback(
    (text: string) => {
      setCopied(true);
      startTimeout();
      copyToClipboard(text);
    },
    [startTimeout]
  );

  return [copied, handleCopy] as const;
}
