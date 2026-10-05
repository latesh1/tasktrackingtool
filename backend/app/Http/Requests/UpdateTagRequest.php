<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateTagRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $tagId = $this->route('tag') ? (is_object($this->route('tag')) ? $this->route('tag')->id : $this->route('tag')) : null;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('tags', 'name')->ignore($tagId),
            ],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/'],
        ];
    }
}
