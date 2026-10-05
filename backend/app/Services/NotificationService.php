<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Task;
use App\Models\User;

class NotificationService
{
    /**
     * Send an in-app notification to a user.
     */
    public function notify(User|int $recipient, string $type, string $title, string $message, ?Task $task = null): Notification
    {
        $userId = $recipient instanceof User ? $recipient->id : $recipient;

        return Notification::create([
            'user_id' => $userId,
            'task_id' => $task?->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'read_at' => null,
        ]);
    }
}
