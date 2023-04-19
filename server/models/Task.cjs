// @ts-check
const path = require('node:path');

const objectionUnique = require('objection-unique');
const BaseModel = require('./BaseModel.cjs');
const TaskStatus = require('./TaskStatus.cjs');
const Label = require('./Label.cjs');

const unique = objectionUnique({ fields: ['email'] });

module.exports = class Task extends unique(BaseModel) {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer', minimum: 1 },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
      },
    };
  }

  static relationMappings() {
    return {
      status: {
        relation: BaseModel.HasOneRelation,
        modelClass: TaskStatus,
        join: {
          from: 'tasks.status_id',
          to: 'taskStatuses.id',
        },
      },
      author: {
        relation: BaseModel.HasOneRelation,
        modelClass: path.join(__dirname, 'User.cjs'),
        join: {
          from: 'tasks.creator_id',
          to: 'users.id',
        },
      },
      executor: {
        relation: BaseModel.HasOneRelation,
        modelClass: path.join(__dirname, 'User.cjs'),
        join: {
          from: 'tasks.executor_id',
          to: 'users.id',
        },
      },
      label: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Label,
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.task_id',
            to: 'tasks_labels.label_id',
          },
          to: 'labels.id',
        },
      },
    };
  }
};
