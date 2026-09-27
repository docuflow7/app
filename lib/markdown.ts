/** Text statistics + export helpers. Pure functions, no DOM except download. */

export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function countChars(text: string): number {
  return text.length;
}

export function readingMinutes(text: string): number {
  const w = countWords(text);
  return Math.max(1, Math.ceil(w / 200));
}

export function stripExtension(name: string): string {
  return name.replace(/\.(pdf|md|txt)$/i, "");
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadMarkdown(content: string, pdfFilename: string) {
  const base = stripExtension(pdfFilename.trim() || "Document") || "Document";
  downloadBlob(content || "", `${base}.md`, "text/markdown;charset=utf-8");
}

/**
 * Staged print-to-PDF flow. Keeps button honest about what happens:
 * compile (debounced render flush) -> rendering (layout paint) -> native dialog.
 */
export async function exportPdfFlow(
  setStage: (s: "compiling" | "rendering" | "done" | "idle") => void,
  onToast: (msg: string, kind?: "info" | "error" | "success") => void,
  hasContent: boolean
) {
  if (!hasContent) {
    onToast("Nothing to export — paste or load sample text first.", "error");
    return;
  }
  try {
    setStage("compiling");
    await new Promise((r) => setTimeout(r, 250));
    setStage("rendering");
    await new Promise((r) => setTimeout(r, 350));
    setStage("done");
    // Let the painted state flush before opening the dialog.
    await new Promise((r) => setTimeout(r, 120));
    window.print();
    onToast("Print dialog opened — choose “Save as PDF”.", "success");
  } catch {
    onToast("PDF export failed. Try again or use Print (Ctrl/Cmd+P).", "error");
  } finally {
    setTimeout(() => setStage("idle"), 1600);
  }
}
