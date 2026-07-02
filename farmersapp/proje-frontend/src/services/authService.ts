import api from '../api';
import { AxiosError } from 'axios';
import { User } from '../types/index';

interface LoginResponse {
  token: string;
  user: User;
}

interface LoginError {
  message: string;
  status: number;
}

export const login = async (phoneNumber: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      phoneNumber,
      password,
    });

    // Set the token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LoginError>;
    const errorMessage = axiosError.response?.data?.message || 'Login failed';
    console.error('Login error:', errorMessage);
    throw {
      message: errorMessage,
      status: axiosError.response?.status || 500
    };
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LoginError>;
    const errorMessage = axiosError.response?.data?.message || 'Failed to get user info';
    console.error('Get user error:', errorMessage);
    throw {
      message: errorMessage,
      status: axiosError.response?.status || 500
    };
  }
};
