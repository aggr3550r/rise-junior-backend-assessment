import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createConnection } from 'typeorm';
import logger from './utils/logger.util';
import { configService } from './config/config.service';
import AllExceptionsFilter from './filters/app-exception.filter';

import * as ref from 'reflect-metadata';

createConnection(configService.getTypeOrmConfig())
  .then(() => {
    console.log('*** -----  Database connected ----- ***');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

import routes from './routes';

const app = express();

app.use(logger.getMiddleware());

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use('/api/v1', routes);

// Middleware that captures and handles all uncaught exceptions
app.use(AllExceptionsFilter);

export { app };
