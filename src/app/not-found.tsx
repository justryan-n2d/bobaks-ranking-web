import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">404</div>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">The Bobaks page you requested does not exist.</p>
      <Link href="/" className="mt-7 inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
        Back to Bobaks
      </Link>
    </div>
  );
}
