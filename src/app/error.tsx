"use client";

/** Last line of defence: if something in the page throws, show a readable page instead of a blank one. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="nf" style={{ padding: "6rem var(--header-pad-x, 1.5rem)" }}>
      <h1 className="h1">Something went wrong.</h1>
      <p className="lede">The page hit an unexpected problem. You can try again, or head back to the start.</p>
      <p style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem" }}>
        <button type="button" className="text-link" onClick={reset}>
          Try again
        </button>
        <a className="text-link" href="/">
          Back to the start
        </a>
      </p>
    </main>
  );
}
