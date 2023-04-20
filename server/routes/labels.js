// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabel' }, (req, reply) => {
      const label = new app.objection.models.label();
      reply.render('labels/new', { label });
    })
    .post('/labels', async (req, reply) => {
      const label = new app.objection.models.label();
      label.$set(req.body.data);
      try {
        const validStatus = await app.objection.models.label.fromJson(req.body.data);
        await app.objection.models.label.query().insert(validStatus).debug();
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: data });
      }
      return reply;
    })
    .get('/labels/:id/edit', async (req, reply) => {
      const { id } = req.params;
      const label = await app.objection.models.label.query().findById(id);
      reply.render('labels/edit', { label });
      return reply;
    })
    .patch('/labels/:id', async (req, reply) => {
      const label = new app.objection.models.label();
      const { id } = req.params;
      label.id = id;
      label.$set(req.body.data);
      try {
        const validLabel = await app.objection.models.label.fromJson(req.body.data);
        const modifiedLabel = await app.objection.models.label.query().findById(id);
        await modifiedLabel.$query().patchAndFetch({
          name: validLabel.name,
        });
        req.flash('info', i18next.t('flash.labels.editSuccess'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.editBlanckPass'));
        reply.render('labels/edit', { label, errors: data });
      }
      return reply;
    })
    .delete('/labels/:id', async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.taskLabel.query().where('label_id', '=', id);
      if (task.length) {
        req.flash('error', i18next.t('flash.labels.removeFailure'));
        reply.redirect(app.reverse('labels'));
      } else {
        await app.objection.models.label.query().deleteById(id);
        req.flash('info', i18next.t('flash.labels.remove'));
        reply.redirect(app.reverse('labels'));
      }
      return reply;
    });
};
