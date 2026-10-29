---
name: shellStyle
description:
  Add ANSI text styles and draw terminal boxes and rules with semantic presets or custom SGR codes.
labels: ['shell', 'ansi', 'terminal', 'style', 'box', 'markup']
version: 1.6.3
updated: 2026-10-29
---

# Shell Style

## Overview

`shellStyle` provides ANSI SGR text styling and Unicode box drawing for command-line output. ANSI
sequences are interpreted by terminals that support them; other environments may display the control
codes literally. Box drawing also depends on the terminal font supporting the selected glyphs.

It holds three components:

- **Styling** (`styleText/`) — wrapping text in a style, either a semantic preset or a code composed by hand.
- **Drawing** (`drawBox/`) — boxes, tables and rules built from Unicode box-drawing glyphs.
- **Markup** (`markupText/`) — text recased, styled, set within a width, and laid out as blocks, lists, columns and
  definition lists.

---

## Exports (`index.ts`)

| Export      | Component    | Source                     | Description                                                           |
| ----------- | ------------ | -------------------------- | --------------------------------------------------------------------- |
| `style`     | `styleText`  | `styleText/simpleStyle.ts` | Named functions that wrap text in configured ANSI styles              |
| `styleCode` | `styleText`  | `styleText/styleCode.ts`   | Converts style names into a semicolon-separated SGR parameter string  |
| `draw`      | `drawBox`    | `drawBox/drawBox.ts`       | Provides `buildBox` and `line` drawing methods                        |
| `markup`    | `markupText` | `markupText/markupText.ts` | Formats text as cased and styled text, single lines, blocks, lists, columns and definition lists |

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

## Markup

`markup` formats terminal text without printing it. Use `formatText` to change a string's case or style, `displayLine`
to fit one line, and the `make*` methods to build lines, paragraphs, lists, columns, or definition lists. Results are
strings; every `make*` method can return an array of lines with `asArray: true`.

```ts
import { markup } from '@/utils/shellStyle';

console.log(markup.makeList(['parse the input given on the command line', 'validate'], { width: 20, indent: 2 }));
```

```
  • parse the input
    given on the
    command line
  • validate
```

Method names describe the shape of the result:

| Prefix    | Produces                                    | Methods                                                                |
| --------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| `make`    | A structure: lines arranged as a whole      | `makeBlock`, `makeList`, `makeColumns`, `makeDefinitions`, `makeBlank` |
| `display` | A layout: content placed within a width     | `displayLine`                        |
| `format`  | A string process: one text changed in place | `formatText`                         |

Widths count visible characters rather than ANSI SGR escape sequences, so styled text can be laid out without counting
the styling codes as columns. Wrapping keeps words intact; a single word longer than the available width can therefore
extend past it.

### `markup.formatText(text, options?)`

Optionally applies a case conversion, then wraps the result in a named preset or a style composed from SGR code names.
With no options, it returns the input unchanged:

```ts
markup.formatText('pArSe the inPUT', { textCase: 'title', style: ['bold'] }); // bold 'Parse The Input'
markup.formatText('done', { style: 'success' }); // the `success` preset
```

| Text case    | Result for `pArSe the inPUT` |
| ------------ | ---------------------------- |
| `upper`      | `PARSE THE INPUT`            |
| `lower`      | `parse the input`            |
| `title`      | `Parse The Input`            |
| `sentence`   | `Parse the input`            |
| `capitalize` | `PArSe the inPUT`            |

### `markup.displayLine(text, options?)`

Fits one string within `width`. Text that is too long is truncated and ends with `ellipsis`; shorter text can be
aligned and padded with `fill`. Without `width`, the input is returned unchanged. Padding, when requested, is added
outside the content width.

```ts
markup.displayLine('parse the input now', { width: 12 }); // 'parse the...'
markup.displayLine('Report', { width: 12, align: 'center', fill: '·' }); // '···Report···'
```

### `markup.makeBlank(count?, options?)`

Returns `count` blank lines (`1` by default), either as newline characters or, with `asArray: true`, as empty strings.

