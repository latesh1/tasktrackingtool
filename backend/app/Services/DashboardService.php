<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get aggregated metrics for dashboard.
     */
    public function getMetrics(?User $user = null): array
    {
        $now = Carbon::now();
        $startOfDay = $now->copy()->startOfDay();
        $endOfDay = $now->copy()->endOfDay();
        $endOfWeek = $now->copy()->endOfWeek();

        // Scope to user if member
        $baseQuery = Task::query()->rootOnly();
        if ($user && $user->isMember()) {
            $baseQuery->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('created_by', $user->id);
            });
        }

        // Single aggregation query for status counts
        $statusCounts = (clone $baseQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $todoCount = $statusCounts[Task::STATUS_TODO] ?? 0;
        $inProgressCount = $statusCounts[Task::STATUS_IN_PROGRESS] ?? 0;
        $blockedCount = $statusCounts[Task::STATUS_BLOCKED] ?? 0;
        $doneCount = $statusCounts[Task::STATUS_DONE] ?? 0;
        $totalTasks = $todoCount + $inProgressCount + $blockedCount + $doneCount;

        // Overdue count (due_date < now and status != done)
        $overdueCount = (clone $baseQuery)
            ->where('status', '!=', Task::STATUS_DONE)
            ->whereNotNull('due_date')
            ->where('due_date', '<', $now)
            ->count();

        // Due today
        $dueTodayCount = (clone $baseQuery)
            ->where('status', '!=', Task::STATUS_DONE)
            ->whereBetween('due_date', [$startOfDay, $endOfDay])
            ->count();

        // Due this week
        $dueThisWeekCount = (clone $baseQuery)
            ->where('status', '!=', Task::STATUS_DONE)
            ->whereBetween('due_date', [$startOfDay, $endOfWeek])
            ->count();

        // Recently created tasks
        $recentlyCreatedTasks = (clone $baseQuery)
            ->with(['project:id,name', 'assignee:id,name,email', 'tags:id,name,color'])
            ->latest('created_at')
            ->limit(5)
            ->get();

        // Recently updated tasks
        $recentlyUpdatedTasks = (clone $baseQuery)
            ->with(['project:id,name', 'assignee:id,name,email', 'tags:id,name,color'])
            ->latest('updated_at')
            ->limit(5)
            ->get();

        // Overdue tasks preview
        $overdueTasks = (clone $baseQuery)
            ->where('status', '!=', Task::STATUS_DONE)
            ->whereNotNull('due_date')
            ->where('due_date', '<', $now)
            ->with(['project:id,name', 'assignee:id,name,email', 'tags:id,name,color'])
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        // Total projects count
        $totalProjects = Project::count();

        return [
            'total_tasks' => $totalTasks,
            'todo_count' => $todoCount,
            'in_progress_count' => $inProgressCount,
            'blocked_count' => $blockedCount,
            'done_count' => $doneCount,
            'overdue_count' => $overdueCount,
            'tasks_due_today' => $dueTodayCount,
            'tasks_due_this_week' => $dueThisWeekCount,
            'total_projects' => $totalProjects,
            'recently_created_tasks' => $recentlyCreatedTasks,
            'recently_updated_tasks' => $recentlyUpdatedTasks,
            'overdue_tasks' => $overdueTasks,
        ];
    }
}
