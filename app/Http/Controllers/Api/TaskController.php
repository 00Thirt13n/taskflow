<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Services\AuditLoggerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    public function __construct(
        protected AuditLoggerService $auditLogger
    ) {}

    /**
     * Display a filtered, multi-view compatible list of tasks.
     */
    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        Gate::authorize('viewAny', Task::class);

        /** @var User $user */
        $user = $request->user();

        $query = Task::query()
            ->with([
                'user:id,name,email',
                'assignee:id,name,email',
                'project:id,name,key,color,icon',
                'labels:id,name,color',
            ])
            ->withCount('subtasks')
            ->whereNull('parent_task_id'); // Only parent tasks in top-level views

        // Access boundary: regular users see tasks they created, are assigned to, or belong to via their projects
        if (!$user->isAdmin()) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('assignee_id', $user->id)
                  ->orWhereHas('project.members', function ($m) use ($user) {
                      $m->where('users.id', $user->id);
                  });
            });
        }

        // Apply enterprise filter scope
        $query->filter($request->only([
            'status',
            'priority',
            'due_date',
            'overdue',
            'today',
            'this_week',
            'search',
            'user_id',
            'assignee_id',
            'project_id',
            'is_blocked',
            'label_id',
        ]));

        // View mode handling: board, calendar, and timeline need unpaginated sets
        $viewMode = $request->input('view_mode', 'list');
        if (in_array($viewMode, ['board', 'calendar', 'timeline', 'all'])) {
            $tasks = $query->orderBy('position', 'asc')->orderBy('due_date', 'asc')->get();
            return response()->json([
                'data' => TaskResource::collection($tasks),
            ]);
        }

        // Ordering strategy for tabular list
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'due_date') {
            $query->orderByRaw('due_date IS NULL, due_date ' . $sortOrder);
        } elseif ($sortBy === 'priority') {
            $query->orderByRaw("FIELD(priority, 'high', 'medium', 'low') " . $sortOrder);
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        // Enforce safe pagination boundaries (default: 10, max: 50)
        $perPage = max(1, min((int) $request->input('per_page', 10), 50));
        $tasks = $query->paginate($perPage);

        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        Gate::authorize('create', Task::class);

        /** @var User $user */
        $user = $request->user();

        // Admin can optionally assign creator; normal users are creator
        $creatorId = ($user->isAdmin() && $request->filled('user_id'))
            ? (int) $request->input('user_id')
            : $user->id;

        $assigneeId = $request->input('assignee_id', $creatorId);
        $projectId = $request->input('project_id');

        // Automatically generate human-readable task_key (e.g., WEB-107)
        $taskKey = null;
        if ($projectId) {
            $project = Project::find($projectId);
            if ($project) {
                $maxTask = Task::where('project_id', $projectId)->max('id') ?? 100;
                $taskKey = $project->key . '-' . ($maxTask + 1);
            }
        }

        $task = Task::create([
            'project_id' => $projectId,
            'task_key' => $taskKey,
            'user_id' => $creatorId,
            'assignee_id' => $assigneeId,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'status' => $request->input('status'),
            'priority' => $request->input('priority'),
            'due_date' => $request->input('due_date'),
            'start_date' => $request->input('start_date'),
            'estimated_minutes' => $request->input('estimated_minutes'),
            'is_blocked' => $request->boolean('is_blocked'),
            'blocker_reason' => $request->input('blocker_reason'),
            'position' => Task::where('project_id', $projectId)->where('status', $request->input('status'))->max('position') + 1,
        ]);

        // Attach labels if provided
        if ($request->has('labels')) {
            $task->labels()->sync($request->input('labels'));
        }

        // Record activity log
        ActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'action' => 'created',
            'new_value' => $task->title,
        ]);

        $this->auditLogger->log(
            userId: $user->id,
            action: 'task.created',
            entityType: 'task',
            entityId: $task->id,
            metadata: [
                'task_key' => $task->task_key,
                'title' => $task->title,
                'status' => $task->status->value,
                'priority' => $task->priority->value,
                'assigned_to' => $assigneeId,
            ],
            request: $request
        );

        return response()->json([
            'message' => 'Task created successfully.',
            'task' => new TaskResource($task->load(['user', 'assignee', 'project', 'labels', 'subtasks'])),
        ], 201);
    }

    /**
     * Display full task detail with subtasks, comments, dependencies, and activity feed.
     */
    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $task->load([
            'user:id,name,email',
            'assignee:id,name,email',
            'project:id,name,key,color,icon',
            'subtasks.assignee:id,name,email',
            'comments.user:id,name,email',
            'labels:id,name,color',
            'activityLogs.user:id,name',
            'blockedBy:id,task_key,title,status',
            'blocks:id,task_key,title,status',
        ]);

        return response()->json([
            'task' => new TaskResource($task),
        ], 200);
    }

    /**
     * Update the specified task.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        /** @var User $user */
        $user = $request->user();
        $oldValues = [
            'title' => $task->title,
            'status' => $task->status->value,
            'priority' => $task->priority->value,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'assignee_id' => $task->assignee_id,
            'is_blocked' => $task->is_blocked,
        ];

        $data = $request->only([
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'start_date',
            'project_id',
            'assignee_id',
            'estimated_minutes',
            'logged_minutes',
            'is_blocked',
            'blocker_reason',
        ]);

        if ($user->isAdmin() && $request->filled('user_id')) {
            $data['user_id'] = (int) $request->input('user_id');
        }

        if (isset($data['status']) && $data['status'] === 'done' && $task->status->value !== 'done') {
            $data['completed_at'] = now();
        }

        $task->update($data);

        // Sync labels if present
        if ($request->has('labels')) {
            $task->labels()->sync($request->input('labels'));
        }

        // Record granular field activity logs
        foreach ($task->getChanges() as $key => $newVal) {
            if (in_array($key, ['created_at', 'updated_at'])) {
                continue;
            }

            ActivityLog::create([
                'task_id' => $task->id,
                'user_id' => $user->id,
                'action' => 'updated',
                'field' => $key,
                'old_value' => isset($oldValues[$key]) ? (string) $oldValues[$key] : null,
                'new_value' => is_object($newVal) && method_exists($newVal, '__toString') ? (string) $newVal : (string) $newVal,
            ]);
        }

        $this->auditLogger->log(
            userId: $user->id,
            action: 'task.updated',
            entityType: 'task',
            entityId: $task->id,
            metadata: ['task_key' => $task->task_key, 'changes' => array_keys($task->getChanges())],
            request: $request
        );

        return response()->json([
            'message' => 'Task updated successfully.',
            'task' => new TaskResource($task->fresh()->load(['user', 'assignee', 'project', 'labels', 'subtasks'])),
        ], 200);
    }

    /**
     * Quick status transition update for Kanban and lists.
     */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $oldStatus = $task->status->value;
        $newStatus = $request->input('status');

        $data = ['status' => $newStatus];
        if ($newStatus === 'done') {
            $data['completed_at'] = now();
        }

        $task->update($data);

        ActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'action' => 'status_changed',
            'field' => 'status',
            'old_value' => $oldStatus,
            'new_value' => $newStatus,
        ]);

        $this->auditLogger->log(
            userId: $request->user()->id,
            action: 'task.status_changed',
            entityType: 'task',
            entityId: $task->id,
            metadata: [
                'task_key' => $task->task_key,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
            request: $request
        );

        return response()->json([
            'message' => 'Task status updated.',
            'task' => new TaskResource($task->fresh()->load(['user', 'assignee', 'project', 'labels'])),
        ], 200);
    }

    /**
     * Reorder position and optional status (Kanban drag and drop).
     */
    public function reorder(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'position' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:todo,in-progress,done'],
        ]);

        $updateData = ['position' => $validated['position']];
        if (!empty($validated['status']) && $validated['status'] !== $task->status->value) {
            $updateData['status'] = $validated['status'];
            if ($validated['status'] === 'done') {
                $updateData['completed_at'] = now();
            }
        }

        $task->update($updateData);

        return response()->json(['message' => 'Task reordered successfully.']);
    }

    /**
     * Add child subtask.
     */
    public function addSubtask(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'title' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $subtask = Task::create([
            'parent_task_id' => $task->id,
            'project_id' => $task->project_id,
            'user_id' => $request->user()->id,
            'assignee_id' => $task->assignee_id,
            'title' => $validated['title'],
            'status' => TaskStatus::Todo,
            'priority' => TaskPriority::Medium,
            'position' => $task->subtasks()->count() + 1,
        ]);

        return response()->json([
            'message' => 'Subtask created.',
            'subtask' => new TaskResource($subtask),
        ], 201);
    }

    /**
     * Add discussion comment.
     */
    public function addComment(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:2000'],
        ]);

        $comment = Comment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        ActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'action' => 'comment_added',
            'new_value' => mb_substr($comment->body, 0, 100),
        ]);

        // Send in-app notification to assignee if different from commenter
        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $task->assignee_id,
                'type' => 'comment_added',
                'title' => "New comment on {$task->task_key}",
                'message' => "{$request->user()->name} commented: " . mb_substr($comment->body, 0, 80),
                'data' => ['task_id' => $task->id, 'task_key' => $task->task_key],
            ]);
        }

        return response()->json([
            'message' => 'Comment posted.',
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
                'created_at' => $comment->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Delete discussion comment.
     */
    public function deleteComment(Request $request, Task $task, Comment $comment): JsonResponse
    {
        Gate::authorize('view', $task);

        if ((int) $comment->task_id !== (int) $task->id) {
            return response()->json(['message' => 'Comment does not belong to the specified task.'], 404);
        }

        if (!$request->user()->isAdmin() && $comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You cannot delete another member’s comment.'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment removed.']);
    }

    /**
     * Toggle blocker status.
     */
    public function toggleBlocker(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'is_blocked' => ['required', 'boolean'],
            'blocker_reason' => ['nullable', 'string', 'max:255'],
        ]);

        $task->update([
            'is_blocked' => $validated['is_blocked'],
            'blocker_reason' => $validated['is_blocked'] ? $validated['blocker_reason'] : null,
        ]);

        ActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'action' => $validated['is_blocked'] ? 'blocked' : 'unblocked',
            'field' => 'is_blocked',
            'new_value' => $validated['is_blocked'] ? $validated['blocker_reason'] : 'Unblocked',
        ]);

        return response()->json(['message' => 'Blocker status updated.']);
    }

    /**
     * Bulk operations: status change, priority change, or deletion.
     */
    public function bulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:status,priority,delete'],
            'task_ids' => ['required', 'array', 'min:1'],
            'task_ids.*' => ['integer', 'exists:tasks,id'],
            'value' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $query = Task::whereIn('id', $validated['task_ids']);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $affected = 0;
        if ($validated['action'] === 'status') {
            $affected = $query->update(['status' => $validated['value']]);
        } elseif ($validated['action'] === 'priority') {
            $affected = $query->update(['priority' => $validated['value']]);
        } elseif ($validated['action'] === 'delete') {
            $affected = $query->delete();
        }

        $this->auditLogger->log(
            userId: $user->id,
            action: 'task.bulk_' . $validated['action'],
            entityType: 'task',
            entityId: 0,
            metadata: ['task_ids' => $validated['task_ids'], 'value' => $validated['value'] ?? null],
            request: $request
        );

        return response()->json([
            'message' => "Bulk operation {$validated['action']} succeeded for {$affected} task(s).",
            'affected' => $affected,
        ]);
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $this->auditLogger->log(
            userId: $request->user()->id,
            action: 'task.deleted',
            entityType: 'task',
            entityId: $task->id,
            metadata: [
                'task_key' => $task->task_key,
                'title' => $task->title,
                'owner_id' => $task->user_id,
            ],
            request: $request
        );

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ], 200);
    }

    /**
     * High-performance single-query dashboard statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $query = DB::table('tasks')->whereNull('parent_task_id');

        if (! $user->isAdmin()) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('assignee_id', $user->id);
            });
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->query('project_id'));
        }

        $stats = $query->selectRaw("
            COUNT(*) as `total`,
            COUNT(CASE WHEN `status` = 'todo' THEN 1 END) as `todo`,
            COUNT(CASE WHEN `status` = 'in-progress' THEN 1 END) as `in_progress`,
            COUNT(CASE WHEN `status` = 'done' THEN 1 END) as `done`,
            COUNT(CASE WHEN `priority` = 'high' THEN 1 END) as `high_priority`,
            COUNT(CASE WHEN `is_blocked` = 1 AND `status` != 'done' THEN 1 END) as `blocked`,
            COUNT(CASE WHEN `due_date` IS NOT NULL AND `due_date` < CURDATE() AND `status` != 'done' THEN 1 END) as `overdue`
        ")->first();

        return response()->json([
            'stats' => [
                'total' => (int) ($stats->total ?? 0),
                'todo' => (int) ($stats->todo ?? 0),
                'in_progress' => (int) ($stats->in_progress ?? 0),
                'done' => (int) ($stats->done ?? 0),
                'high_priority' => (int) ($stats->high_priority ?? 0),
                'blocked' => (int) ($stats->blocked ?? 0),
                'overdue' => (int) ($stats->overdue ?? 0),
            ],
        ], 200);
    }
}
