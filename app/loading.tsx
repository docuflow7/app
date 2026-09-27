export default function Loading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-white dark:bg-zinc-950" aria-busy="true" aria-label="Loading DocuFlow">
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg">
          D
        </span>
        <p className="text-sm font-medium text-zinc-500">Loading DocuFlow…</p>
      </div>
    </div>
  );
}
