import { docLog } from '@/utils/shellLog';

const doc = docLog({ width: 60, indent: 2 });

const options = [
  ['-o', '--output <path>', 'Write the output to the given file path instead of printing it'],
  [null, '--verbose', 'Print more detail while running'],
  ['-h', '--help', 'Show this help'],
  [null, '--dry-run', 'Show what would run, without running it'],
];

doc.title('Tool', 'docTitle');
doc.body('A small command-line tool that shows how `columns` lays out rows in a document.');

doc.title('Usage', 'title');
doc.columns(['tool', '[options] <input>']);

doc.title('Options', 'title');
doc.body('Default — the document width is the total, every column but the last fits its content:');
doc.columns(options);

doc.body('Custom widths — `{ 1: 12 }`:');
doc.columns(options, { width: { 1: 12 } });

doc.body("Bounds — `{ 1: { max: 10 } }`, ellipsis '…':");
doc.columns(options, { width: { 1: { max: 10 } }, ellipsis: '…' });

doc.body("Align — `{ 0: 'right' }`, gap `{ 1: 3 }`:");
doc.columns(options, { align: { 0: 'right' }, gap: { 1: 3 } });

doc.divider();
doc.columns([
  ['Name', 'Type', 'Default'],
  ['width', 'number', '80'],
  ['indent', 'number', '0'],
  ['justifyContent', 'boolean', 'false'],
]);
