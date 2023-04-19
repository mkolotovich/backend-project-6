// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test labels CRUD', () => {
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
      url: app.reverse('labels'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.labels.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(200);
    const expected = params;
    const label = await models.label.query().findOne({ name: params.name });
    expect(label).toMatchObject(expected);
  });

  it('read', async () => {
    const params = testData.labels.existing;
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(200);
    const expected = params;
    const label = await models.label.query().findOne({ name: params.name });
    expect(label).toMatchObject(expected);
  });

  it('update', async () => {
    const params = testData.labels.updated;
    const response = await app.inject({
      method: 'PATCH',
      url: '/labels/2',
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = params;
    const label = await models.label.query().findOne({ id: 2 });
    expect(label).toMatchObject(expected);
  });

  it('delete', async () => {
    const paramsExisting = testData.labels.new;
    const responseExisting = await app.inject({
      method: 'GET',
      url: '/labels/1/edit',
      payload: {
        data: paramsExisting,
      },
    });

    expect(responseExisting.statusCode).toBe(200);

    const params = testData.labels.new;
    const response = await app.inject({
      method: 'DELETE',
      url: '/labels/2',
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = undefined;
    const label = await models.label.query().findOne({ id: 2 });
    console.log(label);
    expect(label).toBe(expected);
  });

  afterEach(async () => {
    await knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
