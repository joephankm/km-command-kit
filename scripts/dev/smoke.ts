import { parseCommand } from '@/utils/shellCommand';

const { options, args } = parseCommand({
  options: {
    level: { type: 'string', short: 'l', default: 'info' },
    verbose: { type: 'boolean', short: 'v' },
    tag: { type: 'string', multiple: true },
  },
});

const level: string = options.level;
const verbose: boolean | undefined = options.verbose;
const tags: string[] | undefined = options.tag;

console.log({ level, verbose, tags, args });
