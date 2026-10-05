<?php

namespace App\Http\Requests;

class AssignTaskRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'assigned_to' => ['nullable', 'exists:users,id'],
        ];
    }
}
