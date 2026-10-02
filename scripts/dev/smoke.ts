import { style } from '@/utils/shellStyle';
import { formatBlock } from '@/utils/shellStyle/markupText/formatBlock';
import { stripStyles, wrapText } from '@/utils/shellStyle/markupText/stringUtils';

/**
 * Prints a formatted block between bars, one line at a time, with each line's visible width.
 */
const show = (title: string, block: string): void => {
  console.log(`--- ${title}`);

  for (const line of block.split('\n')) {
    console.log(`  |${line}|`, stripStyles(line).length);
  }
};

const text =
  'Parse the input given on the command line and validate every option.\n' +
  'Print the manual when a call is rejected.';

show('no width, no align: as it is', formatBlock(text));
show('no width, align right: still as it is', formatBlock(text, { align: 'right' }));
show('width 30, no align: wrapped only', formatBlock(text, { width: 30 }));
show('width 30, center', formatBlock(text, { width: 30, align: 'center' }));
show('width 30, justify', formatBlock(text, { width: 30, align: 'justify' }));
show('blank line kept between paragraphs', formatBlock('First one here.\n\nSecond one, after a gap.', { width: 12 }));
show(
  'styled words',
  formatBlock(`Parse the ${style.heading('input')} and ${style.error('reject')} a bad call.`, {
    width: 18,
    align: 'right',
  })
);
console.log('doc example:', JSON.stringify(formatBlock('parse the input now', { width: 12, align: 'right' })));

console.log('=== margin, per paragraph');
const two = 'one two\nthree four';
console.log('width, default (bottom):', JSON.stringify(formatBlock(two, { width: 7 })));
console.log('width, top:             ', JSON.stringify(formatBlock(two, { width: 7, margin: 'top' })));
console.log('width, both, size 2:    ', JSON.stringify(formatBlock(two, { width: 7, margin: true, marginSize: 2 })));
console.log('width, none (false):    ', JSON.stringify(formatBlock(two, { width: 7, margin: false })));
console.log('no width, default:      ', JSON.stringify(formatBlock(two)));
console.log('no width, keeps spaces: ', JSON.stringify(formatBlock('a   b', { margin: false })));
console.log('--- same blank lines with and without width (margin both):');
const withWidth = formatBlock(two, { width: 50, margin: true });
const withoutWidth = formatBlock(two, { margin: true });
console.log('  ', JSON.stringify(withWidth), '===', JSON.stringify(withoutWidth), withWidth === withoutWidth);

console.log('=== padding');
console.log(
  'width, both, left:     ',
  JSON.stringify(formatBlock(two, { width: 9, align: 'left', padding: true, margin: false }))
);
console.log(
  'width, left 2, right:  ',
  JSON.stringify(formatBlock(two, { width: 11, align: 'right', padding: 'left', paddingSize: 2, margin: false }))
);
console.log('width, both + margin:  ', JSON.stringify(formatBlock(two, { width: 9, padding: true })));
console.log('no width, padding ignored:', JSON.stringify(formatBlock(two, { padding: true, margin: false })));

console.log('=== wrapText linePrefix / lineSuffix');
const quoteBar = style.border('│ ');
const lineWidths = (wrapped: string): string =>
  wrapped
    .split('\n')
    .map(line => stripStyles(line).length)
    .join(', ');
const indented = wrapText('parse the input now please', 14, { linePrefix: '    ' });
const quoted = wrapText('parse the input now please', 14, { linePrefix: quoteBar, align: 'left' });
const both = wrapText('parse the input now please', 14, { linePrefix: '> ', lineSuffix: ' <', align: 'center' });
console.log('indent 4:     ', JSON.stringify(indented), '→', lineWidths(indented));
console.log('styled bar:   ', JSON.stringify(stripStyles(quoted)), '→', lineWidths(quoted));
console.log('both, center: ', JSON.stringify(both), '→', lineWidths(both));
