"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-dvh items-center justify-center bg-white p-6 dark:bg-zinc-950">
      <div className="max-w-sm text-center">
        <p className="text-lg font-bold">Something went wrong</p>
        <p className="mt-1 text-sm text-zinc-500">
          DocuFlow hit a rendering error{error.digest ? ` (${error.digest})` : ""}. Your draft is autosaved locally — nothing is lost.
        </p>
        <button
          onClick={reset}
          className="mt-4 h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
