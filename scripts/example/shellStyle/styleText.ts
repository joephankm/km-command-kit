import { style, styleCode } from '@/utils/shellStyle';
import type { ShellPresetStyleName } from '@/utils/shellStyle/configs/styleConfig';

/**
 * Escape character that begins an ANSI control sequence, for the raw codes below.
 */
const ESC = '\u001B';

/**
 * Every preset, grouped the way the config groups them.
 */
const exampleSemanticStyles = (): void => {
  const groups: Record<string, ShellPresetStyleName[]> = {
    'Log and status': ['info', 'verbose', 'warn', 'error', 'success', 'side'],
    Emphasis: ['highlight', 'emphasize', 'delete', 'mute', 'attach'],
    Titles: ['title', 'subtitle', 'heading', 'label', 'subtle'],
    Structure: ['border'],
  };

  console.log(`\n${style.heading('Every preset')}`);

  for (const [group, names] of Object.entries(groups)) {
    console.log(style.subtitle(`  ${group}`));

    for (const name of names) console.log(`    ${style[name](name.padEnd(12))} ${style.subtle(`style.${name}()`)}`);
  }
};

/**
 * One style set inside another, each closing only what it opened.
 */
const exampleNestedStyles = (): void => {
  console.log(`\n${style.heading('Nesting')}`);

  console.log(`  ${style.emphasize(`bold ${style.error('and red')} still bold`)}`);
  console.log(`  ${style.label(`dim ${style.title('and a title')} still dim`)}`);
};

/**
 * The two shapes beyond wrapping text: an opening code alone, and closing into another style.
 */
const exampleOpenAndClose = (): void => {
  console.log(`\n${style.heading('Opening and closing by hand')}`);

  // Opened once, so everything after it carries the border style until the colour is closed.
  const opened = style.border();
  const titled = style.title('a title', style.border());
  const closed = `${ESC}[${styleCode(['resetColor'])}m`;

  console.log(`  ${opened}──── ${titled} ────${closed}`);
};

/**
 * A code composed from raw names, for what the presets do not cover.
 */
const exampleRawCodes = (): void => {
  console.log(`\n${style.heading('Raw codes')}`);

  const codes = [
    ['bold', 'underline', 'cyan'],
    ['bgRed', 'white'],
    ['italic', 'brightGreen'],
  ] as const;

  for (const names of codes) {
    const code = styleCode(names);

    console.log(`  ${ESC}[${code}m ${names.join(' + ').padEnd(24)} ${ESC}[0m ${style.subtle(`'${code}'`)}`);
  }
};

exampleSemanticStyles();
exampleNestedStyles();
exampleOpenAndClose();
exampleRawCodes();
