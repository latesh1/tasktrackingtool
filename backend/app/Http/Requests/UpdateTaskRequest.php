<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['sometimes', 'required', 'string', Rule::in(Task::PRIORITIES)],
            'status' => ['sometimes', 'required', 'string', Rule::in(Task::STATUSES)],
            'due_date' => ['nullable', 'date'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable'],
        ];
    }
}
