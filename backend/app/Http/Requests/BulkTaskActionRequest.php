<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Validation\Rule;

class BulkTaskActionRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'task_ids' => ['required', 'array', 'min:1'],
            'task_ids.*' => ['integer', 'exists:tasks,id'],
            'action' => ['required', 'string', 'in:status,assign,delete'],
            'status' => ['required_if:action,status', 'nullable', 'string', Rule::in(Task::STATUSES)],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ];
    }
}
