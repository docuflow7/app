"use client";

import { useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { Editor } from "@/components/Editor";
import { PreviewPane } from "@/components/PreviewPane";
import { PageSettings } from "@/components/PageSettings";
import { CommandPalette } from "@/components/CommandPalette";
import { Toasts } from "@/components/Ui";
import { useDocStore, buildPageCss } from "@/lib/store";
import { stripExtension } from "@/lib/markdown";
import { SAMPLE_MARKDOWN } from "@/lib/sample";
import { cn } from "@/lib/cn";

export default function Home() {
  const darkMode = useDocStore((s) => s.darkMode);
  const focusMode = useDocStore((s) => s.focusMode);
  const settingsOpen = useDocStore((s) => s.settingsOpen);
  const toasts = useDocStore((s) => s.toasts);
  const pageFormat = useDocStore((s) => s.pageFormat);
  const orientation = useDocStore((s) => s.orientation);
  const marginPreset = useDocStore((s) => s.marginPreset);
  const customMarginIn = useDocStore((s) => s.customMarginIn);
  const filename = useDocStore((s) => s.filename);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // First run: preload a sample document so the product explains itself.
  // Returning users get their autosaved draft from localStorage instead.
  useEffect(() => {
    try {
      if (!localStorage.getItem("docuflow-v1")) {
        useDocStore.getState().setContent(SAMPLE_MARKDOWN);
      }
    } catch {
      useDocStore.getState().setContent(SAMPLE_MARKDOWN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The browser names the saved PDF after document.title — keep it in sync
  // with the filename field so "Save as PDF" defaults to the right name.
  useEffect(() => {
    document.title = `${stripExtension(filename.trim() || "Document")} — DocuFlow`;
  }, [filename]);

  // Reset the Export button if the user cancels out of the print dialog.
  useEffect(() => {
    const reset = () => useDocStore.getState().setExportStage("idle");
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  return (
    <div className="app-shell flex h-dvh flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Dynamic print @page rule mirrors on-screen setup */}
      <style>{buildPageCss(pageFormat, orientation, marginPreset, customMarginIn)}</style>

      <a
        href="#editor"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-1.5 focus:text-sm focus:text-white"
      >
        Skip to editor
      </a>

      {!focusMode && <TopBar />}
      {focusMode && (
        <button
          onClick={() => useDocStore.getState().toggle("focusMode")}
          className="no-print mx-auto mt-2 rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Exit focus mode (Ctrl+K → focus to toggle)
        </button>
      )}

      <main className="app-main flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Editor — hidden in print, only the paper exports */}
        <div id="editor" className="editor-col no-print flex min-h-[42dvh] min-w-0 flex-1 flex-col border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800">
          <Editor />
        </div>

        {/* Preview */}
        <div className={cn("preview-col flex min-h-[42dvh] min-w-0 flex-1 flex-col", settingsOpen ? "lg:mr-0" : "")}>
          <PreviewPane />
        </div>

        {/* Settings drawer */}
        {!focusMode && <PageSettings />}
      </main>

      <footer className="no-print hidden items-center justify-between border-t border-zinc-200 px-4 py-1.5 text-[11px] text-zinc-500 md:flex dark:border-zinc-800 dark:text-zinc-400">
        <p>DocuFlow ~ created by Akash Yadav</p>
        <p className="font-mono">Ctrl+K commands · Ctrl+P print · Tab indents</p>
      </footer>

      <CommandPalette />
      <Toasts toasts={toasts} />
    </div>
  );
}
