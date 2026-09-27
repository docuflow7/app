"use client";

import { useMemo, useRef, useState } from "react";
import {
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Sparkles, Eraser,
} from "lucide-react";
import { useDocStore, type FontFamily } from "@/lib/store";
import { countWords, countChars, readingMinutes } from "@/lib/markdown";
import { SAMPLE_MARKDOWN } from "@/lib/sample";
import { Button, SectionLabel, Segmented } from "./Ui";
import { cn } from "@/lib/cn";

/** Wrap selection with before/after markers (or insert placeholder). */
function surround(textarea: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const sel = value.slice(s, e) || placeholder;
  const next = value.slice(0, s) + before + sel + after + value.slice(e);
  return { next, caret: [s + before.length, s + before.length + sel.length] as const };
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: (i: number) => string) {
  const { selectionStart: s, value } = textarea;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const lineEndIdx = value.indexOf("\n", s);
  const end = lineEndIdx === -1 ? value.length : lineEndIdx;
  const block = value.slice(lineStart, end).split("\n");
  const replaced = block.map((l, i) => (l.startsWith(prefix(i)) ? l : prefix(i) + l.replace(/^([#>\-\d.]+\s*)*/, ""))).join("\n");
  return { next: value.slice(0, lineStart) + replaced + value.slice(end), caret: null as null };
}

const FONT_SIZES = [10, 11, 12, 14, 16, 18];

export function Editor() {
  const content = useDocStore((s) => s.content);
  const setContent = useDocStore((s) => s.setContent);
  const fontFamily = useDocStore((s) => s.fontFamily);
  const fontSizePt = useDocStore((s) => s.fontSizePt);
  const setPageSetup = useDocStore((s) => s.setPageSetup);
  const pushToast = useDocStore((s) => s.pushToast);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const stats = useMemo(
    () => ({ words: countWords(content), chars: countChars(content), mins: readingMinutes(content) }),
    [content]
  );

  const apply = (fn: (ta: HTMLTextAreaElement) => { next: string; caret: readonly [number, number] | null }) => {
    const ta = taRef.current;
    if (!ta) return;
    const { next, caret } = fn(ta);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      if (caret) ta.setSelectionRange(caret[0], caret[1]);
    });
  };

  const loadFile = (f: File) => {
    if (!/\.(md|markdown|txt)$/i.test(f.name) && f.type !== "text/plain" && f.type !== "text/markdown") {
      pushToast("Only .md / .txt files are accepted.", "error");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      pushToast("File too large — 5MB limit for smooth editing.", "error");
      return;
    }
    f.text().then((t) => {
      setContent(t.slice(0, 500_000));
      pushToast(`Loaded ${f.name}`, "success");
    }).catch(() => pushToast("Could not read that file.", "error"));
  };

  return (
    <section aria-label="Document editor" className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="no-print flex flex-wrap items-center gap-1.5 border-b border-zinc-200 p-2 dark:border-zinc-800">
        <Segmented<FontFamily>
          ariaLabel="Editor font family"
          value={fontFamily}
          onChange={(v) => setPageSetup({ fontFamily: v })}
          options={[
            { value: "sans", label: "Sans", title: "Sans-serif (Inter)" },
            { value: "serif", label: "Serif", title: "Serif (Merriweather)" },
            { value: "mono", label: "Mono", title: "Monospace (Roboto Mono)" },
          ]}
        />
        <label className="flex items-center gap-1 text-xs">
          <span className="sr-only">Font size</span>
          <select
            aria-label="Font size in points"
            value={fontSizePt}
            onChange={(e) => setPageSetup({ fontSizePt: Number(e.target.value) })}
            className="h-7 rounded-md border border-zinc-300 bg-white px-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            {FONT_SIZES.map((n) => <option key={n} value={n}>{n}pt</option>)}
          </select>
        </label>
        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
        {[
          { icon: <Bold size={15} />, label: "Bold (wrap **)", fn: (ta: HTMLTextAreaElement) => surround(ta, "**", "**", "bold text") },
          { icon: <Italic size={15} />, label: "Italic (wrap *)", fn: (ta: HTMLTextAreaElement) => surround(ta, "*", "*", "italic text") },
          { icon: <Heading1 size={15} />, label: "Heading 1", fn: (ta: HTMLTextAreaElement) => prefixLines(ta, () => "# ") },
          { icon: <Heading2 size={15} />, label: "Heading 2", fn: (ta: HTMLTextAreaElement) => prefixLines(ta, () => "## ") },
          { icon: <Heading3 size={15} />, label: "Heading 3", fn: (ta: HTMLTextAreaElement) => prefixLines(ta, () => "### ") },
          { icon: <List size={15} />, label: "Bullet list", fn: (ta: HTMLTextAreaElement) => prefixLines(ta, () => "- ") },
          { icon: <ListOrdered size={15} />, label: "Numbered list", fn: (ta: HTMLTextAreaElement) => prefixLines(ta, (i) => `${i + 1}. `) },
        ].map((b, i) => (
          <button
            key={i}
            aria-label={b.label}
            title={b.label}
            onClick={() => apply(b.fn)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {b.icon}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" ariaLabel="Load sample document" onClick={() => { setContent(SAMPLE_MARKDOWN); pushToast("Sample loaded.", "success"); }}>
          <Sparkles size={14} /> Sample
        </Button>
        <Button variant="ghost" size="sm" ariaLabel="Clear all text" onClick={() => { setContent(""); pushToast("Editor cleared."); }}>
          <Eraser size={14} /> Clear
        </Button>
      </div>

      {/* Textarea — plain in-flow element so it always fills available height
          and shows every pasted line with native scrolling. */}
      <div
        className={cn("relative flex min-h-[280px] min-w-0 flex-1 flex-col", dragOver && "outline-2 outline-dashed outline-indigo-500")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
      >
        {content === "" && (
          <div className="pointer-events-none absolute inset-x-0 top-0 p-8 text-center">
            <p className="text-sm font-semibold">Start writing or paste Markdown</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">Drag & drop a .md/.txt file, or press Sample to see a full executive report. Everything stays in your browser.</p>
          </div>
        )}
        <textarea
          ref={taRef}
          aria-label="Markdown source editor. Supports headings, bold, lists, tables."
          value={content}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length > 500_000) {
              pushToast("50,000+ word scale reached — input capped at 500k chars for smooth typing.", "error");
              return setContent(v.slice(0, 500_000));
            }
            setContent(v);
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); useDocStore.getState().toggle("paletteOpen"); }
            if (e.key === "Tab") {
              e.preventDefault();
              const ta = e.currentTarget;
              const { selectionStart: s, selectionEnd: en, value } = ta;
              setContent(value.slice(0, s) + "  " + value.slice(en));
              requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
            }
          }}
          spellCheck
          wrap="soft"
          className={cn(
            "min-h-[280px] w-full flex-1 resize-none bg-white p-4 text-[13px] leading-6 text-zinc-900 caret-indigo-600 focus:outline-none dark:bg-zinc-950 dark:text-zinc-100",
            fontFamily === "serif" ? "font-serif" : fontFamily === "mono" ? "font-mono" : "font-sans"
          )}
          style={{ tabSize: 4, whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
        />
        {dragOver && (
          <div className="absolute inset-2 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-500 bg-indigo-50/80 text-sm font-medium text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200">
            Drop .md / .txt to load
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="no-print flex items-center gap-3 border-t border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <SectionLabel><span>{stats.words.toLocaleString()} words</span></SectionLabel>
        <span>{stats.chars.toLocaleString()} chars</span>
        <span>~{stats.mins} min read</span>
        <div className="flex-1" />
        <label className="cursor-pointer rounded px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <input type="file" accept=".md,.markdown,.txt" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
          <span className="underline underline-offset-2">Import file</span>
        </label>
      </div>
    </section>
  );
}
