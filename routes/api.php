<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AiTaskController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| TaskFlow REST API routes. All endpoints return standardized JSON envelopes.
|
*/

// Health Check Endpoint
Route::get('/health', [HealthController::class, 'check'])->name('api.health');

// Public Authentication (Rate limited against brute force: 10 attempts per minute)
Route::middleware(['throttle:10,1'])->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('api.register');
    Route::post('/login', [AuthController::class, 'login'])->name('api.login');
});

// Authenticated Routes (Requires Bearer token via Laravel Sanctum)
Route::middleware(['auth:sanctum'])->group(function () {
    // Current User Profile & Session
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Dashboard Statistics
    Route::get('/tasks/stats', [TaskController::class, 'stats'])->name('api.tasks.stats');

    // Task CRUD Operations
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('api.tasks.status');

    // AI-Powered Assistant (Classify and prioritize task content)
    Route::post('/ai/suggest', [AiTaskController::class, 'suggest'])->name('api.ai.suggest');

    // Administrative Endpoints (RBAC Enforced via Policies)
    Route::prefix('admin')->name('api.admin.')->group(function () {
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->name('audit-logs');
    });
});
