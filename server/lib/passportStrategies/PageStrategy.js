// @ts-check

import { Strategy } from '@fastify/passport';

export default class PageStrategy extends Strategy {
  constructor(name, app) {
    super(name);
    this.app = app;
  }

  async authenticate(request) {
    if (request.isAuthenticated()) {
      return this.success(true);
    }

    return this.fail();
  }
}
