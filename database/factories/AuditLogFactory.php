<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'action' => fake()->randomElement(['task.created', 'task.updated', 'task.deleted', 'task.status_changed']),
            'entity_type' => 'task',
            'entity_id' => fake()->numberBetween(1, 100),
            'metadata' => [
                'ip' => fake()->ipv4(),
                'details' => fake()->sentence(),
            ],
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }
}
