"use client";

import { useEffect, useRef, useState } from "react";
import { beyond } from "@/content/beyond";

/**
 * Portrait frame. Shows /images/profile-placeholder.jpg when it exists; until then (or if it fails to load)
 * it shows a neutral monogram placeholder, never a broken image.
 */
export function ProfilePhoto() {
  const img = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const { src, alt, caption, initials } = beyond.photo;

  useEffect(() => {
    const el = img.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? "ok" : "missing");
  }, []);

  return (
    <figure className="bp-frame" data-state={state}>
      <div className="bp-plate">
        {/* Placeholder sits underneath and is covered once the real photograph has loaded. */}
        <div className="bp-empty" aria-hidden={state === "ok"}>
          <span className="bp-mono">{initials}</span>
          <span className="bp-cap">{caption}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={img}
          src={src}
          alt={state === "ok" ? alt : ""}
          className="bp-img"
          loading="lazy"
          decoding="async"
          onLoad={() => setState("ok")}
          onError={() => setState("missing")}
        />
        <i className="bp-corner bp-tl" aria-hidden />
        <i className="bp-corner bp-br" aria-hidden />
      </div>
    </figure>
  );
}
