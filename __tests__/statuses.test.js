// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
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
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(302);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
    });

    expect(response.statusCode).toBe(302);
  });

  it('create', async () => {
    const params = testData.statuses.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const status = await models.taskStatus.query().findOne({ name: params.name });
    expect(status).toMatchObject(expected);
  });

  it('read', async () => {
    const params = testData.statuses.existing;
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const status = await models.taskStatus.query().findOne({ name: params.name });
    expect(status).toMatchObject(expected);
  });

  // it('update', async () => {
  //   const params = testData.statuses.updated;
  //   const response = await app.inject({
  //     method: 'PATCH',
  //     url: '/statuses/2',
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   expect(response.statusCode).toBe(302);
  //   const expected = params;
  //   const status = await models.taskStatus.query().findOne({ id: 2 });
  //   console.log(status);
  //   expect(status).toMatchObject(expected);
  // });

  // it('delete', async () => {
  //   const paramsExisting = testData.statuses.new;
  //   const responseExisting = await app.inject({
  //     method: 'GET',
  //     url: '/statuses/3/edit',
  //     payload: {
  //       data: paramsExisting,
  //     },
  //   });

  //   expect(responseExisting.statusCode).toBe(302);

  //   const params = testData.statuses.new;
  //   const response = await app.inject({
  //     method: 'DELETE',
  //     url: '/statuses/3',
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   expect(response.statusCode).toBe(302);
  //   const expected = undefined;
  //   const status = await models.taskStatus.query().findOne({ id: 3 });
  //   console.log(status);
  //   expect(status).toBe(expected);
  // });

  afterEach(async () => {
    await knex('task_statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
