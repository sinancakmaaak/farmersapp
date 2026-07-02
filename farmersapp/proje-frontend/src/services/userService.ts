import api from '../api';

export const getUsers = async () => {
  const response = await api.get('/users'); // token interceptor sayesinde header’a eklenir
  return response.data;
};
