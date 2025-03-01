import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[],
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export type Role = {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
};

export type Task = {
    id: number;
    user_id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: number;
    order: number;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type TaskActivity = {
    id: number;
    task_id: number;
    user_id: number;
    action: 'created' | 'updated' | 'deleted' | 'reordered';
    changes: Record<string, any>;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
    };
};

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type TaskStatistics = {
    total: number;
    by_status: Record<TaskStatus, number>;
    due_this_week: number;
    overdue: number;
    recently_completed: number;
};

export type ApiResponse<T> = {
    success?: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
};
