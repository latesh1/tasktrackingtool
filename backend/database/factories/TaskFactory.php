<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $status = fake()->randomElement(Task::STATUSES);

        return [
            'project_id' => Project::factory(),
            'parent_task_id' => null,
            'title' => fake()->sentence(5),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(Task::PRIORITIES),
            'status' => $status,
            'due_date' => fake()->dateTimeBetween('-10 days', '+20 days'),
            'assigned_to' => User::factory(),
            'created_by' => User::factory(),
            'completed_at' => $status === Task::STATUS_DONE ? now() : null,
        ];
    }
}
