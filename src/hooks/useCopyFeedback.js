import { useEffect, useRef, useState } from "react";

/* Copies text to the clipboard and reports a short-lived "copied" label,
   cleaning its timer up on unmount so a fast back-navigation cannot set
   state on an unmounted component. */
function useCopyFeedback() {
  const [copied, setCopied] = useState("");
  const timerRef = useRef(null);
  const copy = (text, label) => {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(label);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(""), 1600);
  };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return [copied, copy];
}

export default useCopyFeedback;
