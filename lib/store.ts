import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PageFormat = "A4" | "Letter" | "Legal";
export type Orientation = "portrait" | "landscape";
export type MarginPreset = "normal" | "narrow" | "wide" | "custom";
export type ThemeId = "modern" | "classic" | "technical" | "executive";
export type FontFamily = "sans" | "serif" | "mono";
export type ZoomLevel = 0.5 | 0.75 | 1 | "fit";
export type ExportStage = "idle" | "compiling" | "rendering" | "done";
export type WatermarkPosition = "center" | "diagonal";

export interface Toast {
  id: number;
  message: string;
  kind: "info" | "error" | "success";
}

export interface DocState {
  content: string;
  filename: string;
  presetId: string;
  pageFormat: PageFormat;
  orientation: Orientation;
  marginPreset: MarginPreset;
  customMarginIn: number;
  theme: ThemeId;
  fontFamily: FontFamily;
  fontSizePt: number;
  showHeader: boolean;
  headerText: string;
  showDate: boolean;
  showPageNumbers: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  zoom: ZoomLevel;
  darkMode: boolean;
  focusMode: boolean;
  showMarginGuides: boolean;
  settingsOpen: boolean;
  paletteOpen: boolean;
  exportStage: ExportStage;
  toasts: Toast[];

  setContent: (v: string) => void;
  setFilename: (v: string) => void;
  applyPreset: (id: string, patch: Partial<DocState>) => void;
  setPageSetup: (patch: Partial<DocState>) => void;
  setZoom: (z: ZoomLevel) => void;
  toggle: (key: "darkMode" | "focusMode" | "showMarginGuides" | "settingsOpen" | "paletteOpen" | "showHeader" | "showDate" | "showPageNumbers") => void;
  setExportStage: (s: ExportStage) => void;
  pushToast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useDocStore = create<DocState>()(
  persist(
    (set) => ({
      content: "",
      filename: `Document_${new Date().toISOString().slice(0, 10)}.pdf`,
      presetId: "executive-report",
      pageFormat: "A4",
      orientation: "portrait",
      marginPreset: "normal",
      customMarginIn: 1,
      theme: "modern",
      fontFamily: "sans",
      fontSizePt: 12,
      showHeader: true,
      headerText: "Untitled Document",
      showDate: true,
      showPageNumbers: true,
      watermarkText: "",
      watermarkOpacity: 0.08,
      watermarkPosition: "diagonal",
      zoom: "fit",
      darkMode: false,
      focusMode: false,
      showMarginGuides: false,
      settingsOpen: true,
      paletteOpen: false,
      exportStage: "idle",
      toasts: [],

      setContent: (v) => set({ content: v }),
      setFilename: (v) => set({ filename: v }),
      applyPreset: (id, patch) => set({ presetId: id, ...patch }),
      setPageSetup: (patch) => set(patch),
      setZoom: (z) => set({ zoom: z }),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<DocState>),
      setExportStage: (s) => set({ exportStage: s }),
      pushToast: (message, kind = "info") =>
        set((s) => ({ toasts: [...s.toasts.slice(-2), { id: ++toastId, message, kind }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "docuflow-v1",
      // Persist the draft + setup; never persist transient UI state.
      partialize: (s) => ({
        content: s.content,
        filename: s.filename,
        presetId: s.presetId,
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
        zoom: s.zoom,
        darkMode: s.darkMode,
        showMarginGuides: s.showMarginGuides,
        settingsOpen: s.settingsOpen,
      }),
    }
  )
);

/** Resolve margin in inches from preset. */
export function resolveMarginIn(
  preset: MarginPreset,
  customIn: number
): number {
  switch (preset) {
    case "narrow":
      return 0.5;
    case "wide":
      return 1.5;
    case "custom":
      return Math.min(2.5, Math.max(0.25, customIn || 1));
    default:
      return 1;
  }
}

/** Page dimensions in inches (w x h) before orientation. */
export function pageSizeIn(format: PageFormat): { w: number; h: number } {
  switch (format) {
    case "Letter":
      return { w: 8.5, h: 11 };
    case "Legal":
      return { w: 8.5, h: 14 };
    default:
      return { w: 8.27, h: 11.69 }; // A4
  }
}

/** Build the @page CSS injected for print fidelity. */
export function buildPageCss(
  format: PageFormat,
  orientation: Orientation,
  marginPreset: MarginPreset,
  customIn: number
): string {
  const margin = resolveMarginIn(marginPreset, customIn);
  const sizeKeyword =
    format === "A4" ? "A4" : format === "Legal" ? "legal" : "letter";
  return `@page { size: ${sizeKeyword} ${orientation}; margin: ${margin}in; }`;
}
