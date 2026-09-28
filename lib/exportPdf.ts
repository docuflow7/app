/**
 * One-click PDF download flow.
 *
 * Dynamically imports the pdf engine (keeps it out of the initial bundle),
 * renders a true vector PDF, and saves it via an anchor download —
 * no print dialog involved.
 */
import { useDocStore, type ExportStage } from "./store";
import { stripExtension } from "./markdown";
import type { PdfSetup } from "@/components/DocuPdf";

export function pdfFilename(raw: string): string {
  const base = stripExtension(raw.trim() || "Document") || "Document";
  return base.endsWith(".pdf") ? base : `${base}.pdf`;
}

export async function exportPdfDownload(
  setStage: (s: ExportStage) => void,
  onToast: (msg: string, kind?: "info" | "error" | "success") => void
) {
  const s = useDocStore.getState();
  if (!s.content.trim()) {
    onToast("Nothing to export — paste or load sample text first.", "error");
    return;
  }
  const filename = pdfFilename(s.filename);
  try {
    setStage("compiling");
    const { generatePdfBlob } = await import("@/components/DocuPdf");
    const setup: PdfSetup = {
      content: s.content,
      pageFormat: s.pageFormat,
      orientation: s.orientation,
      marginPreset: s.marginPreset,
      customMarginIn: s.customMarginIn,
      theme: s.theme,
      fontFamily: s.fontFamily,
      fontSizePt: s.fontSizePt,
      showHeader: s.showHeader,
      headerText: s.headerText,
      showDate: s.showDate,
      showPageNumbers: s.showPageNumbers,
      watermarkText: s.watermarkText,
      watermarkOpacity: s.watermarkOpacity,
      watermarkPosition: s.watermarkPosition,
      dateStr: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
    setStage("rendering");
    const blob = await generatePdfBlob(setup);
    setStage("done");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    onToast(`Downloaded ${filename} — selectable vector PDF.`, "success");
  } catch {
    onToast("PDF download failed. Try Print (exact layout) instead.", "error");
  } finally {
    setTimeout(() => setStage("idle"), 1600);
  }
}
