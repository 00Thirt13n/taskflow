<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
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
     * Display a filtered, paginated list of tasks.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Task::class);

        /** @var User $user */
        $user = $request->user();

        // Project only necessary columns to optimize memory usage
        $query = Task::query()->select([
            'id',
            'user_id',
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'created_at',
            'updated_at',
        ]);

        // Regular users can only access their own tasks
        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Apply filters (status, priority, due_date, search, user_id)
        $query->filter($request->only(['status', 'priority', 'due_date', 'search', 'user_id']));

        // Eager load owner details selectively to prevent N+1 queries
        if ($user->isAdmin()) {
            $query->with('user:id,name,email');
        }

        // Ordering strategy: overdue & upcoming first, followed by newest
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'due_date') {
            $query->orderByRaw('due_date IS NULL, due_date '.$sortOrder);
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

        // Admin can optionally assign task to another user; standard user always owns their task
        $assignedUserId = ($user->isAdmin() && $request->filled('user_id'))
            ? (int) $request->input('user_id')
            : $user->id;

        $task = Task::create([
            'user_id' => $assignedUserId,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'status' => $request->input('status'),
            'priority' => $request->input('priority'),
            'due_date' => $request->input('due_date'),
        ]);

        $this->auditLogger->log(
            action: 'task.created',
            entityType: 'task',
            entityId: $task->id,
            metadata: [
                'title' => $task->title,
                'status' => $task->status->value,
                'priority' => $task->priority->value,
                'assigned_to' => $assignedUserId,
            ],
            actor: $user
        );

        return response()->json([
            'message' => 'Task created successfully.',
            'task' => new TaskResource($task->load('user:id,name,email')),
        ], 201);
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        return response()->json([
            'task' => new TaskResource($task->load('user:id,name,email')),
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
            'user_id' => $task->user_id,
        ];

        $data = $request->only(['title', 'description', 'status', 'priority', 'due_date']);

        if ($user->isAdmin() && $request->filled('user_id')) {
            $data['user_id'] = (int) $request->input('user_id');
        }

        $task->update($data);

        $changes = [];
        foreach ($task->getChanges() as $key => $newVal) {
            if (in_array($key, ['created_at', 'updated_at'])) {
                continue;
            }
            $changes[$key] = [
                'old' => $oldValues[$key] ?? null,
                'new' => is_object($newVal) && method_exists($newVal, '__toString') ? (string) $newVal : $newVal,
            ];
        }

        $this->auditLogger->log(
            action: 'task.updated',
            entityType: 'task',
            entityId: $task->id,
            metadata: ['changes' => $changes],
            actor: $user
        );

        return response()->json([
            'message' => 'Task updated successfully.',
            'task' => new TaskResource($task->fresh()->load('user:id,name,email')),
        ], 200);
    }

    /**
     * Quick status transition update.
     */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $oldStatus = $task->status->value;
        $newStatus = $request->input('status');

        $task->update(['status' => $newStatus]);

        $this->auditLogger->log(
            action: 'task.status_changed',
            entityType: 'task',
            entityId: $task->id,
            metadata: [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
            actor: $request->user()
        );

        return response()->json([
            'message' => 'Task status updated.',
            'task' => new TaskResource($task->fresh()->load('user:id,name,email')),
        ], 200);
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $this->auditLogger->log(
            action: 'task.deleted',
            entityType: 'task',
            entityId: $task->id,
            metadata: [
                'title' => $task->title,
                'owner_id' => $task->user_id,
            ],
            actor: $request->user()
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

        $query = DB::table('tasks');

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $stats = $query->selectRaw("
            COUNT(*) as `total`,
            COUNT(CASE WHEN `status` = 'todo' THEN 1 END) as `todo`,
            COUNT(CASE WHEN `status` = 'in-progress' THEN 1 END) as `in_progress`,
            COUNT(CASE WHEN `status` = 'done' THEN 1 END) as `done`,
            COUNT(CASE WHEN `priority` = 'high' THEN 1 END) as `high_priority`,
            COUNT(CASE WHEN `due_date` IS NOT NULL AND `due_date` < CURDATE() AND `status` != 'done' THEN 1 END) as `overdue`
        ")->first();

        return response()->json([
            'stats' => [
                'total' => (int) ($stats->total ?? 0),
                'todo' => (int) ($stats->todo ?? 0),
                'in_progress' => (int) ($stats->in_progress ?? 0),
                'done' => (int) ($stats->done ?? 0),
                'high_priority' => (int) ($stats->high_priority ?? 0),
                'overdue' => (int) ($stats->overdue ?? 0),
            ],
        ], 200);
    }
}
