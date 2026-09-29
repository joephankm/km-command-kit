import { draw, style } from '@/utils/shellStyle';
import type { BoxStyleName } from '@/utils/shellStyle/configs/drawBoxConfig';

/**
 * The plainest box: a border, two rows, a border.
 */
const exampleSimpleBox = (): void => {
  console.log(`\n${style.heading('A plain box')}`);

  const box = draw.buildBox([12, 8]);

  box.top();
  box.row(['Name', 'Size']);
  box.row(['a.ts', '4 KB']);
  box.bot();
};

/**
 * A table: a thick outline, a header divided from its rows, and styling at all three levels.
 */
const exampleTable = (): void => {
  console.log(`\n${style.heading('A table, styled at three levels')}`);

  // Box level — every cell is a label unless something narrower says otherwise.
  const table = draw.buildBox([12, 9, 10], { thickOutline: true, style: style.label });

  table.top();

  // Row level — the header line alone.
  table.row(['Name', 'Size', 'Kind'], { style: style.title });
  table.mid();

  table.row(['a.ts', { content: '4 KB', align: 'right' }, 'source']);

  // Element level — one cell of one row.
  table.row(['b.json', { content: '12 KB', align: 'right', style: style.error }, 'data']);
  table.bot();
};

/**
 * Cells joined across columns, and one kept running down through a border.
 */
const exampleSpans = (): void => {
  console.log(`\n${style.heading('Spanning columns and rows')}`);

  const box = draw.buildBox([10, 10, 10], { boxStyle: 'single' });

  box.top();
  box.row(['one', 'two', 'three']);
  box.mid();

  // The marked cell takes the next column with it, divider and all.
  box.row([{ content: 'one and two', span: true }, undefined, 'three']);
  box.mid({ 0: { spanAbove: true } });

  // The middle column keeps its cell through this border, showing the same content again.
  box.row(['four', 'kept', 'five']);
  box.mid({ 1: { rowSpan: true, content: 'kept', style: style.title } });
  box.row(['six', '', 'seven']);
  box.bot();
};

/**
 * Every box style, drawn regular and with a thick outline.
 */
const exampleBoxStyles = (): void => {
  console.log(`\n${style.heading('Every box style')}`);

  const names: BoxStyleName[] = ['single', 'heavy', 'double', 'round', 'thickHeavy', 'thickDouble'];

  for (const boxStyle of names) {
    for (const thickOutline of [false, true]) {
      console.log(style.subtle(`  ${boxStyle}${thickOutline ? ' + thickOutline' : ''}`));

      const box = draw.buildBox([8, 8], { boxStyle, thickOutline });

      box.top();
      box.row(['a', 'b']);
      box.mid();
      box.row(['c', 'd']);
      box.bot();
    }
  }
};

/**
 * Standalone rules: plain, titled, aligned, inset, and drawn thick.
 */
const exampleRules = (): void => {
  console.log(`\n${style.heading('Standalone rules')}`);

  draw.line(40);
  draw.line(40, { title: 'centred by default' });
  draw.line(40, { title: 'flush left', align: 'left' });
  draw.line(40, { title: 'held further in', align: 'left', inset: 8 });
  draw.line(40, { title: 'thick', thickLine: true });
  draw.line(40, { title: 'styled', style: style.title, borderStyle: style.mute });
};

/**
 * A rule sized to the box below it, the two sharing one set of widths.
 */
const exampleHeadedBox = (): void => {
  console.log(`\n${style.heading('A rule sized to its box')}`);

  const widths = [12, 9, 10];
  const total = widths.reduce((sum, width) => sum + width, 0) + widths.length + 1;

  draw.line(total, { title: 'Summary', thickLine: true, style: style.title });

  const box = draw.buildBox(widths, { thickOutline: true });

  box.top();
  box.row(['a.ts', '4 KB', 'source']);
  box.bot();
};

exampleSimpleBox();
exampleTable();
exampleSpans();
exampleBoxStyles();
exampleRules();
exampleHeadedBox();
