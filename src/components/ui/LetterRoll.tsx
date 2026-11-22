/**
 * Lusion-style slot roll: each letter is a column of two copies. On hover (or focus of an ancestor
 * `.work-item`) the columns roll up one by one with a short stagger. Decorative copy is aria-hidden.
 */
export function LetterRoll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`letter-roll ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="letter-roll-line">
        {Array.from(text).map((ch, i) => (
          <span className="letter-col" key={i} style={{ ["--i" as string]: i }}>
            <span>{ch === " " ? " " : ch}</span>
            <span>{ch === " " ? " " : ch}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
