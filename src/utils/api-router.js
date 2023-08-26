import { Router } from 'express';
import make from '../services/make';
import authenticated from '../middleware/is-authenticated';
import account from '../middleware/is-account';

export default class ApiRouter {
  router;

  constructor() {
    this.router = Router();
  }

  addPattern(method, pattern, controller, ...mw) {
    this.router[method](pattern, ...mw, make(controller));
  }

  addIsAuthenticatedPattern(method, pattern, controller, ...mw) {
    this.router[method](pattern, authenticated, ...mw, make(controller));
  }

  addIsAdminPattern(method, pattern, controller, ...mw) {
    this.router[method](
      pattern,
      authenticated,
      account('admin'),
      ...mw,
      make(controller)
    );
  }

  addIsUserPattern(method, pattern, controller, ...mw) {
    this.router[method](
      pattern,
      authenticated,
      account('user'),
      ...mw,
      make(controller)
    );
  }

  use(mw) {
    this.router.use(mw);
  }

  getExpressRouter() {
    return this.router;
  }
}

export const HttpMethod = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
};
