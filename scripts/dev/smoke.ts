import { markup } from '@/utils/shellStyle';

const show = (label: string, value: unknown) => console.log(label, JSON.stringify(value));

show('formatText', markup.formatText('pArSe the inPUT', { textCase: 'title', style: ['bold'] }));
show('displayLine', markup.displayLine('parse the input now', { width: 12 }));
show('displayLine center', markup.displayLine('Report', { width: 12, align: 'center', fill: '·' }));
show('makeBlank', markup.makeBlank(2));
show('makeBlock', markup.makeBlock('parse the input given on the command line', { width: 16, align: 'right' }));
show('makeBlock arr', markup.makeBlock('first paragraph\nsecond', { width: 20, asArray: true }));
show('makeList', markup.makeList(['parse the input given on the command line', 'validate'], { width: 20, indent: 2 }));
show(
  'makeList num',
  markup.makeList(['parse', 'validate', 'print'], { width: 20, numbered: true, numberType: 'upperRoman', marker: ')' })
);
console.log(markup.makeList(['parse the input given on the command line', 'validate'], { width: 20, indent: 2 }));
console.log('---');
console.log(
  markup.makeList(['parse', 'validate', 'print', 'exit'], { width: 20, numbered: true, numberType: 'upperRoman' })
);
console.log('---');
console.log(markup.makeList(['parse', 'validate'], { width: 20, numbered: true, startNumber: 9 }));
console.log('---');
console.log(markup.makeBlock('parse the input given on the command line', { width: 16, align: 'justify' }));
