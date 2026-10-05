<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AiTaskController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SavedViewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| TaskFlow Enterprise REST API routes. All endpoints return standardized JSON.
|
*/

// Public Health Check Endpoint
Route::get('/health', [HealthController::class, 'check'])->name('api.health');

// Public Authentication (Rate limited: 10 attempts per minute)
Route::middleware(['throttle:10,1'])->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('api.register');
    Route::post('/login', [AuthController::class, 'login'])->name('api.login');
});

// Authenticated Routes (Requires Bearer token via Laravel Sanctum)
Route::middleware(['auth:sanctum'])->group(function () {
    // Current User Profile & Session
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Workspaces
    Route::get('/workspaces', [WorkspaceController::class, 'index'])->name('api.workspaces.index');

    // Projects CRUD & Membership
    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects/{project}/members', [ProjectController::class, 'members'])->name('api.projects.members');
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember'])->name('api.projects.members.add');
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember'])->name('api.projects.members.remove');

    // Dashboard Statistics & Reports
    Route::get('/tasks/stats', [TaskController::class, 'stats'])->name('api.tasks.stats');
    Route::get('/reports/overview', [ReportController::class, 'overview'])->name('api.reports.overview');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('api.reports.export');

    // Task Bulk Operations
    Route::post('/tasks/bulk', [TaskController::class, 'bulk'])->name('api.tasks.bulk');

    // Task CRUD Operations
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('api.tasks.status');
    Route::patch('/tasks/{task}/reorder', [TaskController::class, 'reorder'])->name('api.tasks.reorder');
    Route::post('/tasks/{task}/block', [TaskController::class, 'toggleBlocker'])->name('api.tasks.block');

    // Task Subtasks & Discussions
    Route::post('/tasks/{task}/subtasks', [TaskController::class, 'addSubtask'])->name('api.tasks.subtasks.store');
    Route::post('/tasks/{task}/comments', [TaskController::class, 'addComment'])->name('api.tasks.comments.store');
    Route::delete('/tasks/{task}/comments/{comment}', [TaskController::class, 'deleteComment'])->name('api.tasks.comments.destroy');

    // Global Command Palette & Search
    Route::get('/search', [SearchController::class, 'search'])->name('api.search');

    // Notification Center
    Route::get('/notifications', [NotificationController::class, 'index'])->name('api.notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.read-all');

    // Saved Views
    Route::get('/saved-views', [SavedViewController::class, 'index'])->name('api.saved-views.index');
    Route::post('/saved-views', [SavedViewController::class, 'store'])->name('api.saved-views.store');
    Route::delete('/saved-views/{savedView}', [SavedViewController::class, 'destroy'])->name('api.saved-views.destroy');

    // AI-Powered Assistant Actions
    Route::prefix('ai')->name('api.ai.')->group(function () {
        Route::post('/suggest', [AiTaskController::class, 'suggest'])->name('suggest');
        Route::post('/subtasks', [AiTaskController::class, 'subtasks'])->name('subtasks');
        Route::post('/improve-description', [AiTaskController::class, 'improveDescription'])->name('improve-description');
        Route::post('/natural-task', [AiTaskController::class, 'parseNaturalLanguage'])->name('natural-task');
    });

    // Administrative Endpoints (RBAC Enforced via Policies)
    Route::prefix('admin')->name('api.admin.')->group(function () {
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole'])->name('users.role');
        Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->name('audit-logs');
        Route::get('/system-health', [AdminController::class, 'systemHealth'])->name('system-health');
    });
});
