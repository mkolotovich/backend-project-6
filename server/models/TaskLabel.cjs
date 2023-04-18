// @ts-check
const objectionUnique = require('objection-unique');
const BaseModel = require('./BaseModel.cjs');

const unique = objectionUnique({ fields: ['email'] });

module.exports = class TaskLabel extends unique(BaseModel) {
  static get tableName() {
    return 'tasksLabels';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_id', 'label_id'],
      properties: {
        id: { type: 'integer' },
        task_id: { type: 'integer', minimum: 1 },
        label_id: { type: 'integer' },
      },
    };
  }
};
