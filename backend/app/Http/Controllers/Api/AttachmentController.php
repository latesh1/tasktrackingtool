<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttachmentRequest;
use App\Http\Resources\AttachmentResource;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\TaskService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected TaskService $taskService
    ) {}

    public function index(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $attachments = $task->attachments()->with('user:id,name,email')->latest()->get();

        return $this->successResponse(AttachmentResource::collection($attachments), 'Attachments retrieved');
    }

    public function store(StoreAttachmentRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('uploadAttachment', $task);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileType = $file->getClientMimeType() ?: $file->getClientOriginalExtension();

        $disk = config('filesystems.default', 'local');
        $path = $file->store("attachments/{$task->id}", $disk);

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'file_name' => $fileName,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
        ]);

        $this->taskService->logActivity($task, $request->user(), 'attachment_added', null, $fileName, [
            'attachment_id' => $attachment->id,
        ]);

        return $this->successResponse(new AttachmentResource($attachment->load('user')), 'Attachment uploaded successfully', JsonResponse::HTTP_CREATED);
    }

    public function download(Request $request, TaskAttachment $attachment): Response
    {
        // Support direct browser downloads via ?token= query parameter if not in headers
        if (!$request->user() && $request->has('token')) {
            $accessToken = PersonalAccessToken::findToken($request->query('token'));
            if ($accessToken && (!$accessToken->expires_at || $accessToken->expires_at->isFuture())) {
                auth()->setUser($accessToken->tokenable);
            }
        }

        Gate::authorize('view', $attachment->task);

        $disk = config('filesystems.default', 'local');

        if (!Storage::disk($disk)->exists($attachment->file_path)) {
            return $this->errorResponse('File not found on storage server.', null, JsonResponse::HTTP_NOT_FOUND);
        }

        return Storage::disk($disk)->download($attachment->file_path, $attachment->file_name);
    }

    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        Gate::authorize('delete', $attachment);

        $task = $attachment->task;
        $fileName = $attachment->file_name;
        $disk = config('filesystems.default', 'local');

        if (Storage::disk($disk)->exists($attachment->file_path)) {
            Storage::disk($disk)->delete($attachment->file_path);
        }

        $attachment->delete();

        if ($task) {
            $this->taskService->logActivity($task, request()->user(), 'attachment_removed', $fileName, null);
        }

        return $this->successResponse(null, 'Attachment deleted successfully');
    }
}

