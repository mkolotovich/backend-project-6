// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const statuses = await app.objection.models.taskStatus.query();
        reply.render('statuses/index', { statuses });
      }
      return reply;
    }))
    .get('/statuses/new', { name: 'newStatus' }, app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const status = new app.objection.models.taskStatus();
        reply.render('statuses/new', { status });
      }
      return reply;
    }))
    .post('/statuses', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
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
      }
      return reply;
    }))
    .get('/statuses/:id/edit', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const { id } = req.params;
        const status = await app.objection.models.taskStatus.query().findById(id);
        reply.render('statuses/edit', { status });
      }
      return reply;
    }))
    .patch('/statuses/:id', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
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
      }
      return reply;
    }))
    .delete('/statuses/:id', app.fp.authenticate('page', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      } else {
        const { id } = req.params;
        const task = await app.objection.models.task.query().where('status_id', '=', id);
        if (task.length) {
          req.flash('error', i18next.t('flash.statuses.removeFailure'));
          reply.redirect(app.reverse('statuses'));
        } else {
          await app.objection.models.taskStatus.query().deleteById(id);
          req.flash('info', i18next.t('flash.statuses.remove'));
          reply.redirect(app.reverse('statuses'));
        }
      }
      return reply;
    }));
};
