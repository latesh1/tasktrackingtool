<?php

namespace App\Policies;

use App\Models\TaskAttachment;
use App\Models\User;

class TaskAttachmentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function delete(User $user, TaskAttachment $attachment): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $attachment->user_id === $user->id;
    }
}
