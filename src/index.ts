import http from 'http';
import logger from './utils/logger.util';
import { app } from './server';
import { configService } from './config/config.service';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

process.on('unhandledException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const PORT = configService.getPort() || '8000';

const log = logger.getLogger();

process.on('unhandledException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});


http.createServer(app).listen(PORT, () => {
  log.info(`HTTP Server started on port ${PORT}`);
});
