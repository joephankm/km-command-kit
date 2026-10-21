import { style, styleCode } from '@/utils/shellStyle';
import type { ShellPresetStyleName } from '@/utils/shellStyle/configs/styleConfig';
import type { ShellNatureStyleName } from '@/utils/shellStyle/constants/shellStyleCodes';
import { styleFunc } from '@/utils/shellStyle/styleText/styleFunc';
import {
  closeCode,
  createStyleFuncMap,
  styleFuncByCode,
  textStyleFunc,
} from '@/utils/shellStyle/styleText/styleFuncByCode';

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

    for (const name of names) {
      console.log(`    ${style[name](name.padEnd(14))} ${style.subtle(`style.${name}()`)}`);
    }
  }
};

/**
 * Every nature style: the plain decorations, and a reset of every style.
 */
const exampleNatureStyles = (): void => {
  console.log(`\n${style.heading('Every nature style')}`);

  const names: ShellNatureStyleName[] = ['bold', 'italic', 'underline', 'strikethrough', 'hidden', 'reset'];

  for (const name of names) {
    console.log(`    ${style[name](name.padEnd(14))} ${style.subtle(`style.${name}()`)}`);
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
 * A code composed from raw names, and the code that turns the same names off.
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
    const close = closeCode(names);

    console.log(
      `  ${ESC}[${code}m ${names.join(' + ').padEnd(24)} ${ESC}[${close}m ` +
        style.subtle(`opens '${code}', closes '${close}'`)
    );
  }
};

/**
 * Style functions made outside the presets: from raw SGR codes, and from code names.
 */
const exampleStyleFunctions = (): void => {
  console.log(`\n${style.heading('Style functions of your own')}`);

  // From raw SGR codes, opening with one and closing with the other.
  const tag = styleFunc('1;45', '22;49');
  console.log(`  ${tag(' TAG ')} ${style.subtle("styleFunc('1;45', '22;49')")}`);

  // From code names, closing each of them on its own, so it nests like a preset.
  const note = styleFuncByCode(['italic', 'brightCyan']);
  console.log(`  ${note(`italic cyan ${style.emphasize('and bold')} still italic cyan`)}`);
};

/**
 * One way to name a style anywhere a style is taken: a preset name, or a list of code names.
 */
const exampleTextStyles = (): void => {
  console.log(`\n${style.heading('A preset name or code names')}`);

  console.log(`  ${textStyleFunc('success')('a preset by name')}`);
  console.log(`  ${textStyleFunc(['bold', 'magenta'])('a style from code names')}`);

  // A map of named styles, each turned into its style function once.
  const styles = createStyleFuncMap({ path: ['underline', 'cyan'], size: 'subtle', danger: ['bold', 'red'] });

  console.log(`  ${styles.path('src/index.ts')}  ${styles.size('4 KB')}  ${styles.danger('deleted')}`);
};

exampleSemanticStyles();
exampleNatureStyles();
exampleNestedStyles();
exampleOpenAndClose();
exampleRawCodes();
exampleStyleFunctions();
exampleTextStyles();
