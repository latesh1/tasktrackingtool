<?php

namespace App\Http\Requests;

class StoreCommentRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'comment' => ['required', 'string', 'max:5000'],
        ];
    }
}
