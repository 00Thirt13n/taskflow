<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any tasks.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the specific task.
     */
    public function view(User $user, Task $task): bool
    {
        if ($user->isAdmin() || $task->user_id === $user->id || $task->assignee_id === $user->id) {
            return true;
        }

        if ($task->project_id && $task->project) {
            return $task->project->owner_id === $user->id
                || $task->project->members()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create tasks.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->isAdmin() || $task->user_id === $user->id || $task->assignee_id === $user->id) {
            return true;
        }

        if ($task->project_id && $task->project) {
            return $task->project->owner_id === $user->id
                || $task->project->members()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        if ($user->isAdmin() || $task->user_id === $user->id) {
            return true;
        }

        if ($task->project_id && $task->project && $task->project->owner_id === $user->id) {
            return true;
        }

        return false;
    }
}
