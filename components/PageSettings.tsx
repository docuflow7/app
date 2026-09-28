"use client";

import { useDocStore, type PageFormat, type Orientation, type MarginPreset, type ThemeId, type WatermarkPosition } from "@/lib/store";
import { SectionLabel, Segmented, Switch } from "./Ui";
import { cn } from "@/lib/cn";

const THEMES: { id: ThemeId; label: string; glyph: string; style: React.CSSProperties }[] = [
  { id: "modern", label: "Modern", glyph: "Aa", style: { fontFamily: "var(--font-inter, sans-serif)" } },
  { id: "classic", label: "Classic Serif", glyph: "Ag", style: { fontFamily: "var(--font-merriweather, Georgia, serif)" } },
  { id: "technical", label: "Technical Mono", glyph: "</>", style: { fontFamily: "var(--font-roboto-mono, monospace)" } },
  { id: "executive", label: "Executive Dark", glyph: "§", style: { fontFamily: "var(--font-inter, sans-serif)", background: "#0f172a", color: "#f59e0b" } },
];

export function PageSettings() {
  const s = useDocStore();

  if (!s.settingsOpen) return null;

  return (
    <aside
      aria-label="Page setup"
      role="dialog"
      className="no-print flex w-full flex-col gap-4 overflow-y-auto border-l border-zinc-200 bg-white p-4 text-sm lg:w-72 lg:shrink-0 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <SectionLabel>Page format</SectionLabel>
        <div className="mt-1.5">
          <Segmented<PageFormat>
            ariaLabel="Page format"
            value={s.pageFormat}
            onChange={(v) => s.setPageSetup({ pageFormat: v })}
            options={[
              { value: "A4", label: "A4" },
              { value: "Letter", label: "Letter" },
              { value: "Legal", label: "Legal" },
            ]}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Orientation</SectionLabel>
        <div className="mt-1.5">
          <Segmented<Orientation>
            ariaLabel="Orientation"
            value={s.orientation}
            onChange={(v) => s.setPageSetup({ orientation: v })}
            options={[
              { value: "portrait", label: "Portrait" },
              { value: "landscape", label: "Landscape" },
            ]}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Margins</SectionLabel>
        <div className="mt-1.5">
          <Segmented<MarginPreset>
            ariaLabel="Margins"
            value={s.marginPreset}
            onChange={(v) => s.setPageSetup({ marginPreset: v })}
            options={[
              { value: "narrow", label: "Narrow", title: "0.5 in" },
              { value: "normal", label: "Normal", title: "1 in" },
              { value: "wide", label: "Wide", title: "1.5 in" },
              { value: "custom", label: "Custom" },
            ]}
          />
        </div>
        {s.marginPreset === "custom" && (
          <label className="mt-2 flex items-center gap-2 text-xs">
            <input
              type="range" min={0.25} max={2.5} step={0.25}
              aria-label="Custom margin in inches"
              value={s.customMarginIn}
              onChange={(e) => s.setPageSetup({ customMarginIn: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <span className="w-12 font-mono">{s.customMarginIn.toFixed(2)}″</span>
          </label>
        )}
        <label className="mt-2 flex cursor-pointer items-center justify-between text-xs">
          <span>Margin guides</span>
          <Switch checked={s.showMarginGuides} onChange={() => s.toggle("showMarginGuides")} ariaLabel="Toggle margin guides" />
        </label>
      </div>

      <div>
        <SectionLabel>Theme & palette</SectionLabel>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              aria-pressed={s.theme === t.id}
              onClick={() => s.setPageSetup({ theme: t.id })}
              className={cn(
                "rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                s.theme === t.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700"
              )}
            >
              <span className="flex h-10 items-center justify-center rounded bg-zinc-50 text-xl font-bold dark:bg-zinc-900" style={t.style}>
                {t.glyph}
              </span>
              <span className="mt-1 block text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Header & footer</SectionLabel>
        <label className="flex items-center justify-between text-xs">
          <span>Header</span>
          <Switch checked={s.showHeader} onChange={() => s.toggle("showHeader")} ariaLabel="Toggle header" />
        </label>
        {s.showHeader && (
          <input
            aria-label="Custom header text"
            value={s.headerText}
            onChange={(e) => s.setPageSetup({ headerText: e.target.value })}
            placeholder="Document title"
            className="h-8 rounded-md border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        )}
        <label className="flex items-center justify-between text-xs">
          <span>Date in header</span>
          <Switch checked={s.showDate} onChange={() => s.toggle("showDate")} ariaLabel="Toggle date in header" />
        </label>
        <label className="flex items-center justify-between text-xs">
          <span>Page numbers (Page X of Y)</span>
          <Switch checked={s.showPageNumbers} onChange={() => s.toggle("showPageNumbers")} ariaLabel="Toggle page numbers" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Watermark</SectionLabel>
        <input
          aria-label="Watermark text"
          value={s.watermarkText}
          onChange={(e) => s.setPageSetup({ watermarkText: e.target.value })}
          placeholder="e.g. CONFIDENTIAL"
          className="h-8 rounded-md border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="range" min={0.03} max={0.3} step={0.01}
            aria-label="Watermark opacity"
            value={s.watermarkOpacity}
            onChange={(e) => s.setPageSetup({ watermarkOpacity: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
          <span className="w-10 font-mono">{Math.round(s.watermarkOpacity * 100)}%</span>
        </label>
        <Segmented<WatermarkPosition>
          ariaLabel="Watermark position"
          value={s.watermarkPosition}
          onChange={(v) => s.setPageSetup({ watermarkPosition: v })}
          options={[
            { value: "diagonal", label: "Diagonal" },
            { value: "center", label: "Center" },
          ]}
        />
      </div>

      <p className="rounded-md bg-zinc-50 p-2 text-[11px] leading-relaxed text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        Export PDF downloads a selectable vector file instantly. Use the printer icon for an exact browser-layout print instead.
      </p>
    </aside>
  );
}
