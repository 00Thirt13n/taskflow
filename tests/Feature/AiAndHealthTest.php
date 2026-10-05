<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiAndHealthTest extends TestCase
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

    public function test_health_check_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'service',
                'database' => ['status', 'latency_ms'],
                'memory_usage_mb',
            ])
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('database.status', 'healthy');
    }

    public function test_ai_suggestion_classifies_urgent_deployment_task(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/ai/suggest', [
                'title' => 'Critical production deployment before Friday deadline',
                'description' => 'Fix Docker container Nginx proxy bug immediately.',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'suggestion' => [
                    'priority',
                    'category',
                    'estimated_urgency',
                    'suggested_tags',
                    'summary',
                    'source',
                ],
            ])
            ->assertJsonPath('suggestion.priority', 'high')
            ->assertJsonPath('suggestion.category', 'deployment');
    }
}
