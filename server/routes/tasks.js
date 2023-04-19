// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const {
        status, executor, label, isCreatorUser,
      } = req.query;
      const tasks = await app.objection.models.task.query();
      let filteredTasks = tasks;
      if (status) {
        if (executor && label && isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('label.id', '=', label)
            .where('executor_id', '=', executor)
            .where('creator_id', '=', req.user.id);
        } else if (executor && label) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('label.id', '=', label)
            .where('executor_id', '=', executor);
        } else if (executor && isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('executor_id', '=', executor)
            .where('creator_id', '=', req.user.id);
        } else if (label && isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('label.id', '=', label)
            .where('creator_id', '=', req.user.id);
        } else if (label) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('label.id', '=', label);
        } else if (executor) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('executor_id', '=', executor);
        } else if (isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status)
            .where('creator_id', '=', req.user.id);
        } else {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('status_id', '=', status);
        }
      } else if (executor) {
        if (label && isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('executor_id', executor)
            .where('creator_id', '=', req.user.id)
            .where('label.id', '=', label);
        } else if (label) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('executor_id', executor)
            .where('label.id', '=', label);
        } else if (isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('executor_id', executor)
            .where('creator_id', '=', req.user.id);
        } else {
          filteredTasks = await app.objection.models.task.query().withGraphJoined('[status, author, executor, label]').where('executor_id', executor);
        }
      } else if (label) {
        if (isCreatorUser) {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('label.id', '=', label)
            .where('creator_id', '=', req.user.id);
        } else {
          filteredTasks = await app.objection.models.task.query()
            .withGraphJoined('[status, author, executor, label]')
            .where('label.id', '=', label);
        }
      } else if (isCreatorUser) {
        filteredTasks = await app.objection.models.task.query()
          .withGraphJoined('[status, author, executor, label]')
          .where('creator_id', '=', req.user.id);
      } else {
        const tasksFormatted = filteredTasks.map(async (el) => {
          const taskFormatted = el;
          const statusName = await app.objection.models.taskStatus.query()
            .where('id', '=', taskFormatted.statusId);
          const author = await app.objection.models.user.query()
            .where('id', '=', taskFormatted.creatorId);
          const executorFullName = await app.objection.models.user.query()
            .where('id', '=', taskFormatted.executorId);
          [taskFormatted.status] = statusName;
          [taskFormatted.author] = author;
          taskFormatted.executor = executorFullName.length ? executorFullName[0] : null;
          return taskFormatted;
        });
        await Promise.all(tasksFormatted);
      }
      const taskStatuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/index', {
        tasks: filteredTasks, taskStatuses, users, labels, status, executor, label, isCreatorUser,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      const task = new app.objection.models.task();
      const taskStatuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/new', {
        task, taskStatuses, users, labels,
      });
      return reply;
    })
    .post('/tasks', async (req, reply) => {
      const task = new app.objection.models.task();
      const { labels } = req.body.data;
      task.$set(req.body.data);
      try {
        const newTask = { ...req.body.data, creatorId: Number(req.user.id) };
        newTask.statusId = Number(newTask.statusId);
        newTask.executorId = Number(newTask.executorId);
        const user = await app.objection.models.user.query().findById(newTask.creatorId);
        await app.objection.models.label.transaction(async (trx) => {
          const taskUser = await user.$relatedQuery('owner', trx).insert({
            name: newTask.name,
            description: newTask.description,
            statusId: newTask.statusId,
            creatorId: newTask.creatorId,
            executorId: newTask.executorId,
          }).debug();
          if (Array.isArray(labels)) {
            const taskLabels = labels.map(async (label) => {
              const taskLabel = await app.objection.models.taskLabel.query(trx).insert({
                task_id: taskUser.id,
                label_id: Number(label),
              }).debug();
              return taskLabel;
            });
            return Promise.all(taskLabels);
          } if (typeof labels === 'string') {
            const taskLabel = await app.objection.models.taskLabel.query(trx).insert({
              task_id: taskUser.id,
              label_id: Number(labels),
            }).debug();
            return taskLabel;
          }
          return taskUser;
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        console.log(data);
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const taskStatuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        reply.render('tasks/new', {
          task, taskStatuses, users, errors: data,
        });
      }
      return reply;
    })
    .get('/tasks/:id', async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      const statusName = await app.objection.models.taskStatus.query()
        .select('name')
        .where('id', '=', task.statusId);
      const labels = await app.objection.models.taskLabel.query()
        .select('label_id')
        .where('task_id', '=', task.id);
      const labelIds = labels.map(async (el) => {
        const label = await app.objection.models.label.query()
          .select('name')
          .where('id', '=', el.labelId).first();
        return label;
      });
      const labelsNames = await Promise.all(labelIds);
      const author = await app.objection.models.user.query()
        .select('firstName', 'lastName')
        .where('id', '=', task.creatorId);
      const executor = await app.objection.models.user.query()
        .select('firstName', 'lastName')
        .where('id', '=', task.executorId);
      task.status = statusName[0].name;
      task.author = `${author[0].firstName} ${author[0].lastName}`;
      task.executor = executor.length ? `${executor[0].firstName} ${executor[0].lastName}` : '';
      const taskLabels = labels.length ? labelsNames : '';
      reply.render('tasks/view', { task, taskLabels });
    })
    .get('/tasks/:id/edit', async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      const taskStatuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      const taskLabels = await app.objection.models.taskLabel.query().select('label_id')
        .where('task_id', '=', task.id);
      const labelIds = taskLabels.map((el) => el.labelId);
      reply.render('tasks/edit', {
        task, taskStatuses, users, labels, labelIds,
      });
    })
    .patch('/tasks/:id', async (req, reply) => {
      const task = new app.objection.models.task();
      const { id } = req.params;
      task.id = id;
      task.$set(req.body.data);
      task.executorId = Number(req.body.data.executorId);
      task.statusId = Number(req.body.data.statusId);
      try {
        const modifiedTask = await app.objection.models.task.query().findById(id);
        await modifiedTask.$query().patchAndFetch({
          name: task.name,
          description: task.description,
          statusId: task.statusId,
          executorId: task.executorId,
        });
        const taskLabels = await app.objection.models.taskLabel.query().select('*')
          .where('task_id', '=', task.id);
        const labelIds = req.body.data.labels;
        if (typeof labelIds === 'string') {
          if (taskLabels.length) {
            const labels = taskLabels.map(async (taskLabel) => {
              const label = await taskLabel.$query().deleteById(taskLabel.id).debug();
              return label;
            });
            await Promise.all(labels);
            await app.objection.models.taskLabel.query().insert({
              task_id: Number(id),
              label_id: Number(labelIds),
            }).debug();
          } else {
            await app.objection.models.taskLabel.query().insert({
              task_id: Number(id),
              label_id: Number(labelIds),
            }).debug();
          }
        } else if (Array.isArray(labelIds)) {
          if (taskLabels.length) {
            const labels = taskLabels.map(async (taskLabel) => {
              const label = await taskLabel.$query().deleteById(taskLabel.id).debug();
              return label;
            });
            await Promise.all(labels);
            labelIds.map(async (label) => {
              await app.objection.models.taskLabel.query().insert({
                task_id: Number(id),
                label_id: Number(label),
              }).debug();
            });
          } else {
            labelIds.map(async (label) => {
              await app.objection.models.taskLabel.query().insert({
                task_id: Number(id),
                label_id: Number(label),
              }).debug();
            });
          }
        }
        req.flash('info', i18next.t('flash.tasks.editSuccess'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.editBlanckPass'));
        const taskStatuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        reply.render('tasks/edit', {
          task, taskStatuses, users, errors: data,
        });
      }
      return reply;
    })
    .delete('/tasks/:id', async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      if (task.creatorId === req.user.id) {
        await app.objection.models.task.query().deleteById(id);
        req.flash('info', i18next.t('flash.tasks.remove'));
        reply.redirect(app.reverse('tasks'));
      } else {
        req.flash('error', i18next.t('flash.tasks.removeFailure'));
        reply.redirect(app.reverse('tasks'));
      }
      return reply;
    });
};
