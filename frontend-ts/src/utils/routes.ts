// routes.js
const API_V1_PATH = '/api/v1';

export default {
  // Аутентификация
  loginPath: `${API_V1_PATH}/login`,
  signupPath: `${API_V1_PATH}/signup`,
  
  // Каналы
  channelsPath: `${API_V1_PATH}/channels`,
  channelsPathWithID: (id) => `${API_V1_PATH}/channels/${id}`,
  
  // Сообщения
  messagesPath: `${API_V1_PATH}/messages`,
  messagesPathWithID: (id) => `${API_V1_PATH}/messages/${id}`,
};