<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\TaskActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;


class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     * @param Request $request
     * @return  JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = request()->user();
        $query = Task::query();

//        Filter by status
        if($request->has('status')){
            $query->where('status', $request->get('status'));
        }

//        Filter by due date
        if($request->has('due_date_start') && $request->has('due_date_end')){
            $query->whereBetween('due_date', [$request->get('due_date_start'), $request->get('due_date_end')]);
        }elseif($request->has('due_date_start')){
            $query->where('due_date', '>=', $request->get('due_date_start'));
        }elseif($request->has('due_date_end')){
            $query->where('due_date', '<=', $request->get('due_date_end'));
        }

//        search
        if($request->has('search')){
            $query->where(function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->get('search') . '%')
                    ->orWhere('description', 'like', '%' . $request->get('search') . '%');
            });
        }

//        cache key based on query parameters
        $cacheKey = 'tasks_'.$user->id.'_'.md5(json_encode(request()->all()));

//        Return cached result if available
        if (Cache::has($cacheKey)){
            return response()->json(['success' => true, 'data' => Cache::get($cacheKey)]);
        }

//        order by
        $query->orderBy('id', 'asc')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        $tasks = $query->get();

//        cache the result for 5 minutes
        Cache::put($cacheKey, $tasks, now()->addMinutes(5));

        return response()->json(['success' => true, 'data' => $tasks]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();

        if ($validated->fails()) {
            return response()->json(['errors' => $validated->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $user = request()->user();

//            Get max order for the user
            $maxOrder = Task::query()->where('user_id', $user->id)->max('order') ?? 0;

            $task = new Task([
                'title' => $request->get('title'),
                'description' => $request->get('description'),
                'status' => $request->get('status') ?? 'pending',
                'due_date' => $request->get('due_date'),
                'priority' => $request->get('priority') ?? 0,
                'order' => $maxOrder + 1,
                'user_id' => $user->id
            ]);
            $task->save();

//            Save Log Activity
            TaskActivity::query()->create([
                'task_id' => $task->id,
                'user_id' => $user->id,
                'action' => 'created',
                'changes' => $task->toArray(),
            ]);

            DB::commit();

//            clear cache for this user
            $this->clearUserTasksCache($user->id);

            return response()->json(['success' => true, 'data' => $task],201);
        }catch (\Exception $exception){
            DB::rollBack();
            return response()->json(['error' => 'Failed to Create Task '.$exception->getMessage()], 422);
        }
    }

    /**
     * Display the specified resource.
     * @param Request $request
     * @param $id
     * @return JsonResponse
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = request()->user();

        $task  = Task::query()->where('id', $id)->where('user_id', $user->id)->firstOrFail();

        return response()->json(['success' => true, 'data' => $task]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * @param UpdateTaskRequest $request
     * @param $id
     * @return JsonResponse
     */
    public function update(UpdateTaskRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        if ($validated->fails()) {
            return response()->json(['errors' => $validated->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $user = request()->user();
            $task = Task::query()->where('id', $id)->where('user_id', $user->id)->firstOrFail();

            $oldData = $task->toArray();

            // Set completed_at timestamp if status changed to completed
            if ($request->has('status') && $request->status === 'completed' && $task->status !== 'completed') {
                $task->completed_at = now();
            }

//            update task
            $task->fill($request->only(['title', 'description', 'status', 'priority', 'due_date', 'order']));

            $task->save();

            // Log changes
            $changes = array_diff_assoc($task->toArray(), $oldData);
            if (!empty($changes)) {
                TaskActivity::query()->create([
                    'task_id' => $task->id,
                    'user_id' => $user->id,
                    'action' => 'updated',
                    'changes' => $changes,
                ]);
            }

            DB::commit();

            $this->clearUserTasksCache($user->id);

            return response()->json(['success' => true, 'data' => $task]);

        }catch (\Exception $exception){
            DB::rollBack();
            return response()->json(['error' => 'Failed to Update Task '.$exception->getMessage()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param Request $request
     * @param $id
     * @return JsonResponse
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = $request->user();
            $task = Task::query()->where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Log deletion
            TaskActivity::query()->create([
                'task_id' => $task->id,
                'user_id' => $user->id,
                'action' => 'deleted',
                'changes' => ['deleted_at' => now()],
            ]);

            $task->delete();

            DB::commit();

            // Clear cache for this user
            $this->clearUserTasksCache($user->id);

            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete task: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|exists:tasks,id',
            'tasks.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();

            $updatedTasks = [];

            foreach ($request->tasks as $taskData) {
                $task = Task::query()->where('id', $taskData['id'])->where('user_id',$user->id)->first();
                if ($task){
                    $oldOrder = $task->order;
                    $task->order = $taskData['order'];
                    $task->save();

                    if ($oldOrder !== $taskData['order']){
                        TaskActivity::query()->create([
                            'task_id' => $task->id,
                            'user_id' => $user->id,
                            'action' => 'reordered',
                            'changes' => ['order' => ['from' => $oldOrder, 'to' => $taskData['order']]],
                        ]);
                    }
                    $updatedTasks[] = $task->id;
                }
            }
            DB::commit();


            $this->clearUserTasksCache($user->id);

            return response()->json(['success' => true, 'data' => $updatedTasks]);


        }catch (\Exception $exception){
            DB::rollBack();
            return response()->json(['error' => 'Failed to Update Task '.$exception->getMessage()], 422);
        }
    }

    /**
     * @param Request $request
     * @param $id
     * @return JsonResponse
     */
    public function activities(Request $request, $id): JsonResponse
    {
        $user = request()->user();
        $task = Task::query()->where('id', $id)->where('user_id', $user->id)->firstOrFail();

        $activities = $task->activities()->with('user:id,name')->orderBy('created_at','desc')->get()->toArray();
        return response()->json(['success' => true, 'data' => $activities]);
    }

    public function statistics(Request $request): JsonResponse
    {
        $user = request()->user();

//        check cache
        $cacheKey = 'tasks_'.$user->id;
        if(Cache::has($cacheKey)){
            return response()->json(['success' => true, 'data' => Cache::get($cacheKey)]);
        }

//        count task by status
        $taskByStatus = Task::query()->where('user_id',$user->id)
            ->select('status',DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count','status')
            ->toArray();

//        task due soon
        $dueThisWeek = Task::query()->where('user_id',$user->id)
            ->where('status' ,'!=', 'completed')
            ->whereBetween('due_date', [now(), now()->addDays(7)])
            ->count();

        // Overdue tasks
        $overdue = Task::query()->where('user_id', $user->id)
            ->where('status', '!=', 'completed')
            ->where('due_date', '<', now())
            ->count();

        // Recently completed
        $recentlyCompleted = Task::query()->where('user_id', $user->id)
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

        return response()->json($stats);
    }


    /**
     * @param Request $request
     * @return StreamedResponse
     */
    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();

        $tasks = Task::query()->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'description', 'status', 'priority', 'due_date', 'completed_at', 'created_at', 'updated_at']);

        // Generate CSV
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="tasks_export_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function() use ($tasks) {
            $file = fopen('php://output', 'w');

            // Add headers
            fputcsv($file, ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Completed At', 'Created At', 'Updated At']);

            // Add rows
            foreach ($tasks as $task) {
                fputcsv($file, [
                    $task->id,
                    $task->title,
                    $task->description,
                    $task->status,
                    $task->priority,
                    $task->due_date ? $task->due_date->format('Y-m-d H:i:s') : null,
                    $task->completed_at ? $task->completed_at->format('Y-m-d H:i:s') : null,
                    $task->created_at->format('Y-m-d H:i:s'),
                    $task->updated_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    /**
     * Clear user's task cache
     * @param $userId
     * @return void
     */
    private function clearUserTasksCache($userId): void
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
