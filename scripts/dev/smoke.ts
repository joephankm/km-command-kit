import { parseCommand } from '@/utils/shellCommand';

const check = (label: string, run: () => unknown): void => {
  try {
    console.log(label, '→', run());
  } catch (error) {
    console.log(label, '→ throws:', (error as Error).message);
  }
};

check(
  'array default',
  () => parseCommand({ args: { source: { type: 'string', fromPosition: 0, default: ['x'] } } }).args
);
check('no default', () => parseCommand({ args: { source: { type: 'string', fromPosition: 0 } } }).args);
check(
  'string default',
  () => parseCommand({ args: { source: { type: 'string', toPosition: -1, default: 'x' } } }).args
);
check(
  'range with position',
  () => parseCommand({ args: { source: { type: 'string', fromPosition: 0, position: 1 } } }).args
);
