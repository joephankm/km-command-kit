---
name: shellStyle
description:
  Add ANSI text styles and draw terminal boxes and rules with semantic presets or custom SGR codes.
labels: ['shell', 'ansi', 'terminal', 'style', 'box']
version: 1.3.1
updated: 2026-10-05
---

# Shell Style

## Overview

`shellStyle` provides ANSI SGR text styling and Unicode box drawing for command-line output. ANSI
sequences are interpreted by terminals that support them; other environments may display the control
codes literally. Box drawing also depends on the terminal font supporting the selected glyphs.

It holds two components, which share nothing but the escape codes underneath them:

- **Styling** (`styleText/`) — wrapping text in a style, either a semantic preset or a code composed by hand.
- **Drawing** (`drawBox/`) — boxes, tables and rules built from Unicode box-drawing glyphs.

---

## Exports (`index.ts`)

| Export      | Component   | Source                     | Description                                                          |
| ----------- | ----------- | -------------------------- | -------------------------------------------------------------------- |
| `style`     | `styleText` | `styleText/simpleStyle.ts` | Named functions that wrap text in configured ANSI styles             |
| `styleCode` | `styleText` | `styleText/styleCode.ts`   | Converts style names into a semicolon-separated SGR parameter string |
| `draw`      | `drawBox`   | `drawBox/drawBox.ts`       | Provides `buildBox` and `line` drawing methods                       |

---

## Styling

