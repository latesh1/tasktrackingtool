<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TimeEntry;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TimeEntryController extends Controller
{
    use ApiResponseTrait;

    public function index(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $entries = $task->timeEntries()->with('user:id,name,email')->latest()->get();

        return $this->successResponse($entries, 'Time entries retrieved');
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $validated = $request->validate([
            'started_at' => ['required', 'date'],
            'ended_at' => ['nullable', 'date', 'after:started_at'],
            'duration' => ['nullable', 'integer', 'min:1'], // duration in minutes
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $duration = $validated['duration'] ?? null;
        if (!$duration && !empty($validated['ended_at'])) {
            $start = Carbon::parse($validated['started_at']);
            $end = Carbon::parse($validated['ended_at']);
            $duration = $end->diffInMinutes($start);
        }

        $entry = TimeEntry::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'started_at' => Carbon::parse($validated['started_at']),
            'ended_at' => !empty($validated['ended_at']) ? Carbon::parse($validated['ended_at']) : null,
            'duration' => $duration,
            'description' => $validated['description'] ?? null,
        ]);

        return $this->successResponse($entry->load('user'), 'Time entry logged successfully', JsonResponse::HTTP_CREATED);
    }

    public function destroy(TimeEntry $timeEntry, Request $request): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized to delete this time entry', null, JsonResponse::HTTP_FORBIDDEN);
        }

        $timeEntry->delete();

        return $this->successResponse(null, 'Time entry deleted');
    }
}
