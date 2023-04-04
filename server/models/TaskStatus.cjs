// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');
const Task = require('./Task.cjs');

const unique = objectionUnique({ fields: ['name'] });

module.exports = class TaskStatus extends unique(BaseModel) {
  static get tableName() {
    return 'taskStatuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }

  static relationMappings() {
    return {
      task: {
        relation: BaseModel.HasOneRelation,
        modelClass: Task,
        join: {
          from: 'taskStatuses.id',
          to: 'tasks.status_id',
        },
      },
    };
  }
};
