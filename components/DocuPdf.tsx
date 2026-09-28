/**
 * Client-side vector PDF engine.
 *
 * Parses Markdown (GFM) into an mdast tree with remark, then renders it with
 * @react-pdf/renderer into a true vector PDF: selectable, searchable text —
 * downloaded directly as a Blob, no print dialog involved.
 *
 * This module is ALWAYS dynamically imported (see lib/exportPdf.ts) so the
 * ~500KB pdf engine never touches the initial page load.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import type {
  PageFormat,
  Orientation,
  MarginPreset,
  ThemeId,
  FontFamily,
  WatermarkPosition,
} from "@/lib/store";
import { resolveMarginIn } from "@/lib/store";

export interface PdfSetup {
  content: string;
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
  dateStr: string;
}

/* Disable hyphenation globally (avoids odd mid-word breaks in technical
   text). v3 API: registered on Font, not passed to <Document/>. */
Font.registerHyphenationCallback((word: string) => [word]);

/* Loose mdast node — runtime-checked, avoids wrestling GFM union types. */
interface N {
  type: string;
  value?: string;
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  ordered?: boolean;
  start?: number | null;
  lang?: string | null;
  url?: string;
  title?: string | null;
  alt?: string;
  align?: Array<"left" | "center" | "right" | null>;
  checked?: boolean | null;
  children?: N[];
}

type BaseFont = "Helvetica" | "Times-Roman" | "Courier";

interface Palette {
  base: BaseFont;
  ink: string;
  muted: string;
  accent: string;
  paper: string;
  codeBg: string;
  codeInk: string;
  quoteBg: string;
  tableHeadBg: string;
  border: string;
}

function paletteFor(theme: ThemeId, fontFamily: FontFamily): Palette {
  const base: BaseFont =
    fontFamily === "serif" ? "Times-Roman" : fontFamily === "mono" ? "Courier" : "Helvetica";
  switch (theme) {
    case "classic":
      return { base, ink: "#1c1917", muted: "#78716c", accent: "#92400e", paper: "#fffdf7", codeBg: "#1c1917", codeInk: "#e7e5e4", quoteBg: "#fef3c7", tableHeadBg: "#f5f0e8", border: "#d6d3d1" };
    case "technical":
      return { base, ink: "#111827", muted: "#6b7280", accent: "#047857", paper: "#ffffff", codeBg: "#111827", codeInk: "#d1fae5", quoteBg: "#ecfdf5", tableHeadBg: "#f3f4f6", border: "#d1d5db" };
    case "executive":
      return { base, ink: "#e2e8f0", muted: "#94a3b8", accent: "#f59e0b", paper: "#0f172a", codeBg: "#020617", codeInk: "#fde68a", quoteBg: "#1e293b", tableHeadBg: "#1e293b", border: "#334155" };
    default:
      return { base, ink: "#18181b", muted: "#71717a", accent: "#4f46e5", paper: "#ffffff", codeBg: "#18181b", codeInk: "#e4e4e7", quoteBg: "#eef2ff", tableHeadBg: "#f4f4f5", border: "#d4d4d8" };
  }
}

/** Resolve a built-in PDF font covering bold/italic combos (no downloads). */
function fam(base: BaseFont, bold: boolean, italic: boolean): string {
  if (base === "Times-Roman")
    return bold ? (italic ? "Times-BoldItalic" : "Times-Bold") : italic ? "Times-Italic" : "Times-Roman";
  if (base === "Courier")
    return bold ? (italic ? "Courier-BoldOblique" : "Courier-Bold") : italic ? "Courier-Oblique" : "Courier";
  return bold ? (italic ? "Helvetica-BoldOblique" : "Helvetica-Bold") : italic ? "Helvetica-Oblique" : "Helvetica";
}

interface Ctx {
  pal: Palette;
  baseSize: number;
}

function renderInline(node: N, ctx: Ctx, key: string): React.ReactNode {
  const { pal, baseSize } = ctx;
  const kids = (node.children ?? []).map((c, i) => renderInline(c, ctx, `${key}.${i}`));
  switch (node.type) {
    case "text":
      return node.value ?? "";
    case "emphasis":
      return <Text key={key} style={{ fontFamily: fam(pal.base, false, true) }}>{kids}</Text>;
    case "strong":
      return <Text key={key} style={{ fontFamily: fam(pal.base, true, false) }}>{kids}</Text>;
    case "delete":
      return <Text key={key} style={{ textDecoration: "line-through" }}>{kids}</Text>;
    case "inlineCode":
      return (
        <Text key={key} style={{ fontFamily: "Courier", fontSize: baseSize * 0.88, backgroundColor: pal.quoteBg }}>
          {node.value ?? ""}
        </Text>
      );
    case "link":
      return (
        <Text key={key} style={{ color: pal.accent, textDecoration: "underline" }}>
          {kids.length ? kids : node.url ?? ""}
        </Text>
      );
    case "break":
      return "\n";
    case "image":
      return `[${node.alt || "image"}]`;
    case "html":
      return null;
    default:
      return kids.length ? <Text key={key}>{kids}</Text> : null;
  }
}

