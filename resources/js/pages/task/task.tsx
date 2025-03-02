
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React, { useContext, useState } from 'react';
import { TaskContext } from '@/contexts/TaskContext';
import { Link } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    Download,
    Edit,
    Filter,
    Plus,
    Search,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Clock3, CalendarIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Task } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskGroupProps {
    status: string;
    tasks: Task[];
    onTaskDragEnd: (result: DropResult) => void;
    onDelete: (id: number) => void;
}

const TaskGroup = ({ status, tasks, onTaskDragEnd, onDelete }: TaskGroupProps) => {
    const statusDisplayNames: Record<string, string> = {
        'pending': 'Pending',
        'in_progress': 'In Progress',
        'completed': 'Completed'
    };

    const statusIcons: Record<string, React.ReactNode> = {
        'pending': <Clock3 className="h-4 w-4 text-orange-500" />,
        'in_progress': <Clock className="h-4 w-4 text-blue-500" />,
        'completed': <CheckCircle2 className="h-4 w-4 text-green-500" />
    };

    return (
        <Card className="w-full">
            <CardHeader className="p-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    {statusIcons[status]}
                    {statusDisplayNames[status] || status}
                </CardTitle>
                <CardDescription>{tasks.length} tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
                <Droppable droppableId={status}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-2 min-h-40"
                        >
                            {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="bg-card border rounded-md p-3 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start">
                                                <Link to={`/tasks/${task.id}`}
                                                      className="font-medium hover:underline line-clamp-2">
                                                    {task.title}
                                                </Link>
                                                <div className="flex gap-1 ml-2">
                                                    <Link to={`/tasks/${task.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive"
                                                        onClick={() => onDelete(task.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {task.due_date && (
                                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(task.due_date) < new Date() && status !== 'completed' ? (
                                                        <span className="text-destructive">
                              Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                                                    ) : (
                                                        <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                                                    )}
                                                </div>
                                            )}

                                            {task.priority > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className={`mt-2 ${
                                                        task.priority >= 3 ? 'border-red-500 text-red-500' :
                                                            task.priority === 2 ? 'border-orange-500 text-orange-500' :
                                                                'border-blue-500 text-blue-500'
                                                    }`}
                                                >
                                                    Priority: {task.priority}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {tasks.length === 0 && (
                                <div
                                    className="flex flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
                                    <p>No tasks</p>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </CardContent>
        </Card>
    );
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function task() {
    const {
        tasks,
        loading,
        filters,
        setFilters,
        statistics,
        bulkUpdateTasks,
        deleteTask,
        exportTasks
    } = useContext(TaskContext);

    const [showFilters, setShowFilters] = useState(false);
    const [defaultTab, setDefaultTab] = useState('all');

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        // If dropped in a different column, update the task status
        if (source.droppableId !== destination.droppableId) {
            const taskId = parseInt(draggableId);
            const task = tasks.find(t => t.id === taskId);

            if (task) {
                // Update the task's status and re-order within the new status group
                const targetStatusTasks = tasks
                    .filter(t => t.status === destination.droppableId)
                    .sort((a, b) => a.order - b.order);

                // Calculate the new order based on destination index
                let newOrder = 0;
                if (targetStatusTasks.length === 0) {
                    newOrder = 1; // First task in this status
                } else if (destination.index === 0) {
                    newOrder = targetStatusTasks[0].order - 1; // Place before the first task
                } else if (destination.index >= targetStatusTasks.length) {
                    newOrder = targetStatusTasks[targetStatusTasks.length - 1].order + 1; // Place after the last task
                } else {
                    // Place between two existing tasks
                    newOrder = (targetStatusTasks[destination.index - 1].order + targetStatusTasks[destination.index].order) / 2;
                }

                await bulkUpdateTasks([
                    { id: taskId, order: newOrder }
                ]);
            }
        } else if (source.index !== destination.index) {
            // Reordering within the same status column
            const statusTasks = tasks
                .filter(t => t.status === source.droppableId)
                .sort((a, b) => a.order - b.order);

            // Get the task being moved
            const taskId = parseInt(draggableId);

            // Calculate new order
            let newOrder;
            if (destination.index === 0) {
                newOrder = statusTasks[0].order - 1;
            } else if (destination.index >= statusTasks.length - 1) {
                newOrder = statusTasks[statusTasks.length - 1].order + 1;
            } else {
                const beforeTask = statusTasks[destination.index - (destination.index > source.index ? 0 : 1)];
                const afterTask = statusTasks[destination.index + (destination.index < source.index ? 0 : 1)];
                newOrder = (beforeTask.order + afterTask.order) / 2;
            }

            await bulkUpdateTasks([
                { id: taskId, order: newOrder }
            ]);
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(id);
        }
    };

    const handleExportTasks = () => {
        exportTasks();
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            due_date_start: '',
            due_date_end: '',
            search: ''
        });
        setDefaultTab('all');
    };

    const pendingTasks = tasks.filter(task => task.status === 'pending').sort((a, b) => a.order - b.order);
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').sort((a, b) => a.order - b.order);
    const completedTasks = tasks.filter(task => task.status === 'completed').sort((a, b) => a.order - b.order);
    const [date,setDate] = React.useState<Date>();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">My Tasks</h1>
                        <Badge variant="outline" className="ml-2">
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-8 max-w-xs"
                            value={filters.search || ''}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={handleExportTasks}>
                        <Download className="h-4 w-4" />
                    </Button>

                    <Link href={route('create-task')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Task
                        </Button>
                    </Link>
                </div>
                {/* Advanced Filters */}
                {showFilters && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={filters.status || ''}
                                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date From</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                value={filters.due_date_start ? new Date(filters.due_date_start) : undefined}
                                                onChange={(date) => setFilters({
                                                    ...filters,
                                                    due_date_start: date ? format(date, 'yyyy-MM-dd') : ''
                                                })}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {/*<DatePicker*/}
                                    {/*    value={filters.due_date_start ? new Date(filters.due_date_start) : undefined}*/}
                                    {/*    onChange={(date) => setFilters({*/}
                                    {/*        ...filters,*/}
                                    {/*        due_date_start: date ? format(date, 'yyyy-MM-dd') : ''*/}
                                    {/*    })}*/}
                                    {/*/>*/}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date To</label>
                                    {/*<DatePicker*/}
                                    {/*    value={filters.due_date_end ? new Date(filters.due_date_end) : undefined}*/}
                                    {/*    onChange={(date) => setFilters({*/}
                                    {/*        ...filters,*/}
                                    {/*        due_date_end: date ? format(date, 'yyyy-MM-dd') : ''*/}
                                    {/*    })}*/}
                                    {/*/>*/}
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={resetFilters} className="mr-2">
                                    Reset
                                </Button>
                                <Button onClick={() => setShowFilters(false)}>
                                    Apply Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* Tasks Section */}
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="all" onClick={() => setDefaultTab('all')}>All Tasks</TabsTrigger>
                        <TabsTrigger value="kanban" onClick={() => setDefaultTab('kanban')}>Kanban View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : tasks.length > 0 ? (
                            <div className="grid gap-4">
                                {tasks.map((task) => (
                                    <Card key={task.id} className="overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center">
                                            <div className="p-4 flex-grow">
                                                <div className="flex items-center justify-between">
                                                    <Link to={`/tasks/${task.id}`}
                                                          className="font-medium hover:underline text-lg">
                                                        {task.title}
                                                    </Link>
                                                    <Badge
                                                        variant={
                                                            task.status === 'completed' ? 'success' :
                                                                task.status === 'in_progress' ? 'secondary' :
                                                                    'default'
                                                        }
                                                    >
                                                        {task.status === 'in_progress' ? 'In Progress' :
                                                            task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                    </Badge>
                                                </div>

                                                {task.description && (
                                                    <p className="text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                                )}

                                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm">
                                                    {task.due_date && (
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {new Date(task.due_date) < new Date() && task.status !== 'completed' ? (
                                                                <span className="text-destructive">
                                Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </span>
                                                            ) : (
                                                                <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {task.priority > 0 && (
                                                        <div className={`flex items-center ${
                                                            task.priority >= 3 ? 'text-red-500' :
                                                                task.priority === 2 ? 'text-orange-500' :
                                                                    'text-blue-500'
                                                        }`}>
                                                            <AlertCircle className="h-4 w-4 mr-1" />
                                                            Priority: {task.priority}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className="flex items-center p-4 gap-2 border-t md:border-t-0 md:border-l bg-muted/40">
                                                <Link to={`/tasks/${task.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>No tasks found</AlertTitle>
                                <AlertDescription>
                                    {Object.values(filters).some(v => v !== '') ? (
                                        <>
                                            No tasks match your current filters. <Button variant="link"
                                                                                         onClick={resetFilters}
                                                                                         className="p-0">Reset
                                            filters</Button>
                                        </>
                                    ) : (
                                        <>You don't have any tasks yet. <Link href={route('create-task')} className="underline">Create
                                            a new task</Link> to get started.</>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>

                    <TabsContent value="kanban" className="mt-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <TaskGroup
                                        status="pending"
                                        tasks={pendingTasks}
                                        onTaskDragEnd={handleDragEnd}
                                        onDelete={handleDeleteTask}
                                    />
                                    <TaskGroup
                                        status="in_progress"
                                        tasks={inProgressTasks}
                                        onTaskDragEnd={handleDragEnd}
                                        onDelete={handleDeleteTask}
                                    />
                                    <TaskGroup
                                        status="completed"
                                        tasks={completedTasks}
                                        onTaskDragEnd={handleDragEnd}
                                        onDelete={handleDeleteTask}
                                    />
                                </div>
                            </DragDropContext>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
