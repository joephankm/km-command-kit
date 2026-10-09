import docLog from '@/utils/shellLog/docLog/docLog';

const doc = docLog({ width: 40 });

doc.title('Command Kit', 'docTitle');
doc.title('Install', { variant: 'title', numbered: true });
doc.body('Download the kit, then run it from the root of your project.');
doc.list(['Download', { text: 'Configure', items: ['Set the token', 'Pick a region'] }, 'Run']);
doc.title('Usage', { variant: 'title', numbered: true, dividerBefore: true });
doc.list(['Build', 'Test', 'Release'], { numbered: true });
