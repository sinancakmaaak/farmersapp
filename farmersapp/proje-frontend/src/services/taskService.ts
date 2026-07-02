import api from '../api';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo?: number;
  createdById?: number;
}

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/api/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}; 