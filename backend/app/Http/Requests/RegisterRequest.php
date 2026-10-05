<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Validation\Rule;

class RegisterRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', 'string', Rule::in([User::ROLE_ADMIN, User::ROLE_MANAGER, User::ROLE_MEMBER])],
        ];
    }
}
