<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Services\DashboardService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $metrics = $this->dashboardService->getMetrics($request->user());

        $formatted = [
            'total_tasks' => $metrics['total_tasks'],
            'todo_count' => $metrics['todo_count'],
            'in_progress_count' => $metrics['in_progress_count'],
            'blocked_count' => $metrics['blocked_count'],
            'done_count' => $metrics['done_count'],
            'overdue_count' => $metrics['overdue_count'],
            'tasks_due_today' => $metrics['tasks_due_today'],
            'tasks_due_this_week' => $metrics['tasks_due_this_week'],
            'total_projects' => $metrics['total_projects'],
            'recently_created_tasks' => TaskResource::collection($metrics['recently_created_tasks']),
            'recently_updated_tasks' => TaskResource::collection($metrics['recently_updated_tasks']),
            'overdue_tasks' => TaskResource::collection($metrics['overdue_tasks']),
        ];

        return $this->successResponse($formatted, 'Dashboard metrics retrieved');
    }
}