function headingSize(depth: number | undefined, base: number): number {
  switch (depth) {
    case 1:
      return base + 8;
    case 2:
      return base + 4;
    case 3:
      return base + 2;
    default:
      return base + 1;
  }
}

function renderBlocks(nodes: N[], ctx: Ctx, keyPrefix: string): React.ReactElement[] {
  const { pal, baseSize } = ctx;
  return nodes.flatMap((node, i) => {
    const key = `${keyPrefix}.${i}`;
    const kids = (node.children ?? []).map((c, j) => renderInline(c, ctx, `${key}.${j}`));
    switch (node.type) {
      case "heading":
        return [
          <Text
            key={key}
            style={{
              fontFamily: fam(pal.base, true, false),
              fontSize: headingSize(node.depth, baseSize),
              marginTop: baseSize * 0.9,
              marginBottom: baseSize * 0.4,
              ...(node.depth === 1
                ? { borderBottomWidth: 1.5, borderBottomColor: pal.accent, paddingBottom: 3 }
                : {}),
            }}
          >
            {kids}
          </Text>,
        ];
      case "paragraph":
        return [
          <Text key={key} style={{ marginBottom: baseSize * 0.5, lineHeight: 1.55 }}>
            {kids}
          </Text>,
        ];
      case "list": {
        const start = node.start ?? 1;
        return [
          <View key={key} style={{ marginBottom: baseSize * 0.5 }}>
            {(node.children ?? []).map((item, li) => {
              const marker = node.ordered ? `${start + li}.` : "•";
              const itemKids = item.children ?? [];
              // Tight lists wrap text in a single paragraph — render inline.
              const allPara = itemKids.length > 0 && itemKids.every((c) => c.type === "paragraph");
              return (
                <View key={`${key}.li${li}`} style={{ flexDirection: "row", marginBottom: 2 }}>
                  <Text style={{ width: node.ordered ? 20 : 14, flexShrink: 0 }}>{marker}</Text>
                  <View style={{ flex: 1 }}>
                    {allPara
                      ? itemKids.map((p, pi) => (
                          <Text key={`${key}.li${li}.${pi}`} style={{ lineHeight: 1.55 }}>
                            {(p.children ?? []).map((c, ci) => renderInline(c, ctx, `${key}.li${li}.${pi}.${ci}`))}
                          </Text>
                        ))
                      : renderBlocks(itemKids, ctx, `${key}.li${li}`)}
                  </View>
                </View>
              );
            })}
          </View>,
        ];
      }
      case "blockquote":
        return [
          <View
            key={key}
            style={{
              borderLeftWidth: 3,
              borderLeftColor: pal.accent,
              backgroundColor: pal.quoteBg,
              paddingLeft: 8,
              paddingRight: 6,
              paddingVertical: 4,
              marginVertical: 6,
            }}
          >
            {renderBlocks(node.children ?? [], ctx, key)}
          </View>,
        ];
      case "code":
        return [
          <View key={key} wrap={false} style={{ backgroundColor: pal.codeBg, borderRadius: 5, padding: 8, marginVertical: 6 }}>
            <Text style={{ fontFamily: "Courier", fontSize: Math.max(7.5, baseSize * 0.78), color: pal.codeInk, lineHeight: 1.45 }}>
              {node.value ?? ""}
            </Text>
          </View>,
        ];
      case "table": {
        const rows = node.children ?? [];
        const aligns = node.align ?? [];
        const cell = (c: N, ci: number, isHead: boolean, ri: number) => (
          <View
            key={`${key}.r${ri}.c${ci}`}
            style={{
              flex: 1,
              padding: 4,
              backgroundColor: isHead ? pal.tableHeadBg : "transparent",
              borderRightWidth: ci < (rows[0]?.children?.length ?? 1) - 1 ? 0.5 : 0,
              borderRightColor: pal.border,
            }}
          >
            <Text
              style={{
                fontSize: baseSize * 0.92,
                fontFamily: isHead ? fam(pal.base, true, false) : pal.base,
                textAlign: aligns[ci] ?? "left",
              }}
            >
              {(c.children ?? []).map((ic, ii) =>
                ic.type === "paragraph"
                  ? (ic.children ?? []).map((x, xi) => renderInline(x, ctx, `${key}.r${ri}.c${ci}.${ii}.${xi}`))
                  : renderInline(ic, ctx, `${key}.r${ri}.c${ci}.${ii}`)
              )}
            </Text>
          </View>
        );
        return [
          <View
            key={key}
            style={{ marginVertical: 6, borderWidth: 0.75, borderColor: pal.border, borderRadius: 3 }}
          >
            {rows.map((row, ri) => (
              <View
                key={`${key}.r${ri}`}
                wrap={false}
                style={{
                  flexDirection: "row",
                  borderTopWidth: ri === 0 ? 0 : 0.5,
                  borderTopColor: pal.border,
                }}
              >
                {(row.children ?? []).map((c, ci) => cell(c, ci, ri === 0, ri))}
              </View>
            ))}
          </View>,
        ];
      }
      case "thematicBreak":
        return [<View key={key} style={{ borderBottomWidth: 0.75, borderBottomColor: pal.border, marginVertical: 10 }} />];
      case "html":
      case "image":
      case "definition":
      case "footnoteDefinition":
        return [];
      case "text":
        return [<Text key={key}>{node.value}</Text>];
      default: {
        const nested = node.children ?? [];
        return nested.length ? renderBlocks(nested, ctx, key) : [];
      }
    }
  });
}

