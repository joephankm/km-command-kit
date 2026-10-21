import { docLog } from '@/utils/shellLog';

/**
 * A getting-started guide: one section, with two sub-sections of body text.
 */
const exampleGettingStarted = (): void => {
  const doc = docLog();

  doc.title('Command Kit', 'docTitle');

  doc.title('Getting Started', { variant: 'title', numbered: true });
  doc.body('Command Kit runs the task scripts of a project from one place, so every script is called the same way.');

  doc.title('Install', { variant: 'subTitle', numbered: true });
  doc.body('Copy the kit into the root of your project, then install its dependencies with pnpm.');

  doc.title('Run a script', { variant: 'subTitle', numbered: true });
  doc.body('Call a script by its name. Every script prints what it is doing as it runs, and stops at the first error.');
};

/**
 * A command's reference: one section holding its steps, its options, and its environments.
 */
const exampleCommandReference = (): void => {
  const doc = docLog({ width: 60 });

  doc.title('Deploy', { variant: 'title', numbered: true });
  doc.body('Build the project and ship it to one of its environments.');

  doc.title('Steps', 'heading');
  doc.list(
    [
      'Check that the working tree is clean',
      { text: 'Build the project', items: ['Compile the sources', 'Bundle the output'] },
      'Upload the bundle',
      'Switch the environment over to it',
    ],
    { numbered: true }
  );

  doc.title('Options', 'heading');
  doc.columns([
    ['-e', '--env <name>', 'The environment to deploy to'],
    ['-t', '--tag <tag>', 'The release tag, the latest commit when not given'],
    [null, '--dry-run', 'Print every step without changing anything'],
    ['-h', '--help', 'Show this reference'],
  ]);

  doc.title('Environments', 'heading');
  doc.definitions([
    { label: 'staging', content: 'A copy of production, reset every night, for checking a release before it ships.' },
    { label: 'production', content: ['What users see.', 'A deploy here needs a release tag.'] },
  ]);
};

/**
 * Release notes printed in a look of their own: the defaults overridden for the whole doc, and a
 * few calls overriding them again.
 */
const exampleCustomizedReleaseNotes = (): void => {
  const doc = docLog({
    width: 64,
    indent: 2,
    // Every title variant, replacing the configured ones.
    titles: {
      docTitle: { style: 'highlight' },
      title: { style: 'title', numberMarker: ['decimal', '.'], underline: true, lineFill: '═' },
      subTitle: { style: 'emphasize', numberMarker: ['lowerAlpha', ')'] },
      heading: { style: 'label' },
    },
    // A named style, used by name in the calls below.
    styles: { note: ['italic', 'yellow'] },
    bulletListType: 'disc',
    numberedListType: 'outline',
    dividerFill: '·',
    columnGap: 3,
    // Definition lists print inline here unless a call picks another layout.
    definitionLayouts: {
      default: 'inline',
      stacked: { contentIndent: 4 },
      aligned: {},
      inline: { separator: '→', labelStyle: 'emphasize' },
    },
  });

  doc.title('Command Kit 2.0', 'docTitle');
  doc.body('Scripts now run in parallel, and every command prints its own manual.');

  doc.title('Release Notes', { variant: 'title', numbered: true });

  doc.title('Highlights', 'heading');
  doc.list(['Parallel scripts', 'A manual for every command', 'Faster start-up']);

  doc.title('Breaking changes', 'heading');
  doc.list(
    [
      { text: 'Renamed options', items: ['--out is now --output', '--quiet is now --silent'] },
      'Node 20 or later is required',
    ],
    { numbered: true }
  );

  doc.title('Packages', 'heading');
  // The size column set to the right, for this table only.
  doc.columns(
    [
      ['command-kit', '48 KB', 'The scripts and their shared utils'],
      ['command-kit-cli', '112 KB', 'The command line that runs them'],
    ],
    { align: { 1: 'right' } }
  );

  doc.title('Upgrade notes', 'heading');
  doc.definitions([
    { label: 'Config', content: 'Rename kit.json to kit.config.json.' },
    { label: 'Scripts', content: 'Mark a script that must run alone with "serial: true".' },
  ]);

  // The stacked layout for this list only, with the doc's own stacked options.
  doc.definitions([{ label: 'Rollback', content: 'Install 1.x again; the old config file is still read until 3.0.' }], {
    layout: 'stacked',
  });

  doc.divider();
  doc.body('Full details are in the changelog.', { style: 'note', align: 'center' });
};

exampleGettingStarted();
exampleCommandReference();
exampleCustomizedReleaseNotes();
