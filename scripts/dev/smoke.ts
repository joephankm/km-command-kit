import { task } from '@/utils/shellLog';

/**
 * Pause helper so elapsed durations are visibly non-zero.
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// --- Job 1: implicit single Task, deferred messages, flags, then concurrent Tasks ---
task.start('Build toolkit', { totalSteps: 3, successMessage: 'Toolkit build finished' });

task.step('Compile sources', { successMessage: 'Sources compiled' });
await sleep(120);
task.step('Bundle output', { successMessage: 'Output bundled' }); // flushes "Sources compiled"; Steps show a duration only from here on
await sleep(80);
task.flag('bundle upload retried');
task.flag('bundle upload retried'); // duplicate — must collapse to one printed line
task.step('Write manifest'); // prints the flag line INSTEAD of "Output bundled"
await sleep(60);

task.do('Generate types', { totalSteps: 2, successMessage: 'Types generated' }); // first do() — no Task duration yet
await sleep(50);
task.step('Scan entry points');
await sleep(50);
task.step('Emit declarations');
await sleep(50);
task.flag({ task: 'type generation reused a stale cache' });
task.do('Copy assets', { successMessage: 'Assets copied' }); // prints the Task-level flag INSTEAD of "Types generated", plus the Task's duration
await sleep(50);

task.do('Upload assets', { taskId: 'upload', successMessage: 'Assets uploaded' });
task.do('Run migrations', { taskId: 'migrate', successMessage: 'Migrations applied' });
task.do('Warm caches', { taskId: 'cache' });
await sleep(70);
task.step('Push to CDN', { taskId: 'upload' });
await sleep(40);
task.succeed('Upload finished', { taskId: 'upload' }); // ends only that Task; the other Tasks and the Job keep running
await sleep(40);
task.flag({ job: 'ran with degraded network' });
task.succeed(); // ambiguous (3 Tasks still open): warns via logger, flushes the Job flag, surfaces every pending message, then per-Task durations + total

// --- Job 2: quiet neutral finish ---
task.start('Inspect environment', { kind: 'create' });
task.do('Check node version');
await sleep(30);
task.done(); // no message, no duration — just ends the Job

// --- Job 3: logTime mode ---
task.start('Nightly report', { duration: 'logTime', successMessage: 'Report generated' });
task.do('Collect metrics'); // timestamp shows even on the FIRST do(), unlike elapsed mode
await sleep(60);
task.do('Render summary');
await sleep(60);
task.succeed(); // Task lines show timestamps; the Job total is still a real elapsed duration

// Not demonstrated here because each terminates the process before later scenarios could run:
// fail() (exits 1 by default), and succeed()/done() with { exit: true } (exit 0).
