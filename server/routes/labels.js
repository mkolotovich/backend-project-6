// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels' }, app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const labels = await app.objection.models.label.query();
        reply.render('labels/index', { labels });
      }
      return reply;
    }))
    .get('/labels/new', { name: 'newLabel' }, app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const label = new app.objection.models.label();
        reply.render('labels/new', { label });
      }
      return reply;
    }))
    .post('/labels', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
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
      }
      return reply;
    }))
    .get('/labels/:id/edit', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const { id } = req.params;
        const label = await app.objection.models.label.query().findById(id);
        reply.render('labels/edit', { label });
      }
      return reply;
    }))
    .patch('/labels/:id', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
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
      }
      return reply;
    }))
    .delete('/labels/:id', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
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
      }
      return reply;
    }));
};
