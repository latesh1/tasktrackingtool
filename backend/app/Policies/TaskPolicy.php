<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $task->assigned_to === $user->id 
            || $task->created_by === $user->id
            || $task->parentTask?->assigned_to === $user->id;
    }

    public function create(User $user): bool
    {
        // Admin and manager can always create tasks. Members can also create tasks.
        return true;
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $task->assigned_to === $user->id || $task->created_by === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $task->created_by === $user->id;
    }

    public function assign(User $user, Task $task): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    public function updateStatus(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $task->assigned_to === $user->id || $task->created_by === $user->id;
    }

    public function createSubtask(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $task->assigned_to === $user->id || $task->created_by === $user->id;
    }

    public function uploadAttachment(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $task->assigned_to === $user->id || $task->created_by === $user->id;
    }
}
