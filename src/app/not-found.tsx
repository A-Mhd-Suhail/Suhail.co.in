import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="wrap nf">
      <p className="label">404</p>
      <h1 className="h1">That page isn&apos;t here.</h1>
      <p className="lede">It may have moved, or the address may be mistyped.</p>
      <p>
        <Link className="btn btn-solid" href="/">
          Back to the start
        </Link>
      </p>
    </section>
  );
}
