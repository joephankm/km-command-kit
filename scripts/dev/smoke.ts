import { markup } from '@/utils/shellStyle';

const show = (name: string, list: string): void => {
  console.log(`--- ${name}`);

  for (const line of list.split('\n')) {
    console.log(`|${line}|`);
  }
};

const steps = ['parse the input given on the command line', 'validate', 'print the manual when rejected'];
const base = { width: 22, spaceAfter: 0 } as const;

show('numbered', markup.formatList(steps, { ...base, numbered: true }));
show('numbered, marker ")"', markup.formatList(steps, { ...base, numbered: true, marker: ')' }));
show(
  'startNumber 4 (picks up an interrupted list)',
  markup.formatList(steps, { ...base, numbered: true, startNumber: 4 })
);
show('9 to 11: right-aligned', markup.formatList(steps, { ...base, numbered: true, startNumber: 9 }));
show(
  'numbered, indent 2, padding left',
  markup.formatList(steps, { ...base, numbered: true, indent: 2, padding: 'left' })
);
show('not numbered: startNumber ignored', markup.formatList(steps, { ...base, startNumber: 5 }));

console.log('=== numberWidth');
const firstPart = ['parse the input', 'validate'];
const secondPart = ['print the manual', 'exit'];
show('part 1 (1-2), numberWidth 2', markup.formatList(firstPart, { ...base, numbered: true, numberWidth: 2 }));
show(
  'part 2 (9-10), numberWidth 2',
  markup.formatList(secondPart, { ...base, numbered: true, startNumber: 9, numberWidth: 2 })
);
show('part 1 without numberWidth (for contrast)', markup.formatList(firstPart, { ...base, numbered: true }));
show('numberWidth 3', markup.formatList(firstPart, { ...base, numbered: true, numberWidth: 3 }));
