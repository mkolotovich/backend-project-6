// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);
      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser).debug();
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }
      return reply;
    })
    .get('/users/:id/edit', (req, reply) => {
      if (req.user === null) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      const currentUserId = req.user.id;
      const { id } = req.params;
      const { user } = req;
      if (currentUserId !== Number(id)) {
        req.flash('error', i18next.t('flash.users.edit'));
        reply.redirect(app.reverse('users'));
      } else {
        reply.render('users/edit', { user });
      }
    })
    .patch('/users/:id', async (req, reply) => {
      const user = new app.objection.models.user();
      const userId = req.user.id;
      user.$set(req.body.data);
      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        const modifiedUser = await app.objection.models.user.query().findById(userId);
        await modifiedUser.$query().patchAndFetch({
          email: validUser.email,
          first_name: validUser.firstName,
          last_name: validUser.lastName,
          passwordDigest: validUser.passwordDigest,
        });
        req.flash('info', i18next.t('flash.users.editSuccess'));
        reply.redirect(app.reverse('users'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.editBlanckPass'));
        reply.render('users/edit', { user, errors: data });
      }
      return reply;
    })
    .delete('/users/:id', async (req, reply) => {
      if (req.user === null) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      const currentUserId = req.user.id;
      const { id } = req.params;
      const author = await app.objection.models.task.query().where('creator_id', '=', id);
      const executor = await app.objection.models.task.query().where('executor_id', '=', id);
      if (author.length || executor.length) {
        req.flash('error', i18next.t('flash.users.removeUnSuccess'));
        reply.redirect(app.reverse('users'));
      } else if (currentUserId !== Number(id)) {
        req.flash('error', i18next.t('flash.users.edit'));
        reply.redirect(app.reverse('users'));
      } else {
        await app.objection.models.user.query().deleteById(currentUserId);
        req.logOut();
        req.flash('info', i18next.t('flash.users.remove'));
        reply.redirect(app.reverse('users'));
      }
      return reply;
    });
};
