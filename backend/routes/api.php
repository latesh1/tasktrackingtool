<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TimeEntryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Health check — no auth, no rate limit (used by Render health probe)
Route::get('/health', [HealthController::class, 'index']);

// Auth endpoints — rate limited to prevent brute-force
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Current user & user listing
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/users', [AuthController::class, 'users']);

    // Dashboard metrics
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Overdue tasks & bulk actions (Must be declared before {task} wildcard)
    Route::get('/tasks/overdue', [TaskController::class, 'overdue']);
    Route::post('/tasks/bulk', [TaskController::class, 'bulkAction']);

    // Tasks CRUD
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{task}/assign', [TaskController::class, 'assign']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::get('/tasks/{task}/subtasks', [TaskController::class, 'subtasks']);
    Route::post('/tasks/{task}/subtasks', [TaskController::class, 'storeSubtask']);
    Route::get('/tasks/{task}/activities', [ActivityController::class, 'index']);

    // Task Comments
    Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Task Attachments
    Route::get('/tasks/{task}/attachments', [AttachmentController::class, 'index']);
    Route::post('/tasks/{task}/attachments', [AttachmentController::class, 'store']);
    Route::get('/attachments/{attachment}/download', [AttachmentController::class, 'download']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);

    // Projects CRUD & project tasks
    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects/{project}/tasks', [ProjectController::class, 'tasks']);

    // Tags CRUD
    Route::apiResource('tags', TagController::class);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // Optional Time Entries
    Route::get('/tasks/{task}/time-entries', [TimeEntryController::class, 'index']);
    Route::post('/tasks/{task}/time-entries', [TimeEntryController::class, 'store']);
    Route::delete('/time-entries/{timeEntry}', [TimeEntryController::class, 'destroy']);
});
