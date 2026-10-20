import { markup } from '@/utils/shellStyle';

const rows = [
  ['-o', '--output', 'Write the result to the given file path'],
  [null, '--verbose', 'Show more detail'],
];
console.log('--- columns ---');
console.log(markup.makeColumns(rows, { width: 40 }));
console.log('--- columns ellipsis ---');
console.log(markup.makeColumns(rows, { width: 36, ellipsis: '…' }));
console.log('--- columns per-column ---');
console.log(markup.makeColumns(['name', '4 KB'], { width: { 0: 10, 1: 6 }, align: { 1: 'right' } }) + '|');

const items = [
  { label: 'output', content: 'Write the result to the given file path' },
  { label: 'verbose', content: ['Show more detail.', 'Repeat it for more.'] },
];
console.log('--- stacked ---');
console.log(markup.makeDefinitions(items, { width: 30, marker: '•', stackedOptions: { contentIndent: 2 } }));
console.log('--- aligned ---');
console.log(markup.makeDefinitions(items, { layout: 'aligned', alignedOptions: { separator: ' : ' } }));
console.log('--- inline ---');
console.log(markup.makeDefinitions(items, { width: 30, layout: 'inline' }));
