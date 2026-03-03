import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">404</p>
      <h1 className="mt-4 font-display text-5xl text-ink-900">Page not found</h1>
      <p className="mt-4 text-ink-700">The requested route is not available in the current content map.</p>
      <Link href="/en" className="mt-8 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-sand-50">
        Go to homepage
      </Link>
    </main>
  );
}
