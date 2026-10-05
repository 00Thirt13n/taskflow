<?php

namespace App\Http\Resources;

use App\Enums\TaskStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isOverdue = false;
        if ($this->due_date && $this->status !== TaskStatus::Done) {
            $isOverdue = Carbon::parse($this->due_date)->endOfDay()->isPast();
        }

        $subtasksTotal = $this->relationLoaded('subtasks')
            ? $this->subtasks->count()
            : ($this->subtasks_count ?? 0);

        $subtasksCompleted = $this->relationLoaded('subtasks')
            ? $this->subtasks->where('status', TaskStatus::Done)->count()
            : 0;

        return [
            'id' => $this->id,
            'task_key' => $this->task_key ?? ('TASK-' . $this->id),
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'priority' => $this->priority->value,
            'priority_label' => $this->priority->label(),
            'position' => $this->position ?? 0,
            'estimated_minutes' => $this->estimated_minutes,
            'logged_minutes' => $this->logged_minutes ?? 0,
            'due_date' => $this->due_date ? Carbon::parse($this->due_date)->format('Y-m-d') : null,
            'start_date' => $this->start_date ? Carbon::parse($this->start_date)->format('Y-m-d') : null,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'is_overdue' => $isOverdue,
            'is_blocked' => (bool) $this->is_blocked,
            'blocker_reason' => $this->blocker_reason,
            'project_id' => $this->project_id,
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
                'key' => $this->project->key,
                'color' => $this->project->color,
                'icon' => $this->project->icon,
            ]),
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'assignee_id' => $this->assignee_id,
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
                'email' => $this->assignee->email,
            ] : null),
            'parent_task_id' => $this->parent_task_id,
            'subtasks_count' => $subtasksTotal,
            'subtasks_completed_count' => $subtasksCompleted,
            'subtasks' => TaskResource::collection($this->whenLoaded('subtasks')),
            'labels' => $this->whenLoaded('labels', fn () => $this->labels->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
                'color' => $l->color,
            ])),
            'comments' => $this->whenLoaded('comments', fn () => $this->comments->map(fn ($c) => [
                'id' => $c->id,
                'body' => $c->body,
                'user' => [
                    'id' => $c->user->id,
                    'name' => $c->user->name,
                    'email' => $c->user->email,
                ],
                'created_at' => $c->created_at?->toIso8601String(),
            ])),
            'activity_logs' => $this->whenLoaded('activityLogs', fn () => $this->activityLogs->map(fn ($a) => [
                'id' => $a->id,
                'action' => $a->action,
                'field' => $a->field,
                'old_value' => $a->old_value,
                'new_value' => $a->new_value,
                'user' => [
                    'id' => $a->user->id,
                    'name' => $a->user->name,
                ],
                'created_at' => $a->created_at?->toIso8601String(),
            ])),
            'blocked_by' => $this->whenLoaded('blockedBy', fn () => $this->blockedBy->map(fn ($b) => [
                'id' => $b->id,
                'task_key' => $b->task_key ?? ('TASK-' . $b->id),
                'title' => $b->title,
                'status' => $b->status->value,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
