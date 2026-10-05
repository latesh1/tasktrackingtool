<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\Task;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ActivityController extends Controller
{
    use ApiResponseTrait;

    public function index(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $activities = $task->activities()->with('user:id,name,email,role')->latest()->get();

        return $this->successResponse(ActivityResource::collection($activities), 'Activities retrieved');
    }
}
