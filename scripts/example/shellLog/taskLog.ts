import { task } from '@/utils/shellLog';

/**
 * Stands in for the real work each step would do.
 */
const work = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A run of plain actions, each closing with the message it opened with.
 */
const exampleSimpleRun = async (): Promise<void> => {
  task.start('Release the toolkit (simple)', { successMessage: 'Toolkit released' });

  await work(300);

  task.done();
};

/**
 * A run counting its actions as steps, with operations under one of them.
 */
const exampleSteppedRun = async (): Promise<void> => {
  task.start('Release the toolkit (stepped run)', { successMessage: 'Toolkit released' });

  task.doing('Install dependencies', { step: true, totalSteps: 2, successMessage: 'Dependencies installed' });
  await work(150);

  task.doing('Build the bundle', { step: true, successMessage: 'Bundle built' });

  task.sub('Compile the sources', { step: true, successMessage: 'Sources compiled' });
  await work(220);

  task.sub('Write the manifest', { step: true, successMessage: 'Manifest written' });
  await work(90);

  task.done();
};

/**
 * A run uploading two processes at once, each ended on its own.
 */
const exampleConcurrentRun = async (): Promise<void> => {
  task.start('Release the toolkit (concurrent run)', { successMessage: 'Toolkit released' });

  task.doing('Upload the archive', { processLabel: 'archive', successMessage: 'Archive uploaded' });
  task.doing('Upload the checksums', { processLabel: 'checksums', successMessage: 'Checksums uploaded' });
  await work(140);

  task.done({ processLabel: 'archive' });
  await work(60);
  task.done({ processLabel: 'checksums' });
};

/**
 * A run ended by an error instead of a success.
 */
const exampleFailedRun = async (): Promise<void> => {
  task.start('Release the toolkit (failed run)', { successMessage: 'Toolkit released' });

  task.doing('Build the bundle', { successMessage: 'Bundle built' });
  await work(110);

  task.fail(new TypeError('bundle is not a function'), { exit: false });
};

await exampleSimpleRun();
await exampleSteppedRun();
await exampleConcurrentRun();
await exampleFailedRun();
