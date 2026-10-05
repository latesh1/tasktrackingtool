<?php

namespace App\Http\Requests;

class StoreProjectRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,archived,completed'],
        ];
    }
}
