import http from 'http';
import logger from '../utils/logger';
import { app } from './server';
import { configService } from './config/config.service';

const PORT = configService.getPort() || '8000';

const log = logger.getLogger();

http.createServer(app).listen(PORT, () => {
  log.info(`HTTP Server started on port ${PORT}`);
});
