"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

/** Small copy-to-clipboard chip with a short "Copied" confirmation. Used for both the email and the phone number. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" aria-label={`Copy ${label}`} className={`copy-btn ${state === "copied" ? "is-copied" : ""}`} onClick={copy}>
        {state === "copied" ? <Check aria-hidden size={13} /> : <Copy aria-hidden size={13} />}
        <span>{state === "copied" ? "Copied" : state === "failed" ? "Select to copy" : "Copy"}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? `${label} copied to clipboard` : state === "failed" ? "Copy failed" : ""}
      </span>
    </>
  );
}
