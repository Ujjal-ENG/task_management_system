<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\TaskActivity;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Mockery\Exception;
use Symfony\Component\HttpFoundation\StreamedResponse;


class TaskController extends Controller
{


    protected $taskService;

    /**
     * TaskController constructor.
     *
     * @param TaskService $taskService
     */
    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * @return Response
     */
    public function taskIndex(): Response
    {
        return Inertia::render('task/task');
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();


        $tasks = $this->taskService->getTasks($user->id, $request->all());

        return response()->json(['success' => true, 'data' => $tasks]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('task/TaskForm');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request): Response
    {
        $validated = $request->validated();

        $user = request()->user();
        try {
            $task = $this->taskService->createTask($validated, $user->id);
            return Inertia::render('task/task', ['success' => true, 'data' => $task]);
        }catch (\Exception $exception){
            DB::rollBack();
            return Inertia::render('task/TaskForm');
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
        try {
            $task = $this->taskService->getTask($id,$user->id);
            return response()->json(['success' => true, 'data' => $task]);
        }catch (Exception $exception){
            return response()->json(['error' => 'Failed to Get Task '.$exception->getMessage()], 422);
        }


    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $userID = Auth::user()->id;
        $task = $this->taskService->getTask($id,$userID);
        return Inertia::render('task/EditForm', ['task' => $task]);
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
        $user = request()->user();

        try {
            $task = $this->taskService->updateTask($id, $validated, $user->id);
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
        $user = Auth::user();
        try {
            $this->taskService->deleteTask($id, $user->id);
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
            'task' => 'required|array',
            'task.*taskId' => 'required|exists:tasks,id',
            'task.*newOrder' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $user = $request->user();

        try {
           $updatedTasks = $this->taskService->bulkUpdateTasks($validator->validated(), $request['destination'], $user->id);
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
        $user = $request->user();
        $stats = $this->taskService->getTaskStatistics($user->id);
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

}
