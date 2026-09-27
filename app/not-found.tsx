import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-dvh items-center justify-center bg-white p-6 dark:bg-zinc-950">
      <div className="max-w-sm text-center">
        <p className="font-mono text-sm text-zinc-400">404</p>
        <p className="mt-1 text-lg font-bold">Page not found</p>
        <p className="mt-1 text-sm text-zinc-500">DocuFlow is a single-page studio — head back to the editor.</p>
        <Link
          href="/"
          className="mt-4 inline-flex h-9 items-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to studio
        </Link>
      </div>
    </div>
  );
}
