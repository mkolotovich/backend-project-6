// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test tasks CRUD', () => {
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
      url: app.reverse('tasks'),
    });

    expect(response.statusCode).toBe(302);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
    });

    expect(response.statusCode).toBe(302);
  });

  it('create', async () => {
    const params = testData.tasks.new;
    await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
    });

    const expected = params;
    const task = await models.task.query().findOne({ name: params.name });
    expect(task).toMatchObject(expected);
  });

  it('read', async () => {
    const params = testData.tasks.existing;
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const task = await models.task.query().findOne({ name: params.name });
    expect(task).toMatchObject(expected);
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
