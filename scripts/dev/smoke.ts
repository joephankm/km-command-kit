import { parseCommand } from '@/utils/shellCommand';

const { options } = parseCommand({
  options: { verbose: { type: 'boolean', short: 'v' } },
  manual: { description: 'Print a greeting, louder with --verbose.' },
});

console.log('parsed, no --help given:', options);
