<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\TaskService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected TaskService $taskService
    ) {}

    public function index(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $comments = $task->comments()->with('user:id,name,email,role')->latest()->get();

        return $this->successResponse(CommentResource::collection($comments), 'Comments retrieved successfully');
    }

    public function store(StoreCommentRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'comment' => $request->validated('comment'),
        ]);

        $this->taskService->logActivity($task, $request->user(), 'comment_added', null, substr($comment->comment, 0, 100), [
            'comment_id' => $comment->id,
        ]);

        return $this->successResponse(new CommentResource($comment->load('user')), 'Comment added successfully', JsonResponse::HTTP_CREATED);
    }

    public function update(UpdateCommentRequest $request, TaskComment $comment): JsonResponse
    {
        Gate::authorize('update', $comment);

        $comment->update($request->validated());

        return $this->successResponse(new CommentResource($comment->load('user')), 'Comment updated successfully');
    }

    public function destroy(TaskComment $comment): JsonResponse
    {
        Gate::authorize('delete', $comment);

        $task = $comment->task;
        $comment->delete();

        if ($task) {
            $this->taskService->logActivity($task, request()->user(), 'comment_deleted');
        }

        return $this->successResponse(null, 'Comment deleted successfully');
    }
}
