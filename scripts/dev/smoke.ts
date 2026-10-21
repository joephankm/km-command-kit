import { docLog } from '@/utils/shellLog';
import type { DefinitionItem } from '@/utils/shellStyle/types/markupTypes';

const items: DefinitionItem[] = [
  { label: 'output', content: 'Write the result to the given file path' },
  { label: 'dry run', content: 'Print every step without changing anything' },
];

const doc = docLog({
  width: 40,
  definitionLayouts: {
    default: 'stacked',
    stacked: { contentIndent: 2, labelStyle: 'emphasize' },
    aligned: { separator: ' : ', labelStyle: ['bold', 'cyan'] },
    inline: { labelStyle: 'title' },
  },
});

doc.body('--- stacked: the configured label style (emphasize)');
doc.definitions(items);
doc.body('--- stacked, another option given: still the configured label style');
doc.definitions(items, { stackedOptions: { labelSuffix: ':' } });
doc.body('--- stacked, labelStyle given: error');
doc.definitions(items, { stackedOptions: { labelStyle: 'error' } });
doc.body('--- aligned: the configured label style (bold cyan)');
doc.definitions(items, { layout: 'aligned' });
doc.body('--- inline: the configured label style (title)');
doc.definitions(items, { layout: 'inline' });
doc.body('--- the default config: no label style');
docLog({ width: 40 }).definitions(items);
