// @ts-check

import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('search tests', () => {
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

  it('status search', async () => {
    const params = testData.tasks.new;
    const response = await app.inject({
      method: 'GET',
      url: '/tasks?status=1&executor=&label=',
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const task = await models.task.query().findOne({ statusId: 1 });
    expect(task).toMatchObject(expected);
  });

  it('executor search', async () => {
    const params = testData.tasks.new;
    const response = await app.inject({
      method: 'GET',
      url: '/tasks?status=&executor=1&label=',
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const task = await models.task.query().findOne({ executorId: 1 });
    expect(task).toMatchObject(expected);
  });

  it('label search', async () => {
    const params = testData.taskLabels.new;
    const response = await app.inject({
      method: 'GET',
      url: '/tasks?status=&executor=&label=1',
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const task = await models.taskLabel.query().findOne({ taskId: 1 });
    expect(task).toMatchObject(expected);
  });

  it('currentUser search', async () => {
    const params = testData.tasks.new;
    await app.inject({
      method: 'GET',
      url: '/tasks?status=&executor=&label=&isCreatorUser=on',
    });

    const expected = params;
    const task = await models.task.query().findOne({ creatorId: 1 });
    expect(task).toMatchObject(expected);
  });

  afterEach(async () => {
    await knex('tasks_labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
