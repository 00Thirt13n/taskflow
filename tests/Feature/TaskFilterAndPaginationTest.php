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

class TaskFilterAndPaginationTest extends TestCase
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

    public function test_filter_tasks_by_status(): void
    {
        Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => TaskStatus::Todo->value,
            'title' => 'Todo Task',
        ]);
        Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => TaskStatus::Done->value,
            'title' => 'Done Task',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks?status=todo');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'todo');
    }

    public function test_filter_tasks_by_priority(): void
    {
        Task::factory()->create([
            'user_id' => $this->user->id,
            'priority' => TaskPriority::High->value,
        ]);
        Task::factory()->create([
            'user_id' => $this->user->id,
            'priority' => TaskPriority::Low->value,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks?priority=high');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.priority', 'high');
    }

    public function test_search_tasks_by_keyword(): void
    {
        Task::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Implement OAuth Authentication',
            'description' => 'Security token pipeline',
        ]);
        Task::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Update CSS Colors',
            'description' => 'Aesthetic tweaks',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks?search=OAuth');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Implement OAuth Authentication');
    }

    public function test_pagination_defaults_and_metadata(): void
    {
        Task::factory()->count(15)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks?per_page=5');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data',
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'from', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('meta.total', 15)
            ->assertJsonPath('meta.per_page', 5);
    }

    public function test_dashboard_stats_endpoint(): void
    {
        Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => TaskStatus::Todo->value,
            'priority' => TaskPriority::High->value,
        ]);
        Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => TaskStatus::InProgress->value,
            'priority' => TaskPriority::Medium->value,
        ]);
        Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => TaskStatus::Done->value,
            'priority' => TaskPriority::Low->value,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks/stats');

        $response->assertStatus(200)
            ->assertJson([
                'stats' => [
                    'total' => 3,
                    'todo' => 1,
                    'in_progress' => 1,
                    'done' => 1,
                    'high_priority' => 1,
                ],
            ]);
    }
}
