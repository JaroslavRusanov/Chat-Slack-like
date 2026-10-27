export default {
  translation: {
    loginPage: {
      header: 'Войти',
      logoAlt: 'Войти',
      form: {
        username: 'Ваш ник',
        password: 'Пароль',
        button: 'Войти',
        error: 'Неверные имя пользователя или пароль',
      },
      footer: {
        span: 'Нет аккаунта? ',
        link: 'Регистрация,',
      },
    },
    signupPage: {
      header: 'Регистрация',
      logoAlt: 'Регистрация',
      form: {
        username: 'Имя пользователя',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        errors: {
          usernameRange: 'От 3 до 20 символов',
          usernameExist: 'Такой пользователь уже существует',
          passwordRange: 'Не менее 6 символов',
          passwordConfirm: 'Пароли должны совпадать',
          required: 'Обязательное поле',
        },
        button: 'Зарегистрироваться',
      },
    },
    notFoundPage: {
      logoAlt: 'Страница не найдена',
      header: 'Страница не найдена',
      text: 'Но вы можете перейти ',
      link: 'на главную страницу',
    },
    chatPage: {
      header: 'Каналы',
    },
    chatBox: {
      messages_one: '{{count}} сообщение',
      messages_few: '{{count}} сообщения',
      messages_many: '{{count}} сообщений',
    },
    channels: {
      removeButton: 'Удалить',
      renameButton: 'Переименовать',
      manage: 'Управление каналом',
    },
    messageInput: {
      label: 'Новое сообщение',
      placeholder: 'Введите сообщение...',
      button: 'Отправить',
    },
    modal: {
      label: 'Имя канала',
      add: {
        title: 'Добавить канал',
        cancelButton: 'Отменить',
        sendButton: 'Отправить',
      },
      remove: {
        title: 'Удалить канал',
        body: 'Уверены?',
        cancelButton: 'Отменить',
        removeButton: 'Удалить',
      },
      rename: {
        title: 'Переименовать канал',
        cancelButton: 'Отменить',
        sendButton: 'Отправить',
      },
      validation: {
        notOneOf: 'Должно быть уникальным',
        range: 'От 3 до 20 символов',
      },
    },
    toastify: {
      error: {
        connectionErr: 'Ошибка соединения',
        authErr: 'Ошибка авторизации',
      },
      success: {
        channel: {
          add: 'Канал создан',
          rename: 'Канал переименован',
          remove: 'Канал удалён',
        },
      },
    },
    authButton: 'Выйти',
  },
};
