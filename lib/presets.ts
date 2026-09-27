import type { DocState } from "./store";

export interface Preset {
  id: string;
  label: string;
  description: string;
  patch: Partial<DocState>;
}

export const PRESETS: Preset[] = [
  {
    id: "executive-report",
    label: "Executive Report",
    description: "Modern sans, A4, normal margins",
    patch: {
      pageFormat: "A4",
      orientation: "portrait",
      marginPreset: "normal",
      theme: "modern",
      fontFamily: "sans",
      fontSizePt: 12,
      showHeader: true,
      showDate: true,
      showPageNumbers: true,
    },
  },
  {
    id: "academic-essay",
    label: "Academic Essay",
    description: "Classic serif, Letter, wide margins",
    patch: {
      pageFormat: "Letter",
      orientation: "portrait",
      marginPreset: "wide",
      theme: "classic",
      fontFamily: "serif",
      fontSizePt: 12,
      showHeader: true,
      showDate: false,
      showPageNumbers: true,
    },
  },
  {
    id: "minimalist-letter",
    label: "Minimalist Letter",
    description: "Clean sans, Letter, narrow header",
    patch: {
      pageFormat: "Letter",
      orientation: "portrait",
      marginPreset: "normal",
      theme: "modern",
      fontFamily: "sans",
      fontSizePt: 12,
      showHeader: true,
      showDate: true,
      showPageNumbers: false,
    },
  },
  {
    id: "invoice",
    label: "Invoice",
    description: "Technical mono accents, A4",
    patch: {
      pageFormat: "A4",
      orientation: "portrait",
      marginPreset: "narrow",
      theme: "technical",
      fontFamily: "mono",
      fontSizePt: 12,
      showHeader: true,
      showDate: true,
      showPageNumbers: true,
    },
  },
];
