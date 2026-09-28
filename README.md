# DocuFlow — Text to PDF Studio

> Turn raw text and Markdown into professional, vector-quality PDFs instantly — 100% client-side, no sign-up, free forever.

Paste raw text or Markdown, style it with professional themes, and export a
**selectable, searchable vector PDF**. 100% client-side: your text never leaves
the browser. Drafts autosave to `localStorage`.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

## Production

```bash
npm run build
npm start        # serves the optimized build
```

Set the public URL for correct SEO tags and sitemap:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run build
```

## Features

- Live Markdown preview (GFM: tables, checklists, code) with 300ms-debounced paint
- Page setup: A4 / Letter / Legal, portrait / landscape, 4 margin presets + custom
- 4 typography themes, custom header/footer, `Page X of Y`, watermark
- Export PDF **downloads instantly** as a selectable, searchable vector file
  (rendered client-side with @react-pdf/renderer + remark; no print dialog)
- Printer button for exact browser-layout printing (preview is the print source)
- Download `.md` source, import `.md` / `.txt` via button or drag-drop
- Command palette (`Ctrl+K`), focus mode, dark canvas, zoom, margin guides
- Presets: Executive Report, Academic Essay, Minimalist Letter, Invoice
- Autosave drafts locally · first-run sample document · toast notifications
- Accessible: skip link, ARIA labels, keyboard-first controls, reduced-motion support

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand (persisted) ·
react-markdown + remark-gfm + rehype-sanitize · Lucide icons · next/font
(Inter, Merriweather, Roboto Mono).

## Privacy

No backend, no analytics, no network calls for document content. Fonts are
bundled at build time; everything else runs locally.
