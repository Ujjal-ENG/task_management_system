import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Task, TaskFilters, TaskStatistics, TaskActivity, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface TaskContextProps {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    filters: TaskFilters;
    statistics: TaskStatistics | null;
    setFilters: (filters: TaskFilters) => void;
    fetchTasks: () => Promise<void>;
    fetchStatistics: () => Promise<void>;
    getTask: (id: number) => Promise<Task | null>;
    createTask: (task: Partial<Task>) => Promise<Task | null>;
    updateTask: (id: number, task: Partial<Task>) => Promise<Task | null>;
    deleteTask: (id: number) => Promise<boolean>;
    bulkUpdateTasks: (tasks: { id: number; order: number }[]) => Promise<number[] | null>;
    fetchTaskActivities: (taskId: number) => Promise<TaskActivity[]>;
    exportTasks: () => Promise<void>;
}

export const TaskContext = createContext<TaskContextProps>({
    tasks: [],
    loading: false,
    error: null,
    filters: {},
    statistics: null,
    setFilters: () => {},
    fetchTasks: async () => {},
    fetchStatistics: async () => {},
    getTask: async () => null,
    createTask: async () => null,
    updateTask: async () => null,
    deleteTask: async () => false,
    bulkUpdateTasks: async () => null,
    fetchTaskActivities: async () => [],
    exportTasks: async () => {}
});

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TaskFilters>({
        status: '',
        due_date_start: '',
        due_date_end: '',
        search: ''
    });
    const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
    const { user } = usePage<SharedData>().props;

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchStatistics();
        }
    }, [user, filters]);

    const fetchTasks = async (): Promise<void> => {
        if (!user) return;

        setLoading(true);
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            );

            const response = await axios.get('/tasks', { params });
            setTasks(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tasks');
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async (): Promise<void> => {
        if (!user) return;

        try {
            const response = await axios.get('/tasks/statistics');
            setStatistics(response.data);
        } catch (err) {
            console.error('Failed to fetch statistics', err);
        }
    };

    const getTask = async (id: number): Promise<Task | null> => {
        setLoading(true);
        try {
            const response = await axios.get(`/tasks/${id}`);
            return response.data.data;
        } catch (err) {
            toast.error('Failed to fetch task details');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (task: Partial<Task>): Promise<Task | null> => {
        setLoading(true);
        try {
            const response = await axios.post('/tasks', task);
            await fetchTasks();
            await fetchStatistics();
            toast.success('Task created successfully');
            return response.data.data;
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create task');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (id: number, task: Partial<Task>): Promise<Task | null> => {
        setLoading(true);
        try {
            const response = await axios.put(`/tasks/${id}`, task);
            await fetchTasks();
            await fetchStatistics();
            toast.success('Task updated successfully');
            return response.data.data;
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update task');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (id: number): Promise<boolean> => {
        setLoading(true);
        try {
            await axios.delete(`/tasks/${id}`);
            await fetchTasks();
            await fetchStatistics();
            toast.success('Task deleted successfully');
            return true;
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete task');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const bulkUpdateTasks = async (tasks: { id: number; order: number }[]): Promise<number[] | null> => {
        try {
            const response = await axios.post('/tasks/bulk-update', { tasks });
            await fetchTasks();
            return response.data.data;
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update task order');
            return null;
        }
    };

    const fetchTaskActivities = async (taskId: number): Promise<TaskActivity[]> => {
        try {
            const response = await axios.get(`/tasks/${taskId}/activities`);
            return response.data.data;
        } catch (err) {
            toast.error('Failed to fetch task activities');
            return [];
        }
    };

    const exportTasks = async (): Promise<void> => {
        try {
            const response = await axios.get('/tasks/export', {
                responseType: 'blob'
            });

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `tasks_export_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Tasks exported successfully');
        } catch (err) {
            toast.error('Failed to export tasks');
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            error,
            filters,
            statistics,
            setFilters,
            fetchTasks,
            fetchStatistics,
            getTask,
            createTask,
            updateTask,
            deleteTask,
            bulkUpdateTasks,
            fetchTaskActivities,
            exportTasks
        }}>
            {children}
        </TaskContext.Provider>
    );
};
