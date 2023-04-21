// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(200);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('read', async () => {
    const params = testData.users.existing;
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(200);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  // it('update', async () => {
  //   const params = testData.users.updated;
  //   const response = await app.inject({
  //     method: 'PATCH',
  //     url: '/users/2',
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   // expect(response.statusCode).toBe(200);
  //   const expected = {
  //     ..._.omit(params, 'password'),
  //     passwordDigest: encrypt(params.password),
  //   };
  //   const user = await models.user.query().findOne({ id: 2 });
  //   console.log(user);
  //   expect(user).toMatchObject(expected);
  // });

  // it('delete', async () => {
  //   const paramsExisting = testData.users.new;
  //   const responseExisting = await app.inject({
  //     method: 'GET',
  //     url: '/users/:id/edit',
  //     payload: {
  //       data: paramsExisting,
  //     },
  //   });

  //   expect(responseExisting.statusCode).toBe(302);

  //   const params = testData.users.new;
  //   const response = await app.inject({
  //     method: 'DELETE',
  //     url: '/users/:id',
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   expect(response.statusCode).toBe(302);
  //   const expected = {
  //     ..._.omit(params, 'password'),
  //     passwordDigest: encrypt(params.password),
  //   };
  //   // const user = await models.user.query().findOne({ email: params.email });
  //   const user = await models.user.query().findOne({ email: paramsExisting.email });
  //   console.log(user);
  //   expect(user).toMatchObject(expected);
  // });

  afterEach(async () => {
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
