<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'tasks' => [],
                'projects' => [],
                'users' => [],
            ]);
        }

        $user = $request->user();

        // 1. Tasks
        $taskQuery = Task::where(function ($sub) use ($q) {
            $sub->where('title', 'like', "%{$q}%")
                ->orWhere('task_key', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%");
        })->with('project:id,key,name,color');

        if (!$user->isAdmin()) {
            $taskQuery->where(function ($sub) use ($user) {
                $sub->where('user_id', $user->id)
                    ->orWhere('assignee_id', $user->id)
                    ->orWhereHas('project.members', function ($m) use ($user) {
                        $m->where('users.id', $user->id);
                    });
            });
        }

        $tasks = $taskQuery->limit(8)->get(['id', 'task_key', 'project_id', 'title', 'status', 'priority']);

        // 2. Projects
        $projectQuery = Project::where(function ($sub) use ($q) {
            $sub->where('name', 'like', "%{$q}%")
                ->orWhere('key', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%");
        });

        if (!$user->isAdmin()) {
            $projectQuery->where(function ($sub) use ($user) {
                $sub->where('owner_id', $user->id)
                    ->orWhereHas('members', function ($m) use ($user) {
                        $m->where('users.id', $user->id);
                    });
            });
        }

        $projects = $projectQuery->limit(5)->get(['id', 'name', 'key', 'color', 'icon', 'status']);

        // 3. Team Users
        $users = User::where('name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'name', 'email']);

        return response()->json([
            'tasks' => $tasks->map(fn ($t) => [
                'id' => $t->id,
                'key' => $t->task_key ?? ('TASK-' . $t->id),
                'title' => $t->title,
                'status' => $t->status->value,
                'priority' => $t->priority->value,
                'project_name' => $t->project?->name,
                'project_color' => $t->project?->color,
            ]),
            'projects' => $projects,
            'users' => $users,
        ]);
    }
}
