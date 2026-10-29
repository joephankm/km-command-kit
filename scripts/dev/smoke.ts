import { parseCommand } from '@/utils/shellCommand';

const params = {
  options: [
    {
      title: 'Container Options',
      items: {
        detach: { type: 'boolean', short: 'd', description: 'Run the container in the background' },
        name: { type: 'string', description: 'Assign a name to the container' },
      },
    },
  ],
  args: {
    image: { type: 'string', position: 0, description: 'The image to run' },
    command: { type: 'string', position: 1, description: 'The command to run in the container' },
  },
  manual: {
    description: 'Create and run a new container from an image.',
    usages: 'docker run [options] <image> [command]',
    examples: [{ label: 'Detached', example: 'docker run -d nginx' }],
  },
} as const;

console.log('--- without --help: parsed');
process.argv = ['node', 'smoke', '-d', '--name', 'web', 'nginx', 'sh'];
console.log(JSON.stringify(parseCommand(params)));

console.log('--- with --help: the manual, then the process ends');
process.argv = ['node', 'smoke', 'nginx', '--help'];
parseCommand(params);
console.log('not reached');