```ts
markup.makeBlank(2); // '\n\n'
markup.makeBlank(2, { asArray: true }); // ['', '']
```

### `markup.makeBlock(text, options?)`

Formats paragraphs supplied as an array, or as a string split on line breaks. With `width`, each paragraph wraps and
can be aligned; `firstLinePrefix` replaces `linePrefix` on the first line of each paragraph, and `lineSuffix` is added
to every line. Prefixes and suffixes take up space inside the requested width. By default, one blank line follows each
paragraph, including the last; set `spaceAfter: 0` to omit them. `spaceBefore` adds blank lines before the first
paragraph. `padding` adds spaces outside each line's prefixes and suffix.

```ts
console.log(markup.makeBlock('parse the input given on the command line', { width: 16, align: 'justify' }));
```

```
parse  the input
given   on   the
command     line
```

### `markup.makeList(items, options?)`

Formats each item as a paragraph. Bulleted items use `•` by default; numbered items use decimal numbers and `.` by
default. Wrapped lines align with the item text, beneath the first line's marker. Numbered values are right-aligned so
the item text starts in the same column. `startNumber` continues a sequence from the supplied value, and
`numberWidth` can reserve the same number of columns as an earlier list:

```ts
console.log(
  markup.makeList(['parse', 'validate', 'print', 'exit'], { width: 20, numbered: true, numberType: 'upperRoman' })
);
```

```
  I. parse
 II. validate
III. print
 IV. exit
```

Set `marker` to change the bullet or the text after each number (`)` produces `1)`). `indent` adds leading spaces
before both the marker and item text. `spaceBefore` adds blank lines before the first item; `spaceAfter` adds blank
lines after the entire list.

| Number type  | Numbers        |
| ------------ | -------------- |
| `decimal`    | `1` `2` `3`    |
| `upperRoman` | `I` `II` `III` |
| `lowerRoman` | `i` `ii` `iii` |
| `upperAlpha` | `A` `B` `C`    |
| `lowerAlpha` | `a` `b` `c`    |
| `circled`    | `①` `②` `③`    |

Alpha numbering continues past `Z` like spreadsheet columns (`AA`, `AB`). Circled numbering supports values through
`㊿`, then falls back to ordinary digits.

### `markup.makeColumns(contents, options?)`

Sets content in columns without borders, each column aligned on its own. A `string[]` is one row, returned as one line; a
`string[][]` is a block, one inner array per row. A `null` cell is an empty one, such as an option without a short flag.

```ts
const rows = [
  ['-o', '--output', 'Write the result to the given file path'],
  [null, '--verbose', 'Show more detail'],
];

console.log(markup.makeColumns(rows, { width: 40 }));
```

```
-o --output  Write the result to the
             given file path
   --verbose Show more detail
```

`width` sets the columns' widths in one of two ways:

- **A number** is the total width of a line. Every column but the last is as wide as its widest content, and the last
  takes what remains after them and their gaps.
- **A record keyed by column position** sets each column on its own: a number for an exact width, or `{ min, max }` to
  hold its auto width within. A column without one, except the last, is as wide as its widest content. With no total
  width, the last column has no width and shows its content as it is.

```ts
markup.makeColumns(['name', '4 KB'], { width: { 0: 10, 1: 6 }, align: { 1: 'right' } }); // 'name         4 KB'
```

A cell wider than its column wraps within it, and its row grows to as many lines as its tallest cell. With `ellipsis`,
the cell is cut to one line instead, ending in that mark — `true` for the default `...`:

```ts
console.log(markup.makeColumns(rows, { width: 36, ellipsis: '…' }));
```

```
-o --output  Write the result to th…
   --verbose Show more detail
```

`align` and `gap` take one value for every column, or a record keyed by column position. Each gap is the number of
blank columns after its column, `1` by default. `indent`, `linePrefix`, `rightIndent` and `lineSuffix` sit around every
line, the last two only when `width` is a number.

### `markup.makeDefinitions(items, options?)`

Formats a definition list from `{ label, content }` items, where `content` is one paragraph or an array of them.
`layout` picks how each label sits with its content:

