import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import logger from '../utils/logger';
import { configService } from './config/config.service';
const app = express();

createConnection(configService.getTypeOrmConfig())
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

app.use(logger.getMiddleware());

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// app.use('/api/v1', routes);

export { app };
