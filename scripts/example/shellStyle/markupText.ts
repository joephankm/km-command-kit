import { markup, style } from '@/utils/shellStyle';
import type { DefinitionItem, TextCase } from '@/utils/shellStyle/types/markupTypes';

/**
 * Text recased, then styled by a preset name or by a list of code names.
 */
const exampleFormatText = (): void => {
  console.log(`\n${style.heading('Recased and styled text')}`);

  const cases: TextCase[] = ['upper', 'lower', 'title', 'sentence', 'capitalize'];

  for (const textCase of cases) {
    console.log(`  ${textCase.padEnd(12)} ${markup.formatText('pArSe the inPUT', { textCase })}`);
  }

  console.log(`  ${'preset'.padEnd(12)} ${markup.formatText('done', { style: 'success' })}`);
  console.log(`  ${'code names'.padEnd(12)} ${markup.formatText('parse the input', { style: ['bold', 'cyan'] })}`);
};

/**
 * One line fitted to a width: cut short, aligned, filled and indented.
 */
const exampleDisplayLine = (): void => {
  console.log(`\n${style.heading('One line within a width')}`);

  console.log(`[${markup.displayLine('parse the input given on the command line', { width: 20 })}]`);
  console.log(`[${markup.displayLine('parse the input given on the command line', { width: 20, ellipsis: '…' })}]`);
  console.log(`[${markup.displayLine('Report', { width: 20, align: 'center', fill: '·' })}]`);
  console.log(`[${markup.displayLine('Report', { width: 20, align: 'right', indent: 2, rightIndent: 2 })}]`);
};

/**
 * Paragraphs wrapped to a width, aligned, and set between a prefix and a suffix.
 */
const exampleBlock = (): void => {
  console.log(`\n${style.heading('A block of paragraphs')}`);

  const text = 'Parse the input given on the command line.\nThen validate every field it holds.';

  console.log(markup.makeBlock(text, { width: 24 }));
  console.log(style.subtle('  justified, one blank line between paragraphs'));
  console.log(markup.makeBlock(text, { width: 24, align: 'justify', spaceBetween: 1 }));
  console.log(style.subtle('  a line prefix and suffix, indented'));
  console.log(markup.makeBlock(text, { width: 30, indent: 2, linePrefix: '│ ', lineSuffix: ' │' }));
};

/**
 * Bulleted and numbered lists, wrapped under their markers.
 */
const exampleList = (): void => {
  console.log(`\n${style.heading('Bulleted and numbered lists')}`);

  const items = ['Parse the input given on the command line', 'Validate every field', 'Print the result'];

  console.log(markup.makeList(items, { width: 30, indent: 2 }));
  console.log(style.subtle('  numbered in Roman numerals'));
  console.log(markup.makeList(items, { width: 30, numbered: true, numberType: 'upperRoman' }));
  console.log(style.subtle('  numbered from 9, with a custom marker'));
  console.log(markup.makeList(items, { width: 30, numbered: true, startNumber: 9, marker: ')' }));
};

/**
 * Content set in columns without borders: a total width, widths by column, and cut cells.
 */
const exampleColumns = (): void => {
  console.log(`\n${style.heading('Columns without borders')}`);

  const rows = [
    ['-o', '--output', 'Write the result to the given file path'],
    [null, '--verbose', 'Show more detail while it runs'],
  ];

  console.log(markup.makeColumns(rows, { width: 40 }));
  console.log(style.subtle('  each wide cell cut instead of wrapped'));
  console.log(markup.makeColumns(rows, { width: 40, ellipsis: '…' }));
  console.log(style.subtle('  a width and an alignment for each column'));
  console.log(markup.makeColumns(['a.ts', '4 KB', 'source'], { width: { 0: 10, 1: 6 }, align: { 1: 'right' } }));
};

/**
 * One definition list shown in each of its three layouts.
 */
const exampleDefinitions = (): void => {
  console.log(`\n${style.heading('A definition list in each layout')}`);

  const items: DefinitionItem[] = [
    { label: 'output', content: 'Write the result to the given file path' },
    { label: 'verbose', content: ['Show more detail while it runs.', 'Repeat it for even more.'] },
  ];

  console.log(style.subtle('  stacked, the default'));
  console.log(markup.makeDefinitions(items, { width: 34, indent: 2 }));
  console.log(style.subtle('  stacked, with markers on the items and their paragraphs'));
  console.log(
    markup.makeDefinitions(items, {
      width: 34,
      marker: ['decimal', '.'],
      stackedOptions: { contentIndent: 2, contentMarker: '-' },
    })
  );
  console.log(style.subtle('  aligned, with a separator'));
  console.log(markup.makeDefinitions(items, { layout: 'aligned', alignedOptions: { separator: ' : ' } }));
  console.log(style.subtle('  inline'));
  console.log(markup.makeDefinitions(items, { width: 34, layout: 'inline', marker: '•' }));
};

exampleFormatText();
exampleDisplayLine();
exampleBlock();
exampleList();
exampleColumns();
exampleDefinitions();
