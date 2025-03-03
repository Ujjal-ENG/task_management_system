export interface User {
    id: number;
    name: string;
    email: string;
    roles?: Role[];
}

export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    completed_at?: string;
    user_id: number;
    order?: number;
    created_at: string;
    updated_at: string;
}
