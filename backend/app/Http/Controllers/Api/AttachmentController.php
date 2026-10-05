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
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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

        $path = $file->store("attachments/{$task->id}", 'local');

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

    public function download(TaskAttachment $attachment): StreamedResponse|JsonResponse
    {
        Gate::authorize('view', $attachment->task);

        if (!Storage::disk('local')->exists($attachment->file_path)) {
            return $this->errorResponse('File not found on server.', null, JsonResponse::HTTP_NOT_FOUND);
        }

        return Storage::disk('local')->download($attachment->file_path, $attachment->file_name);
    }

    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        Gate::authorize('delete', $attachment);

        $task = $attachment->task;
        $fileName = $attachment->file_name;

        if (Storage::disk('local')->exists($attachment->file_path)) {
            Storage::disk('local')->delete($attachment->file_path);
        }

        $attachment->delete();

        if ($task) {
            $this->taskService->logActivity($task, request()->user(), 'attachment_removed', $fileName, null);
        }

        return $this->successResponse(null, 'Attachment deleted successfully');
    }
}
