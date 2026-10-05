<?php

namespace App\Http\Requests;

class StoreTagRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', 'unique:tags,name'],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/'],
        ];
    }
}
