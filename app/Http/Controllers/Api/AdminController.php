<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AdminController extends Controller
{
    /**
     * Display a listing of system users for admin task assignment and auditing.
     */
    public function users(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', AuditLog::class);

        $users = User::with('role')
            ->withCount('tasks')
            ->orderBy('name', 'asc')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * Display paginated audit logs.
     */
    public function auditLogs(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user:id,name,email')
            ->when($request->input('action'), function ($q, $action) {
                $q->where('action', $action);
            })
            ->when($request->input('user_id'), function ($q, $userId) {
                $q->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc');

        $perPage = max(1, min((int) $request->input('per_page', 15), 50));
        $logs = $query->paginate($perPage);

        return AuditLogResource::collection($logs);
    }
}
