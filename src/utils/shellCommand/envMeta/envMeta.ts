import { existsSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { RunLevel, RunType } from './constants';
import { runtimeInfo, serverInfo } from './envInfo';
import { metaFunc } from './metaCache';

/**
 * The facts about the current run, each one worked out on its function's first call and kept for
 * the later ones.
 */
const envMeta = {
  /**
   * Get what is running the command.
   */
  runner: metaFunc('runner', () => {
    const execArgv = process.execArgv.join(' ');

    if (execArgv.includes('tsx')) return 'tsx';
    if (execArgv.includes('ts-node')) return 'ts-node';
    return basename(process.argv[0]!);
  }),

  /**
   * Get the package manager in use.
   */
  packageManager: metaFunc('packageManager', () => {
    // The current folder's `package.json` names it, or else the one that launched the run does.
    const path = join(process.cwd(), 'package.json');

    if (existsSync(path)) {
      const { packageManager, devEngines } = JSON.parse(readFileSync(path, 'utf8')) as {
        packageManager?: string;
        devEngines?: { packageManager?: { name?: string } };
      };
      // The top-level field carries a version too, as in `pnpm@11.22.0`.
      const name = packageManager?.split('@')[0] ?? devEngines?.packageManager?.name;

      if (name) return name;
    }

    return (process.env.npm_config_user_agent ?? '').split('/')[0] || undefined;
  }),

  /**
   * Get the level the command runs at.
   */
  level: metaFunc('level', () => {
    const { npm_lifecycle_event: scriptName } = process.env;
    return scriptName && scriptName !== 'npx' ? RunLevel.Package : RunLevel.Direct;
  }),

  /**
   * Get the type of the run.
   */
  runType: metaFunc('runType', () =>
    // A run listening on a TCP port is a server.
    process.getActiveResourcesInfo().includes('TCPServerWrap') ? RunType.Server : RunType.Job
  ),

  /**
   * Get the command that calls directly, without its options and arguments.
   */
  directCommand: metaFunc('directCommand', (): string => {
    // A package script may run from another folder, so the path starts where the call was made.
    const scriptPath = relative(process.env.INIT_CWD ?? process.cwd(), process.argv[1]!);
    return `${envMeta.runner()} ${scriptPath}`;
  }),

  /**
   * Get the command that calls the running package script, without its options and arguments.
   */
  packageCommand: metaFunc('packageCommand', (): string | undefined => {
    const { npm_lifecycle_event: scriptName } = process.env;
    const packageManager = envMeta.packageManager();

    // NOTE: `npx` sets the script name to `npx`, left unhandled since it rarely runs a script. Add
    // logic for it only if calling a package command through it turns out to be useful.
    return scriptName && packageManager ? `${packageManager} run ${scriptName}` : undefined;
  }),

  /**
   * Get the command of the current run, without its options and arguments.
   */
  command: metaFunc('command', (): string | undefined =>
    envMeta.level() === RunLevel.Package ? envMeta.packageCommand() : envMeta.directCommand()
  ),

  runtimeInfo,

  serverInfo,
};

export default envMeta;
