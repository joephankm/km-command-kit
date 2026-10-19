import { markup } from '@/utils/shellStyle';

const items = [
  { label: '--output <path>', content: 'Write the output to the file at this path instead of printing it.' },
  { label: '--verbose', content: ['Print every step as it runs.', 'Useful when a run fails partway.'] },
];

console.log('--- aligned, width 50, indent 2 ---');
console.log(markup.makeDefinitions(items, { layout: 'aligned', width: 50, indent: 2 }));
console.log('--- aligned, width 50, labelAlign right, separator " : " ---');
console.log(
  markup.makeDefinitions(items, {
    layout: 'aligned',
    width: 50,
    alignedOptions: { labelAlign: 'right', separator: ' : ' },
  })
);
console.log('--- aligned, width 40, labelWidth { max: 8 }, marker ["decimal", "."] ---');
console.log(
  markup.makeDefinitions(items, {
    layout: 'aligned',
    width: 40,
    marker: ['decimal', '.'],
    alignedOptions: { labelWidth: { max: 8 }, separator: ' │ ' },
  })
);
console.log('--- aligned, no width ---');
console.log(markup.makeDefinitions(items, { layout: 'aligned' }));