| Layout      | Arrangement                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `'stacked'` | The default. The label on its own line, with its content below it            |
| `'aligned'` | The label in a column as wide as the widest label, with its content beside it |
| `'inline'`  | The label and its content on one line, joined by a separator                 |

```ts
const items = [
  { label: 'output', content: 'Write the result to the given file path' },
  { label: 'verbose', content: ['Show more detail.', 'Repeat it for more.'] },
];

markup.makeDefinitions(items, { width: 30, marker: '•', stackedOptions: { contentIndent: 2 } });
markup.makeDefinitions(items, { layout: 'aligned', alignedOptions: { separator: ' : ' } });
markup.makeDefinitions(items, { width: 30, layout: 'inline' });
```

```
• output
    Write the result to the
    given file path

• verbose
    Show more detail.
    Repeat it for more.
```

```
output  : Write the result to the given file path
verbose : Show more detail.
        : Repeat it for more.
```

```
output — Write the result to
the given file path
verbose — Show more detail.
Repeat it for more.
```

`marker` leads each item: a mark such as `'•'`, or a `[numberType, marker]` pair such as `['upperRoman', '.']` to number
the items. The lines after an item's first one are indented past it. Each layout takes its own options in an option named
after it:

| Option           | Fields                                                                       | Description                                                                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackedOptions` | `contentIndent`, `itemSpacing`, `contentSpacing`, `labelSuffix`, `contentMarker` | `contentIndent` pushes the content right past its label. `itemSpacing` is the blank lines between items, `1` by default, and `contentSpacing` those between an item's paragraphs. `labelSuffix` is set right after each label. `contentMarker` leads each paragraph, typed like `marker` |
| `alignedOptions` | `labelAlign`, `labelWidth`, `separator`                                      | `labelAlign` places each label within its column, `'left'` by default. `labelWidth` is the column's width, exact or `{ min, max }`. `separator` is set between the label column and the content on every line; without it, one space                                  |
| `inlineOptions`  | `separator`                                                                  | The text between each label and its content, with a space on each side. Defaults to `'—'`                                                                                                                                                                            |

An `'inline'` item with several paragraphs joins them into one, with a space between.

**The `'aligned'` layout does not yet apply** `marker`, `width`, `indent`, `rightIndent`, `linePrefix` or `lineSuffix`:
its content shows as it is, without wrapping. A label wider than `labelWidth` wraps within its column, but a single word
cannot wrap and pushes its content out of line.

### Options

| Option            | Type                                           | Used by                                | Description                                                                          |
| ----------------- | ---------------------------------------------- | -------------------------------------- |--------------------------------------------------------------------------------------|
| `width`           | number, or a record of `ColumnWidth` in `makeColumns` | `displayLine`, `makeBlock`, `makeList`, `makeColumns`, `makeDefinitions` | Visible columns available for content; enables truncation or wrapping as applicable  |
| `align`           | `'left'`, `'center'`, `'right'` or `'justify'` | `displayLine`, `makeBlock`, `makeList`, `makeColumns`, `makeDefinitions` | Content alignment; defaults to `'left'`. In `makeColumns`, one for every column or a record by position, without `'justify'` |
| `ellipsis`        | string, or `true` in `makeColumns`             | `displayLine`, `makeColumns`           | Ending used when text is truncated; defaults to `'...'`. In `makeColumns`, setting it cuts a wide cell instead of wrapping it |
| `gap`             | number or a record by column position          | `makeColumns`                          | Blank columns after each column but the last; defaults to `1`                        |
| `fill`            | string                                         | `displayLine`                          | Character used to fill space created by alignment; defaults to a space               |
| `padding`         | `'left'`, `'right'` or `true`                  | `displayLine`, `makeBlock`, `makeList` | Adds spaces outside the content on the selected side(s); `true` means both           |
| `paddingSize`     | number                                         | `displayLine`, `makeBlock`, `makeList` | Number of padding spaces; defaults to `1`                                            |
| `linePrefix`      | string                                         | `makeBlock`, `makeColumns`, `makeDefinitions` | Text before each wrapped line, within the width                                      |
| `firstLinePrefix` | string or `(index) => string`                  | `makeBlock`                            | First-line prefix per paragraph, replacing `linePrefix`; function receives its index |
| `lineSuffix`      | string                                         | `makeBlock`, `makeColumns`, `makeDefinitions` | Text after each wrapped line, within the width                                       |
| `indent`          | number                                         | `makeList`, `makeColumns`, `makeDefinitions` | Leading spaces before each item or line                                              |
| `marker`          | string, or `[numberType, marker]` in `makeDefinitions` | `makeList`, `makeDefinitions`  | Bullet or text after the number; defaults to `'•'` or `'.'` when numbered in `makeList`, and to none in `makeDefinitions` |
| `layout`          | `'stacked'`, `'aligned'` or `'inline'`         | `makeDefinitions`                      | How each label sits with its content; defaults to `'stacked'`                        |
| `numbered`        | boolean                                        | `makeList`                             | Outputs numbered items instead of bullets                                            |
| `startNumber`     | number                                         | `makeList`                             | Number assigned to the first item; defaults to `1`                                   |
| `numberType`      | number type name                               | `makeList`                             | Number format; defaults to decimal                                                   |
| `numberWidth`     | number                                         | `makeList`                             | Reserved width for right-aligned numbers; defaults to the widest number              |
| `spaceBefore`     | number                                         | `makeBlock`, `makeList`, `makeColumns`, `makeDefinitions` | Blank lines before the first paragraph, item or row                                  |
| `spaceAfter`      | number                                         | `makeBlock`, `makeList`, `makeColumns`, `makeDefinitions` | Blank lines after each block paragraph (default `1`) or once after the whole result  |
| `asArray`         | boolean                                        | `makeBlank`, `makeBlock`, `makeList`, `makeColumns`, `makeDefinitions` | Returns lines as an array instead of joining them with line breaks                   |
| `style`           | preset name or array of code names             | `formatText`                           | Style wrapped around the text                                                        |
| `textCase`        | text case name                                 | `formatText`                           | Case conversion applied before styling                                               |

**Without `width`,** `makeBlock` returns each paragraph as supplied, without wrapping or applying alignment, prefixes,
or suffixes. `makeList` likewise returns the item strings without adding markers or indentation. Supply a width when you
want list markers, wrapping, or alignment.

---

## Folder structure

- `index.ts` — public entry point for the `style`, `styleCode`, `draw`, and `markup` exports.
- `configs/styleConfig.ts` — maps each named preset to its opening and closing SGR codes.
- `configs/drawBoxConfig.ts` — holds the box styles and the drawing defaults.
- `constants/shellStyleCodes.ts` — defines the SGR codes for foreground colors, backgrounds, decorations, and resets.
- `constants/boxCharsets.ts` — maps each box-drawing charset to the glyph for every position.
- `types/styleTypes.ts` — defines the shared `ShellStyleFunc` and `ShellStyleCodes` types.
- `types/boxTypes.ts` — defines the charset, option and param types the drawing tool shares.
- `types/commonTypes.ts` — defines util types owned by no one tool, such as the two shapes an argument accepts.
- `types/markupTypes.ts` — the option and line types the markup methods share.
- `styleText/` — the Styling component: the named presets and the style-code composer.
- `drawBox/` — the Drawing component: boxes, their rows and borders, and standalone rules.
- `markupText/` — the Markup component: `markupText.ts` gathers every method, and the other files hold them by kind,
  with each larger structure, such as `makeColumns` or `makeDefinitions`, in a file of its own.
- `common/` — general-purpose helpers not tied to this util, such as text cases, number styles, and text wrapping by
  visible width.

---

## Todo List

- **Component:** Display Value **[🔶 Medium]**\
  _(Colors a value by its type, so a printed value reads at a glance)_
- **Improvement:** Split Draw Box **[🔶 Medium]**\
  _(Have `drawBox` return each line as a string instead of printing it, and move the printing — `buildBox` and its
  methods — into a `shellLog` component that logs what `drawBox` returns)_
- **Feature:** Markup Quote **[🔶 Medium]**\
  _(Sets content off as a quote behind a border on the left, on both sides, or all round as a box)_
