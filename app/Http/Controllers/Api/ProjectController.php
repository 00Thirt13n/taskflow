<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\AuditLoggerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function __construct(
        protected AuditLoggerService $auditLogger
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $workspaceId = $request->input('workspace_id', 1);

        $query = Project::with(['owner', 'members'])
            ->where('workspace_id', $workspaceId)
            ->orderBy('created_at', 'desc');

        if (!$user->isAdmin()) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhereHas('members', function ($m) use ($user) {
                      $m->where('users.id', $user->id);
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $projects = $query->get();

        return response()->json([
            'data' => ProjectResource::collection($projects),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'key' => ['required', 'string', 'max:10', 'alpha_num'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon' => ['nullable', 'string', 'max:50'],
            'start_date' => ['nullable', 'date'],
            'target_date' => ['nullable', 'date'],
        ]);

        $workspace = Workspace::firstOrCreate(
            ['slug' => 'taskflow-engineering'],
            ['name' => 'TaskFlow Engineering', 'owner_id' => $request->user()->id]
        );

        $key = strtoupper($validated['key']);

        if (Project::where('workspace_id', $workspace->id)->where('key', $key)->exists()) {
            return response()->json([
                'message' => "Project key [{$key}] is already taken in this workspace.",
                'errors' => ['key' => ["The project key {$key} is already in use."]],
            ], 422);
        }

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => $validated['name'],
            'key' => $key,
            'description' => $validated['description'] ?? null,
            'status' => 'active',
            'color' => $validated['color'] ?? '#6366f1',
            'icon' => $validated['icon'] ?? 'folder',
            'start_date' => $validated['start_date'] ?? now()->toDateString(),
            'target_date' => $validated['target_date'] ?? now()->addMonth()->toDateString(),
            'owner_id' => $request->user()->id,
        ]);

        // Automatically assign creator as owner member
        $project->members()->attach($request->user()->id, ['role' => 'owner']);

        $this->auditLogger->log(
            userId: $request->user()->id,
            action: 'project_created',
            entityType: 'project',
            entityId: $project->id,
            metadata: ['name' => $project->name, 'key' => $project->key],
            request: $request
        );

        return response()->json([
            'message' => 'Project created successfully.',
            'data' => new ProjectResource($project->load(['owner', 'members'])),
        ], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $project->owner_id !== $user->id && !$project->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'You do not have access to this project.'], 403);
        }

        return response()->json([
            'data' => new ProjectResource($project->load(['owner', 'members'])),
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $project->owner_id !== $user->id) {
            return response()->json(['message' => 'Only the project owner or an administrator can update this project.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', 'in:planning,active,on-hold,completed,archived'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon' => ['nullable', 'string', 'max:50'],
            'start_date' => ['nullable', 'date'],
            'target_date' => ['nullable', 'date'],
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => new ProjectResource($project->load(['owner', 'members'])),
        ]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $project->owner_id !== $user->id) {
            return response()->json(['message' => 'Only the project owner or an administrator can delete this project.'], 403);
        }

        $this->auditLogger->log(
            userId: $user->id,
            action: 'project_deleted',
            entityType: 'project',
            entityId: $project->id,
            metadata: ['name' => $project->name, 'key' => $project->key],
            request: $request
        );

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully.']);
    }

    public function members(Request $request, Project $project): JsonResponse
    {
        return response()->json([
            'data' => $project->members()->get()->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'role' => $m->pivot->role,
            ]),
        ]);
    }

    public function addMember(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $project->owner_id !== $user->id) {
            return response()->json(['message' => 'Only the project owner or an administrator can manage project members.'], 403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'in:owner,manager,member,viewer'],
        ]);

        $project->members()->syncWithoutDetaching([
            $validated['user_id'] => ['role' => $validated['role']],
        ]);

        return response()->json(['message' => 'Member added successfully.']);
    }

    public function removeMember(Request $request, Project $project, User $user): JsonResponse
    {
        $authUser = $request->user();

        if (!$authUser->isAdmin() && $project->owner_id !== $authUser->id) {
            return response()->json(['message' => 'Only the project owner or an administrator can manage project members.'], 403);
        }

        $project->members()->detach($user->id);
        return response()->json(['message' => 'Member removed successfully.']);
    }
}