```ts
import { style, styleCode } from '@/utils/shellStyle';

// Named presets wrap text in their configured ANSI codes.
console.log(style.info('Info message'));
console.log(style.error('Something failed'));
console.log(style.heading('Section Heading'));

// Compose SGR parameters from multiple style names.
const code = styleCode('bold', 'underline', 'cyan'); // '1;4;36'
console.log(`\u001B[${code}m` + 'custom styled text' + '\u001B[0m');
```

### `style`

Each entry in `configs/styleConfig.ts` becomes a function that wraps text with its opening and
closing codes. Names describe the purpose of the text rather than fixing its color, so the preset
can be restyled centrally without changing its call sites.

| Group             | Names                                                  |
| ----------------- | ------------------------------------------------------ |
| Log and status    | `info` `verbose` `warn` `error` `success` `side`       |
| Emphasis          | `highlight` `emphasize` `delete` `mute` `attach`       |
| Titles            | `title` `subtitle` `heading` `label` `subtle`          |
| Structure         | `border`                                               |
| Nature            | `reset`                                                |

Each function closes with the codes that undo what it opened, rather than a blanket reset, so styles nest:

```ts
style.emphasize('bold ' + style.error('and red') + ' still bold');
```

It also supports two lower-level forms. Called without text, it returns only the opening code so the
caller can close it later. Given a second argument, it uses that value as the closing code instead
of the preset's default:

```ts
style.border(); // the opening code, nothing else
style.title('Report', style.border()); // opens as a title, closes back into the border style
```

### `styleCode`

The raw composer is useful when a preset does not cover the desired combination. It accepts any
number of supported foreground color, background, decoration, and reset names, then joins their
numeric codes:

```ts
styleCode('bold', 'underline', 'cyan'); // '1;4;36'
styleCode('bgRed'); // '41'
```

Prefix background names with `bg` and reset names with `reset` (for example, `bgBlue`, `resetColor`,
and `resetAll`). The supported names and numeric codes are defined in `constants/shellStyleCodes.ts`.

---

## Drawing

`draw` provides low-level methods for printing box borders, rows, and standalone rules. Higher-level
components can compose these methods into complete layouts.

Each drawing method prints one line with `console.log` instead of returning it. Call the methods in
the order the lines should appear.

```ts
import { draw, style } from '@/utils/shellStyle';

draw.line(23, { title: 'Report' });

const box = draw.buildBox([12, 8], { thickOutline: true });

box.top();
box.row(['Name', 'Size'], { style: style.title });
box.mid();
box.row(['a.ts', { content: '4 KB', align: 'right' }]);
box.bot();
```

```
─────── Report ────────
┏━━━━━━━━━━━━┯━━━━━━━━┓
┃ Name       │ Size   ┃
┠────────────┼────────┨
┃ a.ts       │   4 KB ┃
┗━━━━━━━━━━━━┷━━━━━━━━┛
```

### `draw.buildBox(widths, options?)`

Fixes the column widths and box-wide options, then returns methods for printing the top border,
interior borders, bottom border, and content rows. Create a separate instance for each box whose
widths or box-wide options differ.

`widths` gives the printed width of each column, including the default one-character padding on each
side. A width of `8` leaves six characters for content. Content is not clipped when it exceeds that
space, so the row may extend beyond the border width.

| Method                 | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `top(params?)`         | The border above the first row                         |
| `mid(params?)`         | A border between two rows                              |
| `bot(params?)`         | The border below the last row                          |
| `row(cells, options?)` | A line of content, enclosed and divided by verticals   |

Border methods accept either an array indexed by column or an object keyed by column index. Use an
object when only a few columns need parameters, such as `{ 3: { span: true } }`. Unspecified columns
use the default border behavior.

`row` takes the content on its own, or an object carrying it alongside whatever that cell overrides:

```ts
box.row(['a.ts', { content: '4 KB', align: 'right', style: style.error }]);
```

| Option         | Type                            | Used by                    | Description                                          |
| -------------- | ------------------------------- | -------------------------- | ---------------------------------------------------- |
| `boxStyle`     | box style name                  | `buildBox`, `line`         | Selects the box-drawing glyph set                    |
| `borderStyle`  | `ShellStyleFunc`                | `buildBox`, `line`         | Styles border and rule glyphs                        |
| `thickOutline` | boolean                         | `buildBox`                 | Uses thick glyphs outside and regular glyphs inside  |
| `style`        | `ShellStyleFunc`                | box, row, cell, line title | Styles cell content or the rule title                |
| `align`        | `'left'`, `'center'`, `'right'` | cell, line title           | Aligns content within a cell or title within a rule  |
| `content`      | string                          | cell, `mid`                | Text displayed in a cell or continuing row-spanned cell |
| `span`         | boolean                         | cell, border               | Extends a cell across the next column                |
| `rowSpan`      | boolean                         | `mid`                      | Continues a cell through the interior border         |
| `spanAbove`    | boolean                         | `mid`                      | Marks a cell above that spans across this column     |

For cell `style`, the most specific value wins: cell style, then row style, then box style. Cell
alignment is set on each cell; `row` does not inherit an alignment from the box or row options.

**Spanning columns** removes the divider between adjacent cells and adds the absorbed column's width
to the first cell. Set `span` on that cell and leave the absorbed cell empty:

```ts
const spanned = draw.buildBox([8, 8, 8]);
spanned.top();
spanned.row([{ content: 'A spans A and B', span: true }, undefined, 'C']);
spanned.mid();
spanned.row(['A', 'B', 'C']);
spanned.bot();
```

```
┌──────┬──────┬──────┐
│ A spans A and B │ C      │
├──────┼──────┼──────┤
│ A      │ B      │ C      │
└──────┴──────┴──────┘
```

**Spanning rows** is represented on an interior `mid` border. Set `rowSpan` for the column that
continues and provide its content there; that column is left open in the divider:

```ts
const running = draw.buildBox([8, 10]);
running.top();
running.row(['first', 'kept']);
running.mid({ 1: { rowSpan: true, content: 'kept' } });
running.row(['second', undefined]);
running.bot();
```

```
┌────────┬──────────┐
│ first  │ kept     │
├────────┤ kept     │
│ second │          │
└────────┴──────────┘
```

### `draw.line(width, options?)`

Prints a standalone horizontal rule. `width` is the printed character width, so rules and box rows
can share the same width.

| Option        | Type                            | Description                                                              |
| ------------- | ------------------------------- | ------------------------------------------------------------------------ |
| `title`       | string                          | Text placed within the rule, with padding on each side                   |
| `align`       | `'left'`, `'center'`, `'right'` | Title alignment; defaults to `'center'`                                  |
| `inset`       | number                          | Minimum rule length beside an end-aligned title                          |
| `style`       | `ShellStyleFunc`                | Title style; defaults to `style.reset`                                   |
| `thickLine`   | boolean                         | Draws the rule with thick glyphs                                         |
| `boxStyle`    | box style name                  | Selects the glyph set                                                    |
| `borderStyle` | `ShellStyleFunc`                | Applies a style to the rule glyphs                                       |

```ts
draw.line(24);
draw.line(24, { title: 'Report' });
draw.line(24, { title: 'Report', align: 'left' });
draw.line(24, { thickLine: true });
```

```
────────────────────────
──────── Report ────────
── Report ──────────────
━━━━━━━━━━━━━━━━━━━━━━━━
```

`inset` keeps an end-aligned title from touching the edge of the rule. It defaults to the

### Box styles

A box style assigns a charset to each weight, so `thickOutline` and `thickLine` select within the style rather than
switching to another one. The first four use one charset throughout, and look the same either way.

| Name          | Regular       | Thick                     |
| ------------- | ------------- | ------------------------- |
| `single`      | `┌─┬─┐`       | `┌─┬─┐`                   |
| `heavy`       | `┏━┳━┓`       | `┏━┳━┓`                   |
| `double`      | `╔═╦═╗`       | `╔═╦═╗`                   |
| `round`       | `╭─┬─╮`       | `╭─┬─╮`                   |
| `thickHeavy`  | `┌─┬─┐`       | `┏━┯━┓` over a thin grid  |
| `thickDouble` | `┌─┬─┐`       | `╔═╤═╗` over a thin grid  |

The last two are the reason the mixed junctions exist — where a heavy or double outline meets a thin interior, the
junction glyph has to carry both weights (`┠`, `╟`).

### Defaults (`configs/drawBoxConfig.ts`)

| Setting       | Default        | Description                                          |
| ------------- | -------------- | ---------------------------------------------------- |
| `boxStyle`    | `'thickHeavy'` | The glyph set every drawing falls back to            |
| `borderStyle` | `style.border` | The style every border glyph falls back to           |
| `lineInset`   | `2`            | The rule kept beside a title flush to one side       |

`boxStyles` in the same file holds every style a drawing can name, so a project adds its own by adding an entry there
and its name to `BoxStyleName`.

---

## Folder structure

- `index.ts` — public entry point for the `style`, `styleCode`, and `draw` exports.
- `configs/styleConfig.ts` — maps each named preset to its opening and closing SGR codes.
- `configs/drawBoxConfig.ts` — holds the box styles and the drawing defaults.
- `constants/shellStyleCodes.ts` — defines the SGR codes for foreground colors, backgrounds, decorations, and resets.
- `constants/boxCharsets.ts` — maps each box-drawing charset to the glyph for every position.
- `types/styleTypes.ts` — defines the shared `ShellStyleFunc` and `ShellStyleCodes` types.
- `types/boxTypes.ts` — defines the charset, option and param types the drawing tool shares.
- `types/commonTypes.ts` — defines util types owned by no one tool, such as the two shapes an argument accepts.
- `styleText/simpleStyle.ts` — creates the named text-wrapping functions from `styleConfig`.
- `styleText/styleCode.ts` — builds the style-name lookup and exposes `styleCode`.
- `drawBox/drawBox.ts` — the drawing entry point, exposing `buildBox` and drawing `line` itself.
- `drawBox/buildBox.ts` — builds one drawing's border and row methods from its column widths.
- `drawBox/formatters.ts` — sits content within a width, padded and filled.
- `drawBox/paramFunctions.ts` — reads an argument given either as a value or as a full params object.

---

## Todo List

- **Component:** Display Value **[🔶 Medium]**\
  _(Colors a value by its type, so a printed value reads at a glance)_
- **Improvement:** Split Draw Box **[🔶 Medium]**\
  _(Have `drawBox` return each line as a string instead of printing it, and move the printing — `buildBox` and its
  methods — into a `shellLog` component that logs what `drawBox` returns)_
