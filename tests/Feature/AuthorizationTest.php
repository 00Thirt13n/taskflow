<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $regularUserA;

    protected User $regularUserB;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => UserRole::Admin->value]);
        Role::firstOrCreate(['name' => UserRole::User->value]);

        $this->regularUserA = User::factory()->create();
        $this->regularUserB = User::factory()->create();
        $this->adminUser = User::factory()->admin()->create();
    }

    public function test_user_cannot_view_another_users_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->regularUserB->id]);

        $response = $this->actingAs($this->regularUserA, 'sanctum')
            ->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
    }

    public function test_user_cannot_update_another_users_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->regularUserB->id]);

        $response = $this->actingAs($this->regularUserA, 'sanctum')
            ->putJson("/api/tasks/{$task->id}", [
                'title' => 'Malicious Modification',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_delete_another_users_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->regularUserB->id]);

        $response = $this->actingAs($this->regularUserA, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_admin_can_view_any_users_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->regularUserB->id]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'task' => ['id' => $task->id],
            ]);
    }

    public function test_admin_can_update_any_users_task_and_creates_audit_log(): void
    {
        $task = Task::factory()->create([
            'user_id' => $this->regularUserB->id,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/tasks/{$task->id}", [
                'title' => 'Admin Updated Title',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Admin Updated Title',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'task.updated',
            'entity_type' => 'task',
            'entity_id' => $task->id,
            'user_id' => $this->adminUser->id,
        ]);
    }

    public function test_admin_can_delete_any_users_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->regularUserB->id]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_regular_user_cannot_access_admin_endpoints(): void
    {
        $response1 = $this->actingAs($this->regularUserA, 'sanctum')
            ->getJson('/api/admin/users');
        $response1->assertStatus(403);

        $response2 = $this->actingAs($this->regularUserA, 'sanctum')
            ->getJson('/api/admin/audit-logs');
        $response2->assertStatus(403);
    }

    public function test_admin_can_access_admin_endpoints(): void
    {
        AuditLog::factory()->count(3)->create();

        $response1 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/users');
        $response1->assertStatus(200);

        $response2 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/audit-logs');
        $response2->assertStatus(200);
    }
}
