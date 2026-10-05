<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'string', Rule::in(Task::PRIORITIES)],
            'status' => ['nullable', 'string', Rule::in(Task::STATUSES)],
            'due_date' => ['nullable', 'date'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'parent_task_id' => ['nullable', 'exists:tasks,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable'],
        ];
    }
}
