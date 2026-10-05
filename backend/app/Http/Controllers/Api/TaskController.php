<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTaskRequest;
use App\Http\Requests\BulkTaskActionRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateStatusRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskDetailResource;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected TaskService $taskService
    ) {}

    /**
     * List tasks with server-side filtering, sorting, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);
        $perPage = min(max($perPage, 1), 100);

        $sortBy = $request->input('sort_by', 'created_at');
        $allowedSorts = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = Task::query()
            ->with(['project:id,name', 'assignee:id,name,email,role', 'creator:id,name,email,role', 'tags:id,name,color'])
            ->withCount(['comments', 'attachments', 'subtasks'])
            ->filter($request->all());

        // By default show root tasks unless user specifically requests subtasks or is searching
        if (!$request->has('include_subtasks') && !$request->has('search')) {
            $query->rootOnly();
        }

        // Apply role scoping if regular member and view_all is not enabled
        if ($user->isMember() && $request->boolean('my_tasks_only', false)) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('created_by', $user->id);
            });
        }

        // Sorting priority logically if sorting by priority
        if ($sortBy === 'priority') {
            if (\Illuminate\Support\Facades\DB::getDriverName() === 'mysql') {
                $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low') " . $sortDirection);
            } else {
                $query->orderBy('priority', $sortDirection);
            }
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $tasks = $query->paginate($perPage);

        return $this->successResponse([
            'items' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
                'has_more_pages' => $tasks->hasMorePages(),
            ],
        ], 'Tasks retrieved successfully');
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        Gate::authorize('create', Task::class);

        $task = $this->taskService->createTask($request->validated(), $request->user());

        return $this->successResponse(new TaskResource($task), 'Task created successfully', JsonResponse::HTTP_CREATED);
    }

    /**
     * Display a specific task with all nested relations.
     */
    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $task->load([
            'project',
            'assignee',
            'creator',
            'parentTask',
            'tags',
            'subtasks.assignee',
            'comments.user',
            'attachments.user',
            'activities.user',
        ]);

        return $this->successResponse(new TaskDetailResource($task), 'Task details retrieved');
    }

    /**
     * Update task details.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $updatedTask = $this->taskService->updateTask($task, $request->validated(), $request->user());

        return $this->successResponse(new TaskResource($updatedTask), 'Task updated successfully');
    }

    /**
     * Delete a task.
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return $this->successResponse(null, 'Task deleted successfully');
    }

    /**
     * Assign or reassign a task to a user.
     */
    public function assign(AssignTaskRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('assign', $task);

        $assigneeId = $request->input('assigned_to') ? (int) $request->input('assigned_to') : null;
        $updatedTask = $this->taskService->assignTask($task, $assigneeId, $request->user());

        return $this->successResponse(new TaskResource($updatedTask), 'Task assignment updated successfully');
    }

    /**
     * Update task status (todo, in_progress, blocked, done).
     */
    public function updateStatus(UpdateStatusRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('updateStatus', $task);

        $updatedTask = $this->taskService->updateStatus($task, $request->validated('status'), $request->user());

        return $this->successResponse(new TaskResource($updatedTask), 'Task status updated successfully');
    }

    /**
     * List subtasks for a given task.
     */
    public function subtasks(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $subtasks = $task->subtasks()
            ->with(['assignee', 'tags'])
            ->latest()
            ->get();

        return $this->successResponse([
            'progress' => $task->getSubtaskProgress(),
            'subtasks' => TaskResource::collection($subtasks),
        ], 'Subtasks retrieved successfully');
    }

    /**
     * Create a subtask for a given parent task.
     */
    public function storeSubtask(StoreTaskRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('createSubtask', $task);

        $subtask = $this->taskService->createSubtask($task, $request->validated(), $request->user());

        return $this->successResponse(new TaskResource($subtask), 'Subtask created successfully', JsonResponse::HTTP_CREATED);
    }

    /**
     * Get paginated overdue tasks.
     */
    public function overdue(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $user = $request->user();

        $query = Task::query()
            ->overdue()
            ->with(['project:id,name', 'assignee:id,name,email', 'tags:id,name,color'])
            ->orderBy('due_date', 'asc');

        if ($user->isMember() && $request->boolean('my_tasks_only', false)) {
            $query->where('assigned_to', $user->id);
        }

        $tasks = $query->paginate($perPage);

        return $this->successResponse([
            'items' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ], 'Overdue tasks retrieved successfully');
    }

    /**
     * Bulk actions for tasks (status change, assign, delete).
     */
    public function bulkAction(BulkTaskActionRequest $request): JsonResponse
    {
        $taskIds = $request->input('task_ids');
        $action = $request->input('action');
        $user = $request->user();

        $tasks = Task::whereIn('id', $taskIds)->get();

        $affectedCount = 0;
        foreach ($tasks as $task) {
            if ($action === 'status' && Gate::allows('updateStatus', $task)) {
                $this->taskService->updateStatus($task, $request->input('status'), $user);
                $affectedCount++;
            } elseif ($action === 'assign' && Gate::allows('assign', $task)) {
                $assigneeId = $request->input('assigned_to') ? (int) $request->input('assigned_to') : null;
                $this->taskService->assignTask($task, $assigneeId, $user);
                $affectedCount++;
            } elseif ($action === 'delete' && Gate::allows('delete', $task)) {
                $task->delete();
                $affectedCount++;
            }
        }

        return $this->successResponse([
            'affected_count' => $affectedCount,
        ], "Bulk {$action} action completed successfully for {$affectedCount} tasks");
    }
}
