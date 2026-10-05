<?php

namespace Tests\Feature;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnterpriseFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user;
    protected Workspace $workspace;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => UserRole::Admin->value]);
        $userRole = Role::create(['name' => UserRole::User->value]);

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->user = User::factory()->create(['role_id' => $userRole->id]);

        $this->workspace = Workspace::create([
            'name' => 'Engineering Workspace',
            'slug' => 'engineering-workspace',
            'owner_id' => $this->admin->id,
        ]);

        $this->project = Project::create([
            'workspace_id' => $this->workspace->id,
            'name' => 'Core Architecture',
            'key' => 'CORE',
            'status' => 'active',
            'owner_id' => $this->admin->id,
        ]);

        $this->project->members()->attach($this->user->id, ['role' => 'member']);
    }

    public function test_authenticated_user_can_list_workspaces(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/workspaces');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'projects']]]);
    }

    public function test_user_can_create_project_and_receives_key(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/projects', [
                'name' => 'Mobile Client',
                'key' => 'MOB',
                'description' => 'Cross-platform app',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Mobile Client')
            ->assertJsonPath('data.key', 'MOB');

        $this->assertDatabaseHas('projects', ['key' => 'MOB']);
    }

    public function test_user_can_create_subtask_for_parent_task(): void
    {
        $parent = Task::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'assignee_id' => $this->user->id,
            'title' => 'Parent Deliverable',
            'status' => TaskStatus::InProgress,
            'priority' => TaskPriority::High,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/tasks/{$parent->id}/subtasks", [
                'title' => 'First Actionable Item',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('subtask.title', 'First Actionable Item');

        $this->assertDatabaseHas('tasks', [
            'parent_task_id' => $parent->id,
            'title' => 'First Actionable Item',
        ]);
    }

    public function test_user_can_post_discussion_comment(): void
    {
        $task = Task::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'title' => 'Feature Implementation',
            'status' => TaskStatus::Todo,
            'priority' => TaskPriority::Medium,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/tasks/{$task->id}/comments", [
                'body' => 'PR ready for architectural review.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('comment.body', 'PR ready for architectural review.');

        $this->assertDatabaseHas('comments', [
            'task_id' => $task->id,
            'body' => 'PR ready for architectural review.',
        ]);
    }

    public function test_global_search_returns_tasks_and_projects(): void
    {
        Task::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'task_key' => 'CORE-101',
            'title' => 'Query Optimization Matrix',
            'status' => TaskStatus::Done,
            'priority' => TaskPriority::High,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/search?q=Query');

        $response->assertStatus(200)
            ->assertJsonStructure(['tasks', 'projects', 'users']);

        $this->assertNotEmpty($response->json('tasks'));
    }

    public function test_user_can_view_and_mark_notifications_read(): void
    {
        $notif = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'task_assigned',
            'title' => 'New assignment',
            'message' => 'You were assigned to CORE-101',
        ]);

        $listRes = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/notifications');

        $listRes->assertStatus(200)
            ->assertJsonPath('unread_count', 1);

        $readRes = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/notifications/{$notif->id}/read");

        $readRes->assertStatus(200);

        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_admin_can_access_system_health_diagnostics(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/system-health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'application' => ['version', 'environment', 'php_version', 'laravel_version'],
                'database' => ['status', 'latency_ms', 'counts'],
            ]);
    }

    public function test_normal_user_cannot_access_system_health(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/admin/system-health');

        $response->assertStatus(403);
    }

    public function test_user_can_toggle_blocker_status_with_reason(): void
    {
        $task = Task::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'title' => 'Production Deployment',
            'status' => TaskStatus::Todo,
            'priority' => TaskPriority::High,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/tasks/{$task->id}/block", [
                'is_blocked' => true,
                'blocker_reason' => 'Waiting for SSL certificate',
            ]);

        $response->assertStatus(200);
        $this->assertTrue($task->fresh()->is_blocked);
        $this->assertEquals('Waiting for SSL certificate', $task->fresh()->blocker_reason);
    }

    public function test_bulk_operations_update_multiple_tasks(): void
    {
        $task1 = Task::create([
            'user_id' => $this->user->id,
            'title' => 'Bulk 1',
            'status' => TaskStatus::Todo,
            'priority' => TaskPriority::Low,
        ]);

        $task2 = Task::create([
            'user_id' => $this->user->id,
            'title' => 'Bulk 2',
            'status' => TaskStatus::Todo,
            'priority' => TaskPriority::Low,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/tasks/bulk', [
                'action' => 'status',
                'task_ids' => [$task1->id, $task2->id],
                'value' => 'done',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('done', $task1->fresh()->status->value);
        $this->assertEquals('done', $task2->fresh()->status->value);
    }
}
