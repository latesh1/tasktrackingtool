<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $member;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@test.com',
            'role' => User::ROLE_ADMIN,
        ]);

        $this->manager = User::factory()->create([
            'email' => 'manager@test.com',
            'role' => User::ROLE_MANAGER,
        ]);

        $this->member = User::factory()->create([
            'email' => 'member@test.com',
            'role' => User::ROLE_MEMBER,
        ]);

        $this->project = Project::create([
            'name' => 'Test Project',
            'description' => 'Test Description',
            'status' => 'active',
            'created_by' => $this->manager->id,
        ]);
    }

    public function test_user_registration_and_login(): void
    {
        // Registration
        $registerResponse = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => User::ROLE_MEMBER,
        ]);

        $registerResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token']]);

        // Login
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'newuser@test.com',
            'password' => 'secret123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $token = $loginResponse->json('data.token');

        // Current authenticated user
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.email', 'newuser@test.com');
    }

    public function test_task_creation_and_activity_logging(): void
    {
        $tag = Tag::create(['name' => 'Backend', 'color' => '#10b981']);

        $response = $this->actingAs($this->manager, 'sanctum')->postJson('/api/tasks', [
            'title' => 'Implement JWT Auth',
            'description' => 'Detailed task description',
            'priority' => Task::PRIORITY_HIGH,
            'status' => Task::STATUS_TODO,
            'due_date' => Carbon::now()->addDays(5)->toDateTimeString(),
            'project_id' => $this->project->id,
            'assigned_to' => $this->member->id,
            'tags' => [$tag->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Implement JWT Auth')
            ->assertJsonPath('data.priority', Task::PRIORITY_HIGH);

        $taskId = $response->json('data.id');

        // Check activity logged
        $this->assertDatabaseHas('task_activities', [
            'task_id' => $taskId,
            'action' => 'created',
        ]);

        // Check notification for assigned member
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->member->id,
            'type' => 'task_assigned',
        ]);
    }

    public function test_task_status_update_and_completed_at(): void
    {
        $task = Task::create([
            'title' => 'Status Test Task',
            'project_id' => $this->project->id,
            'created_by' => $this->manager->id,
            'assigned_to' => $this->member->id,
            'status' => Task::STATUS_TODO,
            'priority' => Task::PRIORITY_MEDIUM,
        ]);

        // Member assigned can update status
        $response = $this->actingAs($this->member, 'sanctum')->patchJson("/api/tasks/{$task->id}/status", [
            'status' => Task::STATUS_DONE,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Task::STATUS_DONE);

        $task->refresh();
        $this->assertNotNull($task->completed_at);

        // Moving back from done clears completed_at
        $this->actingAs($this->member, 'sanctum')->patchJson("/api/tasks/{$task->id}/status", [
            'status' => Task::STATUS_IN_PROGRESS,
        ]);

        $task->refresh();
        $this->assertNull($task->completed_at);
    }

    public function test_task_assignment_authorization(): void
    {
        $task = Task::create([
            'title' => 'Assignment Task',
            'project_id' => $this->project->id,
            'created_by' => $this->manager->id,
            'status' => Task::STATUS_TODO,
            'priority' => Task::PRIORITY_LOW,
        ]);

        // Regular member cannot assign
        $memberResponse = $this->actingAs($this->member, 'sanctum')->postJson("/api/tasks/{$task->id}/assign", [
            'assigned_to' => $this->member->id,
        ]);
        $memberResponse->assertStatus(403);

        // Manager can assign
        $managerResponse = $this->actingAs($this->manager, 'sanctum')->postJson("/api/tasks/{$task->id}/assign", [
            'assigned_to' => $this->member->id,
        ]);
        $managerResponse->assertStatus(200)
            ->assertJsonPath('data.assigned_to', $this->member->id);
    }

    public function test_subtask_progress_calculation(): void
    {
        $parentTask = Task::create([
            'title' => 'Parent Task',
            'project_id' => $this->project->id,
            'created_by' => $this->manager->id,
            'status' => Task::STATUS_IN_PROGRESS,
            'priority' => Task::PRIORITY_HIGH,
        ]);

        // Add 2 subtasks: 1 done, 1 todo
        $this->actingAs($this->manager, 'sanctum')->postJson("/api/tasks/{$parentTask->id}/subtasks", [
            'title' => 'Subtask 1',
            'status' => Task::STATUS_DONE,
        ]);

        $this->actingAs($this->manager, 'sanctum')->postJson("/api/tasks/{$parentTask->id}/subtasks", [
            'title' => 'Subtask 2',
            'status' => Task::STATUS_TODO,
        ]);

        $progressResponse = $this->actingAs($this->manager, 'sanctum')->getJson("/api/tasks/{$parentTask->id}/subtasks");

        $progressResponse->assertStatus(200)
            ->assertJsonPath('data.progress.total', 2)
            ->assertJsonPath('data.progress.completed', 1)
            ->assertJsonPath('data.progress.percentage', 50);
    }

    public function test_comments_and_authorization(): void
    {
        $task = Task::create([
            'title' => 'Comment Task',
            'project_id' => $this->project->id,
            'created_by' => $this->manager->id,
            'assigned_to' => $this->member->id,
            'status' => Task::STATUS_TODO,
            'priority' => Task::PRIORITY_MEDIUM,
        ]);

        // Add comment
        $commentResponse = $this->actingAs($this->member, 'sanctum')->postJson("/api/tasks/{$task->id}/comments", [
            'comment' => 'This is a test comment.',
        ]);

        $commentResponse->assertStatus(201)
            ->assertJsonPath('data.comment', 'This is a test comment.');

        $commentId = $commentResponse->json('data.id');

        // Other member cannot delete this comment
        $otherMember = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $unauthDelete = $this->actingAs($otherMember, 'sanctum')->deleteJson("/api/comments/{$commentId}");
        $unauthDelete->assertStatus(403);

        // Author can delete
        $authorDelete = $this->actingAs($this->member, 'sanctum')->deleteJson("/api/comments/{$commentId}");
        $authorDelete->assertStatus(200);
    }

    public function test_overdue_tasks_and_dashboard_counts(): void
    {
        // 1 Overdue task
        Task::create([
            'title' => 'Overdue Task',
            'project_id' => $this->project->id,
            'created_by' => $this->manager->id,
            'status' => Task::STATUS_TODO,
            'priority' => Task::PRIORITY_URGENT,
            'due_date' => Carbon::now()->subDays(3),
        ]);

        // 1 Completed task (not overdue even if due_date is past)
        Task::create([
            'title' => 'Done Task',
            'project_id' => $this->project->id,
            'created_by' => $this->manager->id,
            'status' => Task::STATUS_DONE,
            'priority' => Task::PRIORITY_LOW,
            'due_date' => Carbon::now()->subDays(5),
            'completed_at' => Carbon::now()->subDays(4),
        ]);

        // Check overdue endpoint
        $overdueResponse = $this->actingAs($this->manager, 'sanctum')->getJson('/api/tasks/overdue');
        $overdueResponse->assertStatus(200)
            ->assertJsonPath('data.pagination.total', 1);

        // Check dashboard endpoint
        $dashboardResponse = $this->actingAs($this->manager, 'sanctum')->getJson('/api/dashboard');
        $dashboardResponse->assertStatus(200)
            ->assertJsonPath('data.total_tasks', 2)
            ->assertJsonPath('data.todo_count', 1)
            ->assertJsonPath('data.done_count', 1)
            ->assertJsonPath('data.overdue_count', 1);
    }
}
