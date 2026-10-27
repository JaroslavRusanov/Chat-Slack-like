export default {
  translation: {
    loginPage: {
      header: 'Enter',
      logoAlt: 'Enter',
      form: {
        username: 'Nickname',
        password: 'Password',
        button: 'Enter',
        error: 'Wrong nickname or password',
      },
      footer: {
        span: 'Need account? ',
        link: 'Sign up',
      },
    },
    signupPage: {
      header: 'Sign up',
      logoAlt: 'Sign up',
      form: {
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm password',
        errors: {
          usernameRange: 'minimum 3 maximum 20 characters',
          usernameExist: 'This user already exists',
          passwordRange: 'At least 6 characters',
          passwordConfirm: 'Passwords must match',
          required: 'Required field',
        },
        button: 'Sign up',
      },
    },
    notFoundPage: {
      logoAlt: 'Page not found',
      header: 'Page not found',
      text: 'But you can go ',
      link: 'to main page',
    },
    chatPage: {
      header: 'Channels',
    },
    chatBox: {
      messages_one: '{{count}} message',
      messages_other: '{{count}} messages',
    },
    channels: {
      removeButton: 'Remove',
      renameButton: 'Rename',
      manage: 'Manage channel',
    },
    messageInput: {
      label: 'New message',
      placeholder: 'Enter message...',
      button: 'Send',
    },
    modal: {
      label: 'Channel`s name',
      add: {
        title: 'Add channel',
        cancelButton: 'Cancel',
        sendButton: 'Send',
      },
      remove: {
        title: 'Remove channel',
        body: 'Are you sure?',
        cancelButton: 'Cancel',
        removeButton: 'Remove',
      },
      rename: {
        title: 'Rename channel',
        cancelButton: 'Cancel',
        sendButton: 'Send',
      },
      validation: {
        notOneOf: 'Must be unique',
        range: 'At least 3 to 20 characters',
      },
    },
    toastify: {
      error: {
        connectionErr: 'Connection error',
        authErr: 'Authorization error',
      },
      success: {
        channel: {
          add: 'Channel created',
          rename: 'Channel renamed',
          remove: 'Channel removed',
        },
      },
    },
    authButton: 'Logout',
  },
};
