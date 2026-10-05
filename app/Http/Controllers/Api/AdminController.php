<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Services\AuditLoggerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AdminController extends Controller
{
    public function __construct(
        protected AuditLoggerService $auditLogger
    ) {}

    /**
     * Display a listing of system users with project and task statistics.
     */
    public function users(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', AuditLog::class);

        $users = User::with('role')
            ->withCount(['tasks', 'assignedTasks', 'projects'])
            ->orderBy('name', 'asc')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * Update user role (admin only).
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        Gate::authorize('viewAny', AuditLog::class);

        $validated = $request->validate([
            'role' => ['required', 'in:admin,user'],
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();
        $oldRole = $user->role?->name;

        $user->update(['role_id' => $role->id]);

        $this->auditLogger->log(
            userId: $request->user()->id,
            action: 'user.role_changed',
            entityType: 'user',
            entityId: $user->id,
            metadata: ['old_role' => $oldRole, 'new_role' => $role->name, 'target_user' => $user->email],
            request: $request
        );

        return response()->json([
            'message' => "User role updated to {$role->name}.",
            'user' => new UserResource($user->fresh()->load('role')),
        ]);
    }

    /**
     * Display filtered, paginated audit logs with search.
     */
    public function auditLogs(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user:id,name,email')
            ->when($request->input('action'), function ($q, $action) {
                $q->where('action', 'like', "%{$action}%");
            })
            ->when($request->input('entity_type'), function ($q, $entity) {
                $q->where('entity_type', $entity);
            })
            ->when($request->input('user_id'), function ($q, $userId) {
                $q->where('user_id', $userId);
            })
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('action', 'like', "%{$search}%")
                        ->orWhere('entity_type', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc');

        $perPage = max(1, min((int) $request->input('per_page', 15), 50));
        $logs = $query->paginate($perPage);

        return AuditLogResource::collection($logs);
    }

    /**
     * Comprehensive system health and metrics dashboard (admin only).
     */
    public function systemHealth(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', AuditLog::class);

        $dbStatus = 'healthy';
        $dbLatency = 0;

        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $dbLatency = round((microtime(true) - $start) * 1000, 2);
        } catch (\Throwable $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        return response()->json([
            'status' => $dbStatus === 'healthy' ? 'operational' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'application' => [
                'name' => config('app.name', 'TaskFlow'),
                'version' => '1.2.0',
                'environment' => config('app.env'),
                'debug_mode' => config('app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ],
            'database' => [
                'driver' => config('database.default'),
                'status' => $dbStatus,
                'latency_ms' => $dbLatency,
                'counts' => [
                    'workspaces' => Workspace::count(),
                    'projects' => Project::count(),
                    'tasks' => Task::count(),
                    'users' => User::count(),
                    'audit_logs' => AuditLog::count(),
                ],
            ],
            'server' => [
                'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                'memory_peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
                'uptime' => 'active',
            ],
        ]);
    }
}
