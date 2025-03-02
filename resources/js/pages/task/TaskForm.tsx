import React, { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

// Task interface matching the database schema
interface TaskFormData {
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'archived';
    priority: number;
    due_date: Date | null;
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Task',
        href: '/task/TaskFrom',
    },
];

function TaskForm() {
    // Form state
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'pending',
        priority: 0,
        due_date: null,
    });

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'priority' ? parseInt(value) : value
        }));
    };

    // Handle date selection
    const handleDateChange = (date: Date | undefined) => {
        setFormData((prev) => ({ ...prev, due_date: date || null }));
    };

    // Form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        // Validate required fields
        if (!formData.title.trim()) {
            setError('Title is required');
            setIsSubmitting(false);
            return;
        }

        try {
            // Format data for API
            const apiData = {
                ...formData,
                due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd HH:mm:ss') : null,
            };

            // Send request to API
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create task');
            }

            // Reset form on success
            setFormData({
                title: '',
                description: '',
                status: 'pending',
                priority: 0,
                due_date: null,
            });

            setSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={'Create Task'}/>
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-6 bg-green-50 border-green-600">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>Task created successfully!</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter task description"
                            className="resize-none h-24"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority.toString()}
                                onValueChange={(value) => handleSelectChange('priority', value)}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Low</SelectItem>
                                    <SelectItem value="1">Medium</SelectItem>
                                    <SelectItem value="2">High</SelectItem>
                                    <SelectItem value="3">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due-date">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="due-date"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    {formData.due_date ? (
                                        format(formData.due_date, "PPP")
                                    ) : (
                                        <span className="text-gray-400">Select a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.due_date || undefined}
                                    onSelect={handleDateChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Task"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
        </AppLayout>
    );
}

export default TaskForm;
