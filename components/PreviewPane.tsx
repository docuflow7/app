"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import {
  useDocStore, pageSizeIn, resolveMarginIn,
  type ZoomLevel,
} from "@/lib/store";
import { cn } from "@/lib/cn";
import { Button, Segmented } from "./Ui";

function looksLikeMarkdown(src: string): boolean {
  return /(^#{1,4}\s|^\s*[-*+]\s|^\s*\d+\.\s|^\s*>\s|\*\*|__|`|\|.*\||\[.+\]\(.+\)|^-{3,})/m.test(src);
}

export function PreviewPane() {
  const content = useDocStore((s) => s.content);
  const pageFormat = useDocStore((s) => s.pageFormat);
  const orientation = useDocStore((s) => s.orientation);
  const marginPreset = useDocStore((s) => s.marginPreset);
  const customMarginIn = useDocStore((s) => s.customMarginIn);
  const theme = useDocStore((s) => s.theme);
  const fontFamily = useDocStore((s) => s.fontFamily);
  const fontSizePt = useDocStore((s) => s.fontSizePt);
  const showHeader = useDocStore((s) => s.showHeader);
  const headerText = useDocStore((s) => s.headerText);
  const showDate = useDocStore((s) => s.showDate);
  const showPageNumbers = useDocStore((s) => s.showPageNumbers);
  const watermarkText = useDocStore((s) => s.watermarkText);
  const watermarkOpacity = useDocStore((s) => s.watermarkOpacity);
  const watermarkPosition = useDocStore((s) => s.watermarkPosition);
  const zoom = useDocStore((s) => s.zoom);
  const setZoom = useDocStore((s) => s.setZoom);
  const showMarginGuides = useDocStore((s) => s.showMarginGuides);

  // Debounce heavy render: instant typing in Editor, deferred paint here.
  const deferred = useDeferredValue(content);
  const [rendered, setRendered] = useState(deferred);
  useEffect(() => {
    const t = setTimeout(() => setRendered(deferred), 300);
    return () => clearTimeout(t);
  }, [deferred]);

  const isMd = useMemo(() => looksLikeMarkdown(rendered), [rendered]);
  const dateStr = useMemo(() => new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }), []);

  // Paper geometry (96 CSS px per inch)
  const dims = pageSizeIn(pageFormat);
  const W = orientation === "landscape" ? dims.h : dims.w;
  const H = orientation === "landscape" ? dims.w : dims.h;
  const marginIn = resolveMarginIn(marginPreset, customMarginIn);
  const PX = 96;
  const pagePxW = W * PX;
  const pagePxH = H * PX;

  const paperRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const compute = () => {
      const contentH = el.scrollHeight;
      const usable = pagePxH - marginIn * 2 * PX;
      setPages(Math.max(1, Math.ceil(contentH / Math.max(1, usable))));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rendered, pagePxH, marginIn, fontSizePt, fontFamily, theme, pageFormat, orientation]);

  const zoomScale: number | null = zoom === "fit" ? null : zoom;

  return (
    <section aria-label="Live PDF preview" className="flex min-h-0 flex-1 flex-col">
      {/* Preview toolbar */}
      <div className="no-print flex items-center gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
        <Segmented
          ariaLabel="Preview zoom"
          value={zoom}
          onChange={(v) => setZoom(v)}
          options={[
            { value: 0.5, label: "50%" },
            { value: 0.75, label: "75%" },
            { value: 1, label: "100%" },
            { value: "fit", label: "Fit" },
          ]}
        />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" ariaLabel="Zoom out" title="Zoom out"
            onClick={() => setZoom(zoom === 1 ? 0.75 : zoom === 0.75 ? 0.5 : 0.5)}>
            <ZoomOut size={15} />
          </Button>
          <Button variant="ghost" size="icon" ariaLabel="Zoom in" title="Zoom in"
            onClick={() => setZoom(zoom === 0.5 ? 0.75 : zoom === 0.75 ? 1 : 1)}>
            <ZoomIn size={15} />
          </Button>
          <Button variant="ghost" size="icon" ariaLabel="Fit to width" title="Fit to width" onClick={() => setZoom("fit")}>
            <Maximize size={15} />
          </Button>
        </div>
        <div className="flex-1" />
        <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400" aria-live="polite">
          {pageFormat} · {orientation} · Page 1 of {pages}
        </p>
      </div>

      {/* Canvas */}
      <div className="print-canvas min-h-0 flex-1 overflow-auto bg-zinc-100 p-4 sm:p-6 dark:bg-zinc-950">
        <div
          className="paper-wrap mx-auto"
          style={
            zoomScale
              ? { width: pagePxW * zoomScale, transform: `scale(1)`, maxWidth: "none" }
              : { width: "100%", maxWidth: pagePxW }
          }
        >
          <div
            ref={paperRef}
            className={cn("paper theme-" + theme, "rounded-[2px]")}
            style={{
              padding: `${marginIn}in`,
              fontSize: `${fontSizePt}pt`,
              fontFamily:
                fontFamily === "serif"
                  ? "var(--font-merriweather, Georgia, serif)"
                  : fontFamily === "mono"
                  ? "var(--font-roboto-mono, ui-monospace, monospace)"
                  : "var(--font-inter, ui-sans-serif, system-ui, sans-serif)",
              ["--guide-inset" as string]: `${marginIn}in`,
              minHeight: zoomScale ? pagePxH * zoomScale : undefined,
            }}
          >
            {showMarginGuides && <div className="margin-guide" aria-hidden="true" />}

            {watermarkText.trim() && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
              >
                <span
                  className="select-none font-bold uppercase tracking-widest text-zinc-900"
                  style={{
                    opacity: watermarkOpacity,
                    fontSize: "3rem",
                    transform: watermarkPosition === "diagonal" ? "rotate(-32deg)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {watermarkText}
                </span>
              </div>
            )}

            {(showHeader || showDate) && (
              <div className="mb-4 flex items-baseline justify-between border-b border-zinc-200 pb-2 text-[0.85em] text-zinc-500">
                <span className="font-semibold tracking-wide">{showHeader ? headerText || "Untitled Document" : ""}</span>
                {showDate && <span>{dateStr}</span>}
              </div>
            )}

            {rendered.trim() === "" ? (
              <div className="py-16 text-center text-zinc-400">
                <p className="text-lg font-semibold">Nothing to preview yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm">Type on the left — headings, tables, checklists and code render here exactly as they will print.</p>
              </div>
            ) : isMd ? (
              <div className="doc">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {rendered}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="doc"><div className="doc-plain">{rendered}</div></div>
            )}

            {showPageNumbers && (
              <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-2 text-[0.8em] text-zinc-500">
                <span>{headerText || "DocuFlow"}</span>
                <span>Page 1 of {pages}</span>
              </div>
            )}
          </div>

          {/* Page-break markers (visual estimate) */}
          {pages > 1 && (
            <div className="no-print mt-2 flex flex-col gap-2">
              {Array.from({ length: pages - 1 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
                  <span className="font-mono">— page {i + 2} —</span>
                  <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
