"use client";

/** Replaces the whole document if even the root layout fails, so the visitor never sees an empty page. */
export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050506", color: "#f3efe6", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "grid", placeContent: "center", padding: "2rem" }}>
        <h1 style={{ fontWeight: 400, fontSize: "2rem", margin: 0 }}>Mohamed Suhail</h1>
        <p style={{ opacity: 0.7 }}>Something went wrong loading this page.</p>
        <p>
          <a href="/" style={{ color: "inherit" }}>
            Reload
          </a>
        </p>
      </body>
    </html>
  );
}
