import userRouter from './user';
import fileRouter from './file';
import authRouter from './auth';
import folderRouter from './folder';

const make = require('../services/make');

const router = require('express').Router();

router.get('/healthy', (req: any, res: any) => {
  return res.sendStatus(200);
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/file', fileRouter);
router.use('/folder', folderRouter);

export default router;
