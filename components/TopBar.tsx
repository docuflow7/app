"use client";

import { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  Loader2,
  Moon,
  Sun,
  PanelRight,
  Command,
  Type,
} from "lucide-react";
import { useDocStore } from "@/lib/store";
import { PRESETS } from "@/lib/presets";
import { downloadMarkdown, exportPdfFlow } from "@/lib/markdown";
import { exportPdfDownload } from "@/lib/exportPdf";
import { Button } from "./Ui";

export function TopBar() {
  const presetId = useDocStore((s) => s.presetId);
  const applyPreset = useDocStore((s) => s.applyPreset);
  const filename = useDocStore((s) => s.filename);
  const setFilename = useDocStore((s) => s.setFilename);
  const content = useDocStore((s) => s.content);
  const darkMode = useDocStore((s) => s.darkMode);
  const focusMode = useDocStore((s) => s.focusMode);
  const toggle = useDocStore((s) => s.toggle);
  const exportStage = useDocStore((s) => s.exportStage);
  const setExportStage = useDocStore((s) => s.setExportStage);
  const pushToast = useDocStore((s) => s.pushToast);
  const [editingName, setEditingName] = useState(false);

  const busy = exportStage !== "idle";

  return (
    <header className="no-print sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-200 bg-white/85 px-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85 sm:gap-3 sm:px-4">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
          <FileText size={18} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">DocuFlow</p>
          <p className="hidden text-[11px] text-zinc-500 sm:block">Text → PDF Studio</p>
        </div>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-zinc-200 md:block dark:bg-zinc-800" />

      {/* Preset selector */}
      <label className="hidden items-center gap-2 md:flex">
        <span className="sr-only">Document preset</span>
        <select
          aria-label="Document preset"
          value={presetId}
          onChange={(e) => {
            const p = PRESETS.find((x) => x.id === e.target.value);
            if (p) {
              applyPreset(p.id, p.patch);
              pushToast(`Preset applied: ${p.label}`, "success");
            }
          }}
          className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id} title={p.description}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {/* Filename */}
      <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
        {editingName ? (
          <input
            autoFocus
            aria-label="PDF file name"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            className="h-8 w-64 rounded-md border border-indigo-400 px-2 text-center text-sm focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Click to rename"
            className="truncate rounded px-2 py-1 font-mono text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {filename || "Document.pdf"}
          </button>
        )}
      </div>

      <div className="flex-1 lg:hidden" />

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        ariaLabel="Toggle command palette (Ctrl+K)"
        title="Commands (Ctrl+K)"
        onClick={() => toggle("paletteOpen")}
      >
        <Command size={17} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        ariaLabel={focusMode ? "Exit focus mode" : "Enter focus mode"}
        title="Focus mode"
        onClick={() => toggle("focusMode")}
      >
        <Type size={17} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        ariaLabel={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title="Dark canvas"
        onClick={() => toggle("darkMode")}
      >
        {darkMode ? <Sun size={17} /> : <Moon size={17} />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        ariaLabel="Toggle page setup panel"
        title="Page setup"
        onClick={() => toggle("settingsOpen")}
      >
        <PanelRight size={17} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        ariaLabel="Download Markdown source"
        title="Download .md source"
        onClick={() => {
          if (!content.trim()) return pushToast("Nothing to download yet.", "error");
          downloadMarkdown(content, filename);
          pushToast("Markdown downloaded.", "success");
        }}
      >
        <Download size={15} />
        <span className="hidden xl:inline">.md</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        ariaLabel="Print exact preview layout (browser print dialog)"
        title="Print exact layout"
        onClick={() => exportPdfFlow(setExportStage, pushToast, !!content.trim())}
      >
        <Printer size={17} />
      </Button>
      <Button
        variant="primary"
        size="sm"
        disabled={busy}
        ariaLabel="Download PDF file instantly"
        title="Download vector PDF instantly"
        onClick={() => exportPdfDownload(setExportStage, pushToast)}
        className="min-w-[118px]"
      >
        {busy ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {exportStage === "compiling" ? "Compiling…" : exportStage === "rendering" ? "Rendering…" : "Saving…"}
          </>
        ) : (
          <>
            <Download size={15} />
            Export PDF
          </>
        )}
      </Button>
    </header>
  );
}
