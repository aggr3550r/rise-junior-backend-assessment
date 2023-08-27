const { default: logger } = require('../utils/logger');
const { Redirect } = require('../utils/redirect');

module.exports = (controller) => async (request, response) => {
  try {
    const data = await controller(request, response);

    if (!data) {
      return;
    }
    if (data instanceof Redirect) {
      return response.redirect(data.route);
    }
    response.status(data.status).send(data.message);
  } catch (e) {
    const log = logger.getLogger();

    response.locals.message = e.message;
    response.locals.error = e;

    const status = e.status || 500;

    log.error(
      `${status} - ${e.message} - ${request.originalUrl} - ${request.method} - ${request.ip}`,
      e
    );

    return response.status(status).send({ message: e.message });
  }
};
