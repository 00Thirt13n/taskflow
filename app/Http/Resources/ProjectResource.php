<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $tasksCount = $this->tasks()->count();
        $completedCount = $this->tasks()->where('status', 'done')->count();
        $inProgressCount = $this->tasks()->where('status', 'in-progress')->count();
        $overdueCount = $this->tasks()->where('status', '!=', 'done')->whereNotNull('due_date')->where('due_date', '<', now()->toDateString())->count();
        $blockedCount = $this->tasks()->where('status', '!=', 'done')->where('is_blocked', true)->count();
        $progressPct = $tasksCount > 0 ? round(($completedCount / $tasksCount) * 100) : 0;

        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'name' => $this->name,
            'key' => $this->key,
            'description' => $this->description,
            'status' => $this->status,
            'color' => $this->color,
            'icon' => $this->icon,
            'start_date' => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'target_date' => $this->target_date ? $this->target_date->format('Y-m-d') : null,
            'health' => $this->health,
            'owner' => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
            ],
            'members_count' => $this->members()->count(),
            'members' => $this->whenLoaded('members', fn () => $this->members->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'role' => $m->pivot->role,
            ])),
            'tasks_count' => $tasksCount,
            'completed_tasks_count' => $completedCount,
            'in_progress_tasks_count' => $inProgressCount,
            'overdue_tasks_count' => $overdueCount,
            'blocked_tasks_count' => $blockedCount,
            'progress_percentage' => $progressPct,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
