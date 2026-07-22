# Typography System — Industrial Brain AI

## Font Families (only two, no exceptions)

- **Space Grotesk** — `font-sans` — default for everything: headings,
  body, chat, tables, nav, buttons, cards.
- **Space Mono** — `font-mono` — reserved ONLY for data-like tokens.

## When to use font-mono (Space Mono)

Use `font-mono` ONLY for:
- Equipment IDs — e.g. `Pump-23`, `Motor-14`
- Document references — e.g. `Manual-v2.pdf, p.14`
- Timestamps — e.g. `2026-07-17 14:32`
- Confidence scores / percentages — e.g. `94%`
- Source citation tags in Copilot answers

Do NOT use font-mono for headings, body copy, buttons, nav, or
any prose. It is exclusively for short, data-like tokens.

## Type Scale

| Token | Size | Weight | Line-height | Tracking | Use |
|---|---|---|---|---|---|
| display | 36px | 700 | 1.1 | -0.02em | Dashboard stat numbers |
| h1 | 32px | 600 | 1.2 | -0.02em | Page titles |
| h2 | 24px | 600 | 1.25 | -0.01em | Section headers |
| h3 | 18px | 500 | 1.3 | 0 | Card titles |
| body | 15px | 400 | 1.6 | 0 | Paragraphs, chat messages |
| table-cell | 14px | 400 | 1.5 | 0 | Table body text |
| table-header | 12px | 500 | 1.4 | 0.02em | Table column headers (uppercase) |
| nav | 14px | 500 | 1.4 | 0 | Sidebar/nav labels |
| caption | 12px | 400 | 1.5 | 0.01em | Meta text, helper text |
| btn | 14px | 500 | 1 | 0 | Button labels |
| data | 13px | 500 | 1.4 | 0.01em | Equipment IDs, citations (font-mono) |

## Hard Rules

1. Never use Space Grotesk below weight 400 for readable text.
   Weight 300 (Light) is reserved for large display text only,
   if ever used at all.
2. Never go below 13px anywhere in the UI.
3. Body and table text must use line-height 1.5–1.6 minimum —
   Space Grotesk is wider than typical UI fonts and needs the
   extra vertical room to stay scannable.
4. Table headers and small uppercase labels get +0.02em tracking
   to counter tightness at small caps sizes.
5. Never introduce a third font family. If a new use case appears
   (e.g. code blocks), reuse font-mono (Space Mono), not a new font.
6. Hierarchy is created with size + weight, not with font-switching.

## Do / Don't

✅ Equipment ID in a table row → `font-mono text-data`
✅ Chat message text → `font-sans text-body`
✅ Dashboard "147 Documents" stat → `font-sans text-display`
✅ Table column header "STATUS" → `font-sans text-table-header uppercase`

❌ Using Inter or system-ui as a fallback font anywhere
❌ Body text below 15px in prose contexts
❌ Space Mono for headings or buttons
❌ Font weight 300 on any table or chat text

## Implementation Notes

This project uses **Tailwind CSS v4** — there is no `tailwind.config.ts`.
All font tokens are defined in `src/app/globals.css` under `@theme inline`.

### CSS variable → Tailwind class mapping

| CSS Variable | Tailwind Class |
|---|---|
| `--font-space-grotesk` (from next/font) | injected via `<html className>` |
| `--font-sans: var(--font-space-grotesk)` | `font-sans` |
| `--font-mono: var(--font-space-mono)` | `font-mono` |
| `--text-display` | `text-display` |
| `--text-h1` | `text-h1` |
| `--text-h2` | `text-h2` |
| `--text-h3` | `text-h3` |
| `--text-body` | `text-body` |
| `--text-table-cell` | `text-table-cell` |
| `--text-table-header` | `text-table-header` |
| `--text-nav` | `text-nav` |
| `--text-caption` | `text-caption` |
| `--text-btn` | `text-btn` |
| `--text-data` | `text-data` |

### Common patterns

```tsx
// Equipment ID in table
<span className="font-mono text-data text-neutral-700">Pump-23</span>

// Page title
<h1 className="text-h1 font-sans font-semibold">Dashboard</h1>

// Section header
<h2 className="text-h2 font-sans font-semibold">Recent Documents</h2>

// Card title
<h3 className="text-h3 font-sans font-medium">Knowledge Coverage</h3>

// Stat number
<p className="text-display font-sans font-bold">147</p>

// Table column header
<th className="text-table-header font-sans font-medium uppercase tracking-wide">Status</th>

// Body / chat text
<p className="text-body font-sans">Answer content goes here...</p>

// Timestamp / citation
<span className="font-mono text-data text-neutral-500">2026-07-17 14:32</span>

// Source chip
<span className="font-mono text-data">Manual-v2.pdf p.14</span>

// Caption / helper
<p className="text-caption text-neutral-500">Uploaded 2 hours ago</p>

// Button
<button className="text-btn font-sans font-medium">Upload Document</button>

// Nav item
<span className="text-nav font-sans font-medium">Knowledge Copilot</span>
```
