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
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    // TODO: пока один раз перед тестами
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
  });

  beforeEach(async () => {
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
    });

    expect(response.statusCode).toBe(200);
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

    expect(response.statusCode).toBe(200);
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

    expect(response.statusCode).toBe(200);
    const expected = params;
    const status = await models.taskStatus.query().findOne({ name: params.name });
    expect(status).toMatchObject(expected);
  });

  // it('update', async () => {
  //   const params = testData.statuses.updated;
  //   const response = await app.inject({
  //     method: 'PATCH',
  //     url: '/statuses/:id',
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   expect(response.statusCode).toBe(200);
  //   const expected = params;
  //   const status = await models.taskStatus.query().findOne({ id: 2 });
  //   // const status = await models.taskStatus.query().findOne({ name: params.name });
  //   console.log(status);
  //   expect(status).toMatchObject(expected);
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
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
