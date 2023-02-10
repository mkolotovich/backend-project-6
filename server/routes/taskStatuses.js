// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      const status = new app.objection.models.taskStatus();
      reply.render('statuses/new', { status });
    })
    .post('/statuses', async (req, reply) => {
      const status = new app.objection.models.taskStatus();
      status.$set(req.body.data);
      try {
        const validStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(validStatus).debug();
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status, errors: data });
      }
      return reply;
    })
    .get('/statuses/:id/edit', async (req, reply) => {
      const { id } = req.params;
      const status = await app.objection.models.taskStatus.query().findById(id);
      reply.render('statuses/edit', { status });
    })
    .patch('/statuses/:id', async (req, reply) => {
      const status = new app.objection.models.taskStatus();
      const { id } = req.params;
      status.id = id;
      status.$set(req.body.data);
      try {
        const validStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        const modifiedStatus = await app.objection.models.taskStatus.query().findById(id);
        await modifiedStatus.$query().patchAndFetch({
          name: validStatus.name,
        });
        req.flash('info', i18next.t('flash.statuses.editSuccess'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.editBlanckPass'));
        reply.render('statuses/edit', { status, errors: data });
      }
      return reply;
    })
    .delete('/statuses/:id', async (req, reply) => {
      const { id } = req.params;
      await app.objection.models.taskStatus.query().deleteById(id);
      req.flash('info', i18next.t('flash.statuses.remove'));
      reply.redirect(app.reverse('statuses'));
      return reply;
    });
};
