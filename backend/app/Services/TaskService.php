<?php

namespace App\Services;

use App\Models\Tag;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TaskService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Create a new task.
     */
    public function createTask(array $data, User $creator): Task
    {
        return DB::transaction(function () use ($data, $creator) {
            $taskData = [
                'project_id' => $data['project_id'] ?? null,
                'parent_task_id' => $data['parent_task_id'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'priority' => $data['priority'] ?? Task::PRIORITY_MEDIUM,
                'status' => $data['status'] ?? Task::STATUS_TODO,
                'due_date' => !empty($data['due_date']) ? Carbon::parse($data['due_date']) : null,
                'assigned_to' => $data['assigned_to'] ?? null,
                'created_by' => $creator->id,
                'completed_at' => ($data['status'] ?? null) === Task::STATUS_DONE ? Carbon::now() : null,
            ];

            $task = Task::create($taskData);

            // Handle tags
            if (isset($data['tags'])) {
                $tagIds = $this->syncTags($task, $data['tags']);
            }

            // Log activity
            $this->logActivity($task, $creator, 'created', null, $task->title, [
                'priority' => $task->priority,
                'status' => $task->status,
            ]);

            // Notify assigned user if assigned to someone else
            if ($task->assigned_to && $task->assigned_to !== $creator->id) {
                $this->notificationService->notify(
                    $task->assigned_to,
                    'task_assigned',
                    'New Task Assigned',
                    "You have been assigned to task: \"{$task->title}\"",
                    $task
                );
            }

            return $task->load(['project', 'assignee', 'creator', 'tags', 'subtasks']);
        });
    }

    /**
     * Update an existing task and record diffs in activity history.
     */
    public function updateTask(Task $task, array $data, User $updater): Task
    {
        return DB::transaction(function () use ($task, $data, $updater) {
            $oldValues = $task->only([
                'title',
                'description',
                'priority',
                'status',
                'due_date',
                'assigned_to',
                'project_id',
            ]);

            if (isset($data['status'])) {
                if ($data['status'] === Task::STATUS_DONE && $task->status !== Task::STATUS_DONE) {
                    $task->completed_at = Carbon::now();
                } elseif ($data['status'] !== Task::STATUS_DONE && $task->status === Task::STATUS_DONE) {
                    $task->completed_at = null;
                }
            }

            if (isset($data['due_date'])) {
                $data['due_date'] = !empty($data['due_date']) ? Carbon::parse($data['due_date']) : null;
            }

            $task->fill($data);
            $task->save();

            // Track changes and record activities
            foreach ($oldValues as $field => $oldValue) {
                if (array_key_exists($field, $data)) {
                    $newValue = $data[$field];
                    $oldFormatted = $oldValue instanceof Carbon ? $oldValue->toIso8601String() : (string) $oldValue;
                    $newFormatted = $newValue instanceof Carbon ? $newValue->toIso8601String() : (string) $newValue;

                    if ($oldFormatted !== $newFormatted) {
                        $action = match ($field) {
                            'status' => 'status_changed',
                            'priority' => 'priority_changed',
                            'assigned_to' => 'assigned',
                            'due_date' => 'due_date_changed',
                            'title' => 'title_changed',
                            'description' => 'description_changed',
                            'project_id' => 'project_changed',
                            default => "{$field}_updated",
                        };

                        $this->logActivity($task, $updater, $action, $oldFormatted, $newFormatted);

                        // Notifications for assignment
                        if ($field === 'assigned_to' && !empty($newValue) && (int)$newValue !== $updater->id) {
                            $this->notificationService->notify(
                                (int)$newValue,
                                'task_assigned',
                                'Task Reassigned',
                                "You have been assigned to task: \"{$task->title}\"",
                                $task
                            );
                        }

                        // Notifications for status change
                        if ($field === 'status') {
                            $this->notifyStatusChange($task, $updater, $newFormatted);
                        }
                    }
                }
            }

            // Sync tags if passed
            if (isset($data['tags'])) {
                $this->syncTags($task, $data['tags']);
            }

            return $task->fresh(['project', 'assignee', 'creator', 'tags', 'subtasks']);
        });
    }

    /**
     * Assign or reassign a task.
     */
    public function assignTask(Task $task, ?int $newAssigneeId, User $assigner): Task
    {
        $oldAssigneeId = $task->assigned_to;

        if ($oldAssigneeId === $newAssigneeId) {
            return $task;
        }

        $task->assigned_to = $newAssigneeId;
        $task->save();

        $action = $oldAssigneeId ? 'reassigned' : 'assigned';
        $this->logActivity(
            $task,
            $assigner,
            $action,
            $oldAssigneeId ? (string) $oldAssigneeId : null,
            $newAssigneeId ? (string) $newAssigneeId : 'unassigned'
        );

        if ($newAssigneeId && $newAssigneeId !== $assigner->id) {
            $this->notificationService->notify(
                $newAssigneeId,
                'task_assigned',
                'Task Assigned',
                "Task \"{$task->title}\" has been assigned to you by {$assigner->name}.",
                $task
            );
        }

        return $task->fresh(['assignee', 'project', 'tags']);
    }

    /**
     * Update task status with automated completed_at handling and activities.
     */
    public function updateStatus(Task $task, string $newStatus, User $updater): Task
    {
        $oldStatus = $task->status;

        if ($oldStatus === $newStatus) {
            return $task;
        }

        $task->status = $newStatus;
        if ($newStatus === Task::STATUS_DONE) {
            $task->completed_at = Carbon::now();
        } else {
            $task->completed_at = null;
        }
        $task->save();

        $this->logActivity($task, $updater, 'status_changed', $oldStatus, $newStatus);
        $this->notifyStatusChange($task, $updater, $newStatus);

        return $task->fresh(['assignee', 'project', 'tags']);
    }

    /**
     * Create a subtask under a parent task.
     */
    public function createSubtask(Task $parentTask, array $data, User $creator): Task
    {
        $data['parent_task_id'] = $parentTask->id;
        $data['project_id'] = $parentTask->project_id;

        $subtask = $this->createTask($data, $creator);

        $this->logActivity($parentTask, $creator, 'subtask_created', null, $subtask->title, [
            'subtask_id' => $subtask->id,
        ]);

        return $subtask;
    }

    /**
     * Sync tags by array of IDs or names.
     */
    public function syncTags(Task $task, array $tags): array
    {
        $tagIds = [];
        foreach ($tags as $tagItem) {
            if (is_numeric($tagItem)) {
                $tagIds[] = (int) $tagItem;
            } elseif (is_string($tagItem)) {
                $tag = Tag::firstOrCreate(
                    ['name' => trim($tagItem)],
                    ['color' => '#6366f1']
                );
                $tagIds[] = $tag->id;
            } elseif (is_array($tagItem) && isset($tagItem['id'])) {
                $tagIds[] = (int) $tagItem['id'];
            }
        }

        $task->tags()->sync($tagIds);

        return $tagIds;
    }

    /**
     * Log activity on a task.
     */
    public function logActivity(
        Task $task,
        ?User $user,
        string $action,
        ?string $oldValue = null,
        ?string $newValue = null,
        ?array $metadata = null
    ): TaskActivity {
        return TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $user?->id,
            'action' => $action,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Notify creator or assignee of status update.
     */
    protected function notifyStatusChange(Task $task, User $updater, string $newStatus): void
    {
        $recipients = array_unique(array_filter([$task->created_by, $task->assigned_to]));

        foreach ($recipients as $recipientId) {
            if ($recipientId !== $updater->id) {
                $this->notificationService->notify(
                    $recipientId,
                    'status_changed',
                    'Task Status Updated',
                    "Task \"{$task->title}\" status changed to {$newStatus} by {$updater->name}.",
                    $task
                );
            }
        }
    }
}
