<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'key',
        'description',
        'status',
        'color',
        'icon',
        'start_date',
        'target_date',
        'owner_id',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'target_date' => 'date:Y-m-d',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }

    /**
     * Compute real project health indicator: Healthy, At Risk, or Delayed.
     * Calculation based on overdue task count, blocked tasks, and target date proximity.
     */
    public function getHealthAttribute(): string
    {
        $overdueCount = $this->tasks()
            ->where('status', '!=', 'done')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->count();

        $blockedCount = $this->tasks()
            ->where('status', '!=', 'done')
            ->where('is_blocked', true)
            ->count();

        if ($overdueCount > 3 || $blockedCount > 2) {
            return 'Delayed';
        }

        if ($overdueCount > 0 || $blockedCount > 0) {
            return 'At Risk';
        }

        return 'Healthy';
    }
}
