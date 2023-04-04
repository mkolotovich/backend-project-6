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
    app = fastify({ logger: { prettyPrint: true } });
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

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.tasks.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(200);
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

    expect(response.statusCode).toBe(200);
    const expected = params;
    const task = await models.task.query().findOne({ name: params.name });
    expect(task).toMatchObject(expected);
  });

  // it('update', async () => {
  //   const params = testData.tasks.updated;
  //   const response = await app.inject({
  //     method: 'PATCH',
  //     url: '/tasks/2',
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   expect(response.statusCode).toBe(200);
  //   const expected = params;
  //   const status = await models.taskStatus.query().findOne({ id: 2 });
  //   console.log(status);
  //   expect(status).toMatchObject(expected);
  // });

  // it('delete', async () => {
  //   const paramsExisting = testData.tasks.new;
  //   const responseExisting = await app.inject({
  //     method: 'GET',
  //     url: '/users/:id/edit',
  //     payload: {
  //       data: paramsExisting,
  //     },
  //   });

  //   expect(responseExisting.statusCode).toBe(302);

  //   const params = testData.tasks.new;
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
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
