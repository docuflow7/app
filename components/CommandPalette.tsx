"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, Download, Sun, Moon, Type, PanelRight } from "lucide-react";
import { useDocStore } from "@/lib/store";
import { PRESETS } from "@/lib/presets";
import { downloadMarkdown, exportPdfFlow } from "@/lib/markdown";

export function CommandPalette() {
  const open = useDocStore((s) => s.paletteOpen);
  const toggle = useDocStore((s) => s.toggle);
  const applyPreset = useDocStore((s) => s.applyPreset);
  const content = useDocStore((s) => s.content);
  const filename = useDocStore((s) => s.filename);
  const setExportStage = useDocStore((s) => s.setExportStage);
  const pushToast = useDocStore((s) => s.pushToast);
  const setZoom = useDocStore((s) => s.setZoom);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open ]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle("paletteOpen");
      }
      if (e.key === "Escape" && open) toggle("paletteOpen");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, toggle]);

  const actions = useMemo(() => {
    const list = [
      { id: "export", label: "Export PDF (print dialog)", icon: <Printer size={15} />, run: () => exportPdfFlow(setExportStage, pushToast, !!content.trim()) },
      { id: "md", label: "Download Markdown", icon: <Download size={15} />, run: () => downloadMarkdown(content, filename) },
      { id: "dark", label: "Toggle dark canvas", icon: <Moon size={15} />, run: () => toggle("darkMode") },
      { id: "focus", label: "Toggle focus mode", icon: <Type size={15} />, run: () => toggle("focusMode") },
      { id: "setup", label: "Toggle page setup", icon: <PanelRight size={15} />, run: () => toggle("settingsOpen") },
      { id: "zoom-fit", label: "Zoom: Fit", icon: <Sun size={15} />, run: () => setZoom("fit") },
      ...PRESETS.map((p) => ({
        id: `preset-${p.id}`, label: `Preset: ${p.label}`, icon: <span className="font-mono text-xs">§</span>,
        run: () => { applyPreset(p.id, p.patch); pushToast(`Preset applied: ${p.label}`, "success"); },
      })),
    ];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((a) => a.label.toLowerCase().includes(needle));
  }, [q, content, filename, setExportStage, pushToast, toggle, setZoom, applyPreset]);

  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  return (
    <div className="no-print fixed inset-0 z-[90] flex items-start justify-center bg-black/40 p-4 pt-[12vh]" onClick={() => toggle("paletteOpen")}>
      <div
        role="dialog"
        aria-label="Command palette"
        className="fade-in w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(actions.length - 1, a + 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          if (e.key === "Enter") { actions[active]?.run(); toggle("paletteOpen"); }
        }}
      >
        <input
          autoFocus
          aria-label="Search commands"
          placeholder="Type a command — export, preset, zoom…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 w-full border-b border-zinc-200 bg-transparent px-4 text-sm focus:outline-none dark:border-zinc-700"
        />
        <ul className="max-h-72 overflow-auto p-1.5" role="listbox" aria-label="Commands">
          {actions.map((a, i) => (
            <li key={a.id}>
              <button
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => { a.run(); toggle("paletteOpen"); }}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${i === active ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100" : ""}`}
              >
                <span className="text-zinc-500">{a.icon}</span>
                {a.label}
              </button>
            </li>
          ))}
          {actions.length === 0 && <li className="px-3 py-4 text-sm text-zinc-500">No commands match.</li>}
        </ul>
      </div>
    </div>
  );
}
