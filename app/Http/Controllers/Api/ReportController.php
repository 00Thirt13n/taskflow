<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Task Counts by Status
        $statusCounts = Task::whereNull('parent_task_id')
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // 2. Task Counts by Priority
        $priorityCounts = Task::whereNull('parent_task_id')
            ->selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        // 3. Team Workload
        $teamUsers = User::withCount([
            'assignedTasks as active_tasks_count' => fn ($q) => $q->where('status', '!=', 'done')->whereNull('parent_task_id'),
            'assignedTasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done')->whereNull('parent_task_id'),
            'assignedTasks as overdue_tasks_count' => fn ($q) => $q->where('status', '!=', 'done')->whereNotNull('due_date')->where('due_date', '<', now()->toDateString())->whereNull('parent_task_id'),
        ])->get();

        $maxActive = max(1, $teamUsers->max('active_tasks_count') ?: 1);

        $workload = $teamUsers->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'active_tasks' => $u->active_tasks_count,
            'completed_tasks' => $u->completed_tasks_count,
            'overdue_tasks' => $u->overdue_tasks_count,
            'workload_pct' => min(100, round(($u->active_tasks_count / $maxActive) * 100)),
        ]);

        // 4. Project Health & Progress
        $projects = Project::with('tasks')->get()->map(function ($p) {
            $total = $p->tasks->whereNull('parent_task_id')->count();
            $done = $p->tasks->whereNull('parent_task_id')->where('status', 'done')->count();
            $progress = $total > 0 ? round(($done / $total) * 100) : 0;

            return [
                'id' => $p->id,
                'name' => $p->name,
                'key' => $p->key,
                'color' => $p->color,
                'status' => $p->status,
                'health' => $p->health,
                'total_tasks' => $total,
                'completed_tasks' => $done,
                'progress_pct' => $progress,
            ];
        });

        // 5. Velocity / Completion trend (last 7 days)
        $velocity = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $dayLabel = now()->subDays($i)->format('D');
            $created = Task::whereDate('created_at', $date)->count();
            $completed = Task::whereDate('completed_at', $date)->count();

            $velocity[] = [
                'date' => $date,
                'day' => $dayLabel,
                'created' => $created,
                'completed' => $completed,
            ];
        }

        return response()->json([
            'status_breakdown' => [
                'todo' => (int) ($statusCounts['todo'] ?? 0),
                'in_progress' => (int) ($statusCounts['in-progress'] ?? 0),
                'done' => (int) ($statusCounts['done'] ?? 0),
            ],
            'priority_breakdown' => [
                'low' => (int) ($priorityCounts['low'] ?? 0),
                'medium' => (int) ($priorityCounts['medium'] ?? 0),
                'high' => (int) ($priorityCounts['high'] ?? 0),
            ],
            'team_workload' => $workload,
            'projects' => $projects,
            'velocity' => $velocity,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $fileName = 'taskflow-export-' . now()->format('Y-m-d-His') . '.csv';

        $tasks = Task::with(['project', 'assignee', 'user'])
            ->whereNull('parent_task_id')
            ->orderBy('id', 'asc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($tasks) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'Task Key',
                'Title',
                'Description',
                'Status',
                'Priority',
                'Project',
                'Assignee',
                'Creator',
                'Due Date',
                'Estimated Hours',
                'Logged Hours',
                'Blocked',
                'Created At',
            ]);

            foreach ($tasks as $task) {
                fputcsv($handle, [
                    $task->task_key ?? ('TASK-' . $task->id),
                    $task->title,
                    $task->description,
                    $task->status->value,
                    $task->priority->value,
                    $task->project?->name ?? 'None',
                    $task->assignee?->name ?? 'Unassigned',
                    $task->user?->name ?? 'System',
                    $task->due_date ? $task->due_date->format('Y-m-d') : '',
                    $task->estimated_minutes ? round($task->estimated_minutes / 60, 1) : '',
                    $task->logged_minutes ? round($task->logged_minutes / 60, 1) : '',
                    $task->is_blocked ? 'Yes' : 'No',
                    $task->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
