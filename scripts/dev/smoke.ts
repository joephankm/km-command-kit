import docLog from '@/utils/shellLog/docLog/docLog';

const doc = docLog({ width: 30, style: undefined });

doc.title('Command Kit', { variant: 'docTitle', lineBelow: true });
doc.title('Install', 'title');
doc.body('Download the kit and run it.');
doc.title('Requirements for a long subtitle that wraps', 'subTitle');
doc.title('Example', { variant: 'heading', align: 'right' });
doc.title('Usage', { variant: 'title', dividerBefore: true });
doc.title('Appendix', { variant: 'title', numbered: false });
console.log('--- end ---');
