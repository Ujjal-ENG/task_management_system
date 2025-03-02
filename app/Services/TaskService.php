<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaskService
{
    /**
     * Get tasks with optional filtering
     *
     * @param int $userId
     * @param array $filters
     * @return Collection
     */
    public function getTasks(int $userId, array $filters = []): Collection
    {
        $query = Task::query();

        // Filter by status
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by due date
        if (isset($filters['due_date_start']) && isset($filters['due_date_end'])) {
            $query->whereBetween('due_date', [$filters['due_date_start'], $filters['due_date_end']]);
        } elseif (isset($filters['due_date_start'])) {
            $query->where('due_date', '>=', $filters['due_date_start']);
        } elseif (isset($filters['due_date_end'])) {
            $query->where('due_date', '<=', $filters['due_date_end']);
        }

        // search
        if (isset($filters['search'])) {
            $query->where(function ($query) use ($filters) {
                $query->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }
        $query->where('user_id','=',$userId);
        // cache key based on query parameters
        $cacheKey = 'tasks_' . $userId . '_' . md5(json_encode($filters));

        // Return cached result if available
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // order by
        $query->orderBy('id', 'asc')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        $tasks = $query->get();

        // cache the result for 5 minutes
        Cache::put($cacheKey, $tasks, now()->addMinutes(5));

        return $tasks;
    }

    /**
     * Get a specific task by ID
     *
     * @param int $taskId
     * @param int $userId
     * @return Task
     */
    public function getTask(int $taskId, int $userId): Task
    {

        return Task::query()->where('id', $taskId)->where('user_id', $userId)->firstOrFail();
    }

    /**
     * Create a new task
     *
     * @param array $data
     * @param int $userId
     * @return Task
     * @throws \Exception
     */
    public function createTask(array $data, int $userId): Task
    {
        try {
            DB::beginTransaction();

            // Get max order for the user
            $maxOrder = Task::query()->where('user_id', $userId)->max('order') ?? 0;

            $task = new Task([
                'title' => $data['title'],
                'description' => $data['description'],
                'status' => $data['status'] ?? 'pending',
                'due_date' => $data['due_date'],
                'priority' => $data['priority'] ?? 0,
                'order' => $maxOrder + 1,
                'user_id' => $userId
            ]);
            $task->save();

            // Save Log Activity
            TaskActivity::query()->create([
                'task_id' => $task->id,
                'user_id' => $userId,
                'action' => 'created',
                'changes' => $task->toArray(),
            ]);

            DB::commit();

            // clear cache for this user
            $this->clearUserTasksCache($userId);

            return $task;
        } catch (\Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    /**
     * Update an existing task
     *
     * @param int $taskId
     * @param array $data
     * @param int $userId
     * @return Task
     * @throws \Exception
     */
    public function updateTask(int $taskId, array $data, int $userId): Task
    {
        try {
            DB::beginTransaction();

            $task = Task::query()->where('id', $taskId)->where('user_id', $userId)->firstOrFail();

            $oldData = $task->toArray();

            // Set completed_at timestamp if status changed to completed
            if (isset($data['status']) && $data['status'] === 'completed' && $task->status !== 'completed') {
                $task->completed_at = now();
            }

            // update task
            $task->fill($data);
            $task->save();

            // Log changes
            $changes = array_diff_assoc($task->toArray(), $oldData);
            if (!empty($changes)) {
                TaskActivity::query()->create([
                    'task_id' => $task->id,
                    'user_id' => $userId,
                    'action' => 'updated',
                    'changes' => $changes,
                ]);
            }

            DB::commit();

            $this->clearUserTasksCache($userId);

            return $task;
        } catch (\Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    /**
     * Delete a task
     *
     * @param int $taskId
     * @param int $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteTask(int $taskId, int $userId): bool
    {

        try {
            DB::beginTransaction();

            $task = Task::query()->where('id', $taskId)
                ->where('user_id', $userId)
                ->firstOrFail();

            // Log deletion
            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => $userId,
                'action' => 'deleted',
                'changes' => ['deleted_at' => now()],
            ]);

            $task->delete();

            DB::commit();

            // Clear cache for this user
            $this->clearUserTasksCache($userId);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Bulk update tasks
     *
     * @param array $tasks
     * @param array $destination
     * @param int $userId
     * @return array
     * @throws \Exception
     */
    public function bulkUpdateTasks(array $tasks, array $destination, int $userId): array
    {
        try {
            DB::beginTransaction();

            $updatedTasks = [];

            foreach ($tasks as $taskData) {
                $task = Task::query()->where('id', $taskData['id'])->where('user_id', $userId)->first();
                if ($task) {
                    $oldOrder = $task->order;
                    $task->order = $taskData['order'];
                    $task->status = $destination['droppableId'];
                    $task->save();

                    if ($oldOrder !== $taskData['order']) {
                        TaskActivity::query()->create([
                            'task_id' => $task->id,
                            'user_id' => $userId,
                            'action' => 'reordered',
                            'changes' => ['order' => ['from' => $oldOrder, 'to' => $taskData['order']]],
                        ]);
                    }
                    $updatedTasks[] = $task->id;
                }
            }

            DB::commit();
            $this->clearUserTasksCache($userId);

            return $updatedTasks;
        } catch (\Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }


    /**
     * Get task statistics
     *
     * @param int $userId
     * @return array
     */
    public function getTaskStatistics(int $userId): array
    {
        // check cache
        $cacheKey = 'task_stats_'.$userId;
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // count task by status
        $taskByStatus = Task::query()->where('user_id', $userId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // task due soon
        $dueThisWeek = Task::query()->where('user_id', $userId)
            ->where('status', '!=', 'completed')
            ->whereBetween('due_date', [now(), now()->addDays(7)])
            ->count();

        // Overdue tasks
        $overdue = Task::query()->where('user_id', $userId)
            ->where('status', '!=', 'completed')
            ->where('due_date', '<', now())
            ->count();

        // Recently completed
        $recentlyCompleted = Task::query()->where('user_id', $userId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->count();

        $stats = [
            'total' => array_sum($taskByStatus),
            'by_status' => $taskByStatus,
            'due_this_week' => $dueThisWeek,
            'overdue' => $overdue,
            'recently_completed' => $recentlyCompleted,
        ];

        // Cache for 1 hour
        Cache::put($cacheKey, $stats, now()->addHour());

        return $stats;
    }

    /**
     * Clear user's task cache
     *
     * @param int $userId
     * @return void
     */
    public function clearUserTasksCache(int $userId): void
    {
        // Clear statistics cache
        Cache::forget('task_stats_' . $userId);

        // Find and clear all tasks list caches for this user
        $cacheKeys = Cache::get('user_' . $userId . '_cache_keys', []);
        foreach ($cacheKeys as $key) {
            if (strpos($key, 'tasks_' . $userId . '_') === 0) {
                Cache::forget($key);
            }
        }
    }
}