function looksLikeMarkdown(src: string): boolean {
  return /(^#{1,4}\s|^\s*[-*+]\s|^\s*\d+\.\s|^\s*>\s|\*\*|__|`|\|.*\||\[.+\]\(.+\)|^-{3,})/m.test(src);
}

export function DocuPdfDocument({ setup }: { setup: PdfSetup }) {
  const pal = paletteFor(setup.theme, setup.fontFamily);
  const ctx: Ctx = { pal, baseSize: setup.fontSizePt };
  const marginPt = resolveMarginIn(setup.marginPreset, setup.customMarginIn) * 72;
  const size =
    setup.pageFormat === "A4" ? "A4" : setup.pageFormat === "Legal" ? "LEGAL" : "LETTER";

  const tree = (
    looksLikeMarkdown(setup.content)
      ? remark().use(remarkGfm).parse(setup.content)
      : { type: "root", children: [{ type: "paragraph", children: [{ type: "text", value: setup.content }] }] }
  ) as unknown as { children: N[] };

  const s = StyleSheet.create({
    page: {
      fontFamily: pal.base,
      fontSize: setup.fontSizePt,
      color: pal.ink,
      backgroundColor: pal.paper,
      padding: marginPt,
      lineHeight: 1.55,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.75,
      borderBottomColor: pal.border,
      paddingBottom: 5,
      marginBottom: 10,
      fontSize: setup.fontSizePt * 0.82,
      color: pal.muted,
    },
    footer: {
      position: "absolute",
      bottom: marginPt * 0.45,
      left: marginPt,
      right: marginPt,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: pal.muted,
    },
  });

  const showHead = setup.showHeader || setup.showDate;
  const showFoot = setup.showPageNumbers;

  return (
    <Document title={setup.headerText || "DocuFlow Document"}>
      <Page size={size} orientation={setup.orientation} style={s.page} wrap>
        {showHead && (
          <View style={s.headerRow}>
            <Text style={{ fontFamily: fam(pal.base, true, false) }}>
              {setup.showHeader ? setup.headerText || "Untitled Document" : ""}
            </Text>
            {setup.showDate && <Text>{setup.dateStr}</Text>}
          </View>
        )}

        {renderBlocks(tree.children ?? [], ctx, "b")}

        {showFoot && (
          <View style={s.footer} fixed>
            <Text>{setup.headerText || "DocuFlow"}</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        )}

        {setup.watermarkText.trim() && (
          <View
            fixed
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              justifyContent: "center",
              opacity: setup.watermarkOpacity * 2.2,
            }}
          >
            <Text
              style={{
                fontFamily: fam(pal.base, true, false),
                fontSize: 44,
                letterSpacing: 4,
                color: pal.ink,
                transform: setup.watermarkPosition === "diagonal" ? "rotate(-30deg)" : undefined,
              }}
            >
              {setup.watermarkText}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

/** Render the document to a Blob. Call only from a click handler (browser). */
export async function generatePdfBlob(setup: PdfSetup): Promise<Blob> {
  const instance = pdf(<DocuPdfDocument setup={setup} />);
  return instance.toBlob();
}
