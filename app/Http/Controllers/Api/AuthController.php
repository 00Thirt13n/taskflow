<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLoggerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        protected AuditLoggerService $auditLogger
    ) {}

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $defaultRole = Role::firstOrCreate(['name' => UserRole::User->value]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role_id' => $defaultRole->id,
        ]);

        $token = $user->createToken('taskflow-auth-token')->plainTextToken;

        $this->auditLogger->log(
            action: 'auth.registered',
            entityType: 'user',
            entityId: $user->id,
            metadata: ['email' => $user->email, 'role' => $defaultRole->name],
            actor: $user
        );

        return response()->json([
            'message' => 'Registration successful.',
            'user' => new UserResource($user->load('role')),
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate user and issue personal access token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'These credentials do not match our records.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('taskflow-auth-token')->plainTextToken;

        $this->auditLogger->log(
            action: 'auth.login',
            entityType: 'user',
            entityId: $user->id,
            metadata: ['email' => $user->email],
            actor: $user
        );

        return response()->json([
            'message' => 'Authentication successful.',
            'user' => new UserResource($user->load('role')),
            'token' => $token,
        ], 200);
    }

    /**
     * Revoke authenticated user token.
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()?->delete();

            $this->auditLogger->log(
                action: 'auth.logout',
                entityType: 'user',
                entityId: $user->id,
                actor: $user
            );
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ], 200);
    }

    /**
     * Retrieve authenticated user profile with role permissions.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('role');

        return response()->json([
            'user' => new UserResource($user),
        ], 200);
    }
}
