import winston from 'winston';
import morgan, { StreamOptions } from 'morgan';

const winstonConfig = {
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

class LoggerUtility {
  logger: winston.Logger;
  middleware: any;

  constructor() {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console(winstonConfig.console)],
      exitOnError: false,
    });

    const stream: StreamOptions = {
      write: (message: string) => {
        this.logger.http(message);
      },
    };
    this.middleware = morgan('combined', { stream });
  }

  getMiddleware() {
    return this.middleware;
  }

  getLogger() {
    return this.logger;
  }
}

const logger = new LoggerUtility();

export default logger;
