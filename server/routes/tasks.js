// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const tasks = await app.objection.models.task.query();
      const tasksFormatted = tasks.map(async (el) => {
        const taskFormatted = el;
        const statusName = await app.objection.models.taskStatus.query()
          .select('name')
          .where('id', '=', taskFormatted.statusId);
        const author = await app.objection.models.user.query()
          .select('firstName', 'lastName')
          .where('id', '=', taskFormatted.creatorId);
        const executor = await app.objection.models.user.query()
          .select('firstName', 'lastName')
          .where('id', '=', taskFormatted.executorId);
        taskFormatted.status = statusName[0].name;
        taskFormatted.author = `${author[0].firstName} ${author[0].lastName}`;
        taskFormatted.executor = executor.length ? `${executor[0].firstName} ${executor[0].lastName}` : '';
        return taskFormatted;
      });
      await Promise.all(tasksFormatted);
      reply.render('tasks/index', { tasks });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      const task = new app.objection.models.task();
      const taskStatuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      reply.render('tasks/new', { task, taskStatuses, users });
      return reply;
    })
    .post('/tasks', async (req, reply) => {
      const task = new app.objection.models.task();
      task.$set(req.body.data);
      try {
        const newTask = { ...req.body.data, creatorId: Number(req.user.id) };
        newTask.statusId = Number(newTask.statusId);
        newTask.executorId = Number(newTask.executorId);
        const user = await app.objection.models.user.query().findById(newTask.creatorId);
        await user.$relatedQuery('owner').insert({
          name: newTask.name,
          description: newTask.description,
          statusId: newTask.statusId,
          creatorId: newTask.creatorId,
          executorId: newTask.executorId,
        }).debug();
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
      const author = await app.objection.models.user.query()
        .select('firstName', 'lastName')
        .where('id', '=', task.creatorId);
      const executor = await app.objection.models.user.query()
        .select('firstName', 'lastName')
        .where('id', '=', task.executorId);
      task.status = statusName[0].name;
      task.author = `${author[0].firstName} ${author[0].lastName}`;
      task.executor = executor.length ? `${executor[0].firstName} ${executor[0].lastName}` : '';
      reply.render('tasks/view', { task });
    })
    .get('/tasks/:id/edit', async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      const taskStatuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      reply.render('tasks/edit', { task, taskStatuses, users });
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
