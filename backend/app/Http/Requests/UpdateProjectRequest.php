<?php

namespace App\Http\Requests;

class UpdateProjectRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:active,archived,completed'],
        ];
    }
}
