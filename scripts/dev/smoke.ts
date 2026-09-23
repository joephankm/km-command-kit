import taskLog from '@/utils/shellLog/taskLog/taskLog';

/**
 * Holds the run up for a moment, so the durations printed below are not all zero.
 */
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

console.log('===== durations on every line that closes a level =====\n');

taskLog.start('Release the toolkit', { successMessage: 'Toolkit released' });

taskLog.doing('Build the bundle', { step: true, totalSteps: 2, successMessage: 'Bundle built' });
taskLog.sub('Compile the sources', { step: true, successMessage: 'Done' });
await wait(120);
taskLog.sub('Write the manifest', { step: true, successMessage: 'Done' });
await wait(60);

taskLog.doing('Upload the bundle', { step: true, successMessage: 'Bundle uploaded' });
await wait(200);

taskLog.done();

console.log('\n===== durations on a failed run =====\n');

taskLog.start('Release the toolkit', { successMessage: 'Toolkit released' });
taskLog.doing('Build the bundle', { step: true, successMessage: 'Bundle built' });
await wait(90);
taskLog.fail('The bundle did not build', { exit: false });

console.log('\n===== a run logging wall-clock time instead =====\n');

taskLog.start('Release the toolkit', { successMessage: 'Toolkit released' }, { time: 'logTime' });
taskLog.doing('Build the bundle', { step: true, successMessage: 'Bundle built' });
await wait(50);
taskLog.done();
