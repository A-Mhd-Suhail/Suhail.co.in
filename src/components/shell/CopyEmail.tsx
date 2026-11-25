"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2400);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" aria-label="Copy email address" className={`copy-btn ${state === "copied" ? "is-copied" : ""}`} onClick={copy}>
        {state === "copied" ? <Check aria-hidden size={13} /> : <Copy aria-hidden size={13} />}
        <span>{state === "copied" ? "Copied" : state === "failed" ? "Select to copy" : "Copy"}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Email address copied to clipboard" : state === "failed" ? "Copy failed" : ""}
      </span>
    </>
  );
}
