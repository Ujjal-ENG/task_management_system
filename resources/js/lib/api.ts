import axios from 'axios';
import { Task, TaskActivity, TaskStatistics, User } from '@/types';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});


// Task Api
export const taskApi = {
//     Get All task with optional filters
    getTasks: (filters?: Record<string, never>) =>
        api.get<{ success: boolean, data: Task[] }>(`/tasks`, { params: filters }),

//     get a single task by ID
    getTask: (id: number) => api.get<{ success: boolean, data: Task }>(`/tasks/${id}`),

//     create a task
    createTask: (task: Partial<Task>) =>
        api.post<{ success: boolean, data: Task }>('/tasks', task),

//     update a existing task
    updateTask: (id: number, task: Partial<Task>) =>
        api.put<{ success: boolean, data: Task }>(`/tasks/${id}`, task),

    // Delete a task
    deleteTask: (id: number) =>
        api.delete(`/tasks/${id}`),

    // Bulk update tasks (primarily for reordering)
    bulkUpdateTasks: (tasks: { id: number, order: number }[]) =>
        api.post<{ success: boolean, data: number[] }>('/tasks/bulk-update', { tasks }),

    // Get task activities
    getTaskActivities: (id: number) =>
        api.get<{ success: boolean, data: TaskActivity[] }>(`/tasks/${id}/activities`),

    // Get task statistics
    getTaskStatistics: () =>
        api.get<TaskStatistics>('/tasks/statistics'),

    // Export tasks as CSV
    exportTasks: () =>
        api.get('/tasks/export', { responseType: 'blob' })
};


// Admin services
export const adminApi = {
    // Get all users (admin only)
    getUsers: () =>
        api.get<{ users: User[] }>('/users'),

    // Get all roles (admin only)
    getRoles: () =>
        api.get('/roles'),

    // Assign role to user (admin only)
    assignRole: (userId: number, roleId: number) =>
        api.post('/roles/assign', { user_id: userId, role_id: roleId }),

    // Remove role from user (admin only)
    removeRole: (userId: number, roleId: number) =>
        api.post('/roles/remove', { user_id: userId, role_id: roleId }),
};

// Interceptor for handling 401 unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login page or refresh token
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
