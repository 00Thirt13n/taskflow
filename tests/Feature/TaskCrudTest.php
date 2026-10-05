<?php

namespace Tests\Feature;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => UserRole::Admin->value]);
        Role::firstOrCreate(['name' => UserRole::User->value]);

        $this->user = User::factory()->create();
    }

    public function test_user_can_create_task(): void
    {
        $payload = [
            'title' => 'Write Architecture Document',
            'description' => 'Draft the complete system flow with Mermaid diagrams.',
            'status' => TaskStatus::InProgress->value,
            'priority' => TaskPriority::High->value,
            'due_date' => now()->addDays(3)->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/tasks', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Task created successfully.',
                'task' => [
                    'title' => 'Write Architecture Document',
                    'status' => 'in-progress',
                    'priority' => 'high',
                    'user_id' => $this->user->id,
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Write Architecture Document',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_task_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/tasks', [
                'title' => '',
                'status' => 'invalid-status',
                'priority' => 'unknown-priority',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'status', 'priority']);
    }

    public function test_user_can_list_only_their_own_tasks(): void
    {
        Task::factory()->count(3)->create(['user_id' => $this->user->id]);

        $otherUser = User::factory()->create();
        Task::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_view_own_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'task' => [
                    'id' => $task->id,
                    'title' => $task->title,
                ],
            ]);
    }

    public function test_user_can_update_own_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/tasks/{$task->id}", [
                'title' => 'Updated Task Title',
                'status' => TaskStatus::Done->value,
                'priority' => TaskPriority::Low->value,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Task updated successfully.',
                'task' => [
                    'title' => 'Updated Task Title',
                    'status' => 'done',
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Task Title',
            'status' => 'done',
        ]);
    }

    public function test_user_can_update_task_status_via_patch(): void
    {
        $task = Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => TaskStatus::Todo->value,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/tasks/{$task->id}/status", [
                'status' => TaskStatus::Done->value,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'task' => [
                    'status' => 'done',
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'done',
        ]);
    }

    public function test_user_can_delete_own_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Task deleted successfully.']);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
