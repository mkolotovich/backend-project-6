// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: 'Вы не можете редактировать или удалять другого пользователя',
        editBlanckPass: 'Не удалось изменить пользователя',
        editSuccess: 'Пользователь успешно изменён',
        remove: 'Пользователь успешно удалён',
        removeUnSuccess: 'Не удалось удалить пользователя',
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: 'Вы не можете редактировать или удалять другого пользователя',
        editBlanckPass: 'Не удалось изменить статус',
        editSuccess: 'Статус успешно изменён',
        remove: 'Статус успешно удалён',
        removeFailure: 'Не удалось удалить статус',
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: 'Вы не можете редактировать или удалять другого пользователя',
        editBlanckPass: 'Не удалось изменить задачу',
        editSuccess: 'Задача успешно изменена',
        remove: 'Задача успешно удалена',
        removeFailure: 'Задачу может удалить только её автор',
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        edit: 'Изменение пользователя',
        editStatus: 'Изменение статуса',
        statuses: 'Статусы',
        tasks: 'Задачи',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        actions: 'Действия',
        edit: 'Изменить',
        remove: 'Удалить',
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        create: 'Создать статус',
        new: {
          submit: 'Создать',
          header: 'Создание статуса',
        },
        actions: 'Действия',
        edit: 'Изменить',
        remove: 'Удалить',
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        status: 'Статус',
        author: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        create: 'Создать задачу',
        new: {
          submit: 'Создать',
          header: 'Создание задачи',
        },
        editHeader: 'Изменение задачи',
        actions: 'Действия',
        edit: 'Изменить',
        remove: 'Удалить',
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
