/**
 * Levels of how a command is run.
 */
export enum RunLevel {
  /**
   * The script file is run directly.
   */
  Direct = 0,

  /**
   * A package manager runs the script, defined in `package.json`'s `scripts`.
   */
  Package = 1,
}

/**
 * Types of how long a program runs.
 */
export enum RunType {
  /**
   * A one-time run that does its work and exits.
   */
  Job = 'job',

  /**
   * A long-running program that handles incoming requests, over HTTP, HTTPS, sockets or gRPC.
   */
  Server = 'server',

  // /**
  //  * A one-time run started on a schedule, that does its work and exits.
  //  */
  // Cron = 'cron',

  // /**
  //  * A long-running program in the background, not necessarily open to incoming connections.
  //  */
  // Service = 'service',

  // /**
  //  * A long-running program that takes jobs from a queue and processes them.
  //  */
  // Worker = 'worker',
}
