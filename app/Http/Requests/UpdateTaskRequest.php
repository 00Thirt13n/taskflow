<?php

namespace App\Http\Requests;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('title')) {
            $this->merge([
                'title' => trim((string) $this->input('title')),
            ]);
        }
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['sometimes', 'required', new Enum(TaskStatus::class)],
            'priority' => ['sometimes', 'required', new Enum(TaskPriority::class)],
            'due_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'start_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'logged_minutes' => ['nullable', 'integer', 'min:0'],
            'is_blocked' => ['nullable', 'boolean'],
            'blocker_reason' => ['nullable', 'string', 'max:255'],
            'labels' => ['nullable', 'array'],
            'labels.*' => ['integer', 'exists:labels,id'],
        ];

        if ($this->user()?->isAdmin()) {
            $rules['user_id'] = ['nullable', 'integer', 'exists:users,id'];
        }

        return $rules;
    }
}
