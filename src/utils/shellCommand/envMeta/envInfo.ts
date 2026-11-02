import { type AddressInfo, Server } from 'node:net';
import { hostname, networkInterfaces } from 'node:os';
import { Server as TlsServer } from 'node:tls';
import os from 'os';
import { getMeta, metaFunc } from './metaCache';

/**
 * Get the info of the machine and the run.
 */
export const runtimeInfo = () => {
  // The machine's info is kept from the first call, while the uptime, in seconds, and the memory,
  // in bytes, are read on each call.
  const machine = getMeta('runtimeInfo', () => {
    const PLATFORMS: Record<string, string> = { darwin: 'macOS', linux: 'Linux', win32: 'Windows' };

    return {
      nodeVersion: process.version,
      platform: `${PLATFORMS[process.platform] ?? process.platform} (${os.arch()})`,
      pid: process.pid,
      hostname: hostname(),
    };
  });

  return { ...machine, uptime: process.uptime(), memory: process.memoryUsage().rss };
};

/**
 * Get the info of the server the run is on.
 *
 * Call it once the server listens. Its first call is kept for the whole run, so a call made before
 * then keeps no host or port, even after the server starts listening.
 *
 * @example
 * app.listen(3000, () => {
 *   console.log(envMeta.serverInfo());
 *   // { ip: '192.168.1.10', host: '::', port: 3000, tls: false, keepAliveTimeout: 5000 }
 * });
 */
export const serverInfo = metaFunc('serverInfo', () => {
  const addresses = Object.values(networkInterfaces()).flat();

  // NOTE: Node has no public way to reach its servers, so this reads its undocumented handles.
  const { _getActiveHandles: getHandles } = process as unknown as { _getActiveHandles: () => unknown[] };
  const server = getHandles().find(
    (handle): handle is Server & { keepAliveTimeout?: number } =>
      handle instanceof Server && typeof handle.address() === 'object' && handle.address() !== null
  );
  const listening = server?.address() as AddressInfo | undefined;

  return {
    ip: addresses.find(address => address?.family === 'IPv4' && !address.internal)?.address,
    // The server's own info is left out when nothing listens on a port.
    ...(server &&
      listening && {
        host: listening.address,
        port: listening.port,
        tls: server instanceof TlsServer,
        // Only an HTTP or HTTPS server has a keep-alive timeout.
        ...(server.keepAliveTimeout !== undefined && { keepAliveTimeout: server.keepAliveTimeout }),
      }),
  };
});
