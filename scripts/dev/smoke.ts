import { configureLogger, logger } from '@/utils/shellLog';

configureLogger({ verbose: true });

logger.verbose('verbose message (hidden by default)');
logger.info('info message');
logger.warn('warn message');
logger.error('error message', 'error detail');

logger.verbose('verbose message (now enabled)', 'detail');
