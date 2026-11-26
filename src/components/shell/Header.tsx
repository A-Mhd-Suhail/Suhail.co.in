"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { navItems } from "@/content/nav";
import { useActiveSection } from "@/lib/useActiveSection";
import { Roll } from "@/components/ui/Roll";

/**
 * Fixed header: wordmark, LET'S TALK and MENU.
 * Colours follow whatever section is under the header (data-tone on sections drives html[data-tone]).
 * A section with data-bar="<colour>" also gets a strip of that colour behind the header, so the name and the
 * buttons never sit on top of the text scrolling underneath.
 */
export function Header() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Tone and strip: sample the section under the header. Sampling reads layout, so it runs at most every 80ms.
  useEffect(() => {
    let timer = 0;
    const root = document.documentElement;
    const update = () => {
      timer = 0;
      const hit = document
        .elementsFromPoint(window.innerWidth / 2, 56)
        .find((el) => !el.closest(".header") && el.closest("[data-tone]"));
      const section = hit?.closest<HTMLElement>("[data-tone]");
      const tone = section?.dataset.tone ?? "dark";
      const bar = section?.dataset.bar;
      if (root.dataset.tone !== tone) root.dataset.tone = tone;
      if (bar) root.style.setProperty("--bar", bar);
      root.dataset.bar = bar ? "on" : "off";
    };
    const onScroll = () => {
      if (!timer) timer = window.setTimeout(update, 80);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    const main = document.getElementById("main");
    const footer = document.querySelector<HTMLElement>(".footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    firstLink.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const links = Array.from(document.querySelectorAll<HTMLElement>("#menu a[href]"));
      const items = [toggle.current, ...links].filter((el): el is HTMLElement => !!el);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.__lenis?.start();
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header className="header" data-open={open}>
      <a href="/" className="header-logo" aria-label={`${profile.name}, back to top`}>
        {profile.name}
      </a>

      <div className="header-actions">
        <a className="hbtn hbtn-talk" href="/contact">
          <Roll>Let&apos;s talk</Roll>
          <span className="hbtn-dot" aria-hidden />
        </a>
        <button
          ref={toggle}
          type="button"
          className="hbtn hbtn-menu"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Roll>{open ? "Close" : "Menu"}</Roll>
          <span className="hbtn-dots" aria-hidden>
            <i />
            <i />
          </span>
        </button>
      </div>

    </header>
    {/* Sibling, not child, of the header: its entrance animation would otherwise become the fixed menu's containing block. */}
    {open && (
        <div id="menu" className="menu" role="dialog" aria-modal="true" aria-label="Site menu">
          <nav aria-label="Primary">
            <ul>
              {navItems.map((n, i) => (
                <li key={n.id} style={{ ["--i" as string]: i }}>
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={n.href}
                    aria-current={active === n.id ? "true" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu-foot">
            <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
            <span>
              {profile.contact.phoneDisplay} · {profile.contact.country}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
