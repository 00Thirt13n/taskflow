<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'task_key',
        'parent_task_id',
        'user_id',
        'assignee_id',
        'title',
        'description',
        'status',
        'priority',
        'position',
        'estimated_minutes',
        'logged_minutes',
        'due_date',
        'start_date',
        'completed_at',
        'is_blocked',
        'blocker_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
            'due_date' => 'date:Y-m-d',
            'start_date' => 'date:Y-m-d',
            'completed_at' => 'datetime',
            'is_blocked' => 'boolean',
            'position' => 'integer',
            'estimated_minutes' => 'integer',
            'logged_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id')->orderBy('position')->orderBy('id');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'task_labels');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'asc');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class)->orderBy('created_at', 'desc');
    }

    public function dependencies(): HasMany
    {
        return $this->hasMany(TaskDependency::class);
    }

    public function blockedBy(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'depends_on_task_id')
            ->wherePivot('type', 'blocked_by');
    }

    public function blocks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'depends_on_task_id')
            ->wherePivot('type', 'blocks');
    }

    /**
     * Scope query to apply dynamic enterprise filters.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['status'] ?? null, function (Builder $q, string $status) {
                $q->where('status', $status);
            })
            ->when($filters['priority'] ?? null, function (Builder $q, string $priority) {
                $q->where('priority', $priority);
            })
            ->when($filters['project_id'] ?? null, function (Builder $q, int|string $projectId) {
                $q->where('project_id', $projectId);
            })
            ->when($filters['assignee_id'] ?? null, function (Builder $q, int|string $assigneeId) {
                $q->where('assignee_id', $assigneeId);
            })
            ->when($filters['due_date'] ?? null, function (Builder $q, string $dueDate) {
                $q->whereDate('due_date', $dueDate);
            })
            ->when($filters['overdue'] ?? null, function (Builder $q) {
                $q->where('status', '!=', 'done')
                  ->whereNotNull('due_date')
                  ->where('due_date', '<', now()->toDateString());
            })
            ->when($filters['today'] ?? null, function (Builder $q) {
                $q->whereDate('due_date', now()->toDateString());
            })
            ->when($filters['this_week'] ?? null, function (Builder $q) {
                $q->whereBetween('due_date', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]);
            })
            ->when(isset($filters['is_blocked']), function (Builder $q) use ($filters) {
                $q->where('is_blocked', filter_var($filters['is_blocked'], FILTER_VALIDATE_BOOLEAN));
            })
            ->when($filters['label_id'] ?? null, function (Builder $q, int|string $labelId) {
                $q->whereHas('labels', function (Builder $sub) use ($labelId) {
                    $sub->where('labels.id', $labelId);
                });
            })
            ->when($filters['search'] ?? null, function (Builder $q, string $search) {
                $q->where(function (Builder $sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('task_key', 'like', "%{$search}%");
                });
            })
            ->when($filters['user_id'] ?? null, function (Builder $q, int|string $userId) {
                $q->where('user_id', $userId);
            });
    }
}
