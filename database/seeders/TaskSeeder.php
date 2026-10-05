<?php

namespace Database\Seeders;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\AuditLog;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@taskflow.dev')->first();
        $demoUser = User::where('email', 'demo@taskflow.dev')->first();
        $sarah = User::where('email', 'sarah@taskflow.dev')->first();

        $demoTasks = [
            [
                'title' => 'Implement OAuth2 and CSRF Security Middleware',
                'description' => 'Review Sanctum authentication pipeline, verify CORS origins, and implement CSP headers.',
                'status' => TaskStatus::Done,
                'priority' => TaskPriority::High,
                'due_date' => now()->subDays(2)->format('Y-m-d'),
            ],
            [
                'title' => 'Optimize MySQL Composite Indexes for Task Querying',
                'description' => 'Add (user_id, status, due_date) indexes to avoid filesort on task filter endpoints.',
                'status' => TaskStatus::InProgress,
                'priority' => TaskPriority::High,
                'due_date' => now()->addDays(1)->format('Y-m-d'),
            ],
            [
                'title' => 'Design React Dashboard Statistics & Overdue Cards',
                'description' => 'Create accessible metric cards displaying total tasks, pending items, and overdue flags.',
                'status' => TaskStatus::InProgress,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->addDays(3)->format('Y-m-d'),
            ],
            [
                'title' => 'Integrate Gemini AI Heuristic Fallback Engine',
                'description' => 'Ensure task auto-categorization works reliably even when external API rate limits trigger.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::High,
                'due_date' => now()->addDays(5)->format('Y-m-d'),
            ],
            [
                'title' => 'Write Automated PHPUnit Integration Test Suite',
                'description' => 'Cover 401 unauthenticated, 403 forbidden, and 422 validation error scenarios.',
                'status' => TaskStatus::Done,
                'priority' => TaskPriority::High,
                'due_date' => now()->subDays(5)->format('Y-m-d'),
            ],
            [
                'title' => 'Conduct WCAG 2.1 AA Accessibility Audit',
                'description' => 'Check focus rings, color contrast ratios, aria-labels, and modal keyboard trapping.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->addDays(7)->format('Y-m-d'),
            ],
            [
                'title' => 'Configure Docker Multi-Stage Production Container',
                'description' => 'Build slim PHP 8.3 FPM image with Nginx reverse proxy and health checks.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::Low,
                'due_date' => now()->addDays(10)->format('Y-m-d'),
            ],
            [
                'title' => 'Renew SSL/TLS Certificates on Origin Gateway',
                'description' => 'Automate Let\'s Encrypt certificate renewal and HSTS preload verification.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::Low,
                'due_date' => now()->subDays(1)->format('Y-m-d'), // Overdue intentionally
            ],
        ];

        foreach ($demoTasks as $taskData) {
            $task = $demoUser->tasks()->create($taskData);

            AuditLog::create([
                'user_id' => $demoUser->id,
                'action' => 'task.created',
                'entity_type' => 'task',
                'entity_id' => $task->id,
                'metadata' => [
                    'title' => $task->title,
                    'status' => $task->status->value,
                    'priority' => $task->priority->value,
                ],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'TaskFlow Seeder Script',
            ]);
        }

        // Sarah's tasks (to test that demo user cannot view or mutate them)
        $sarahTasks = [
            [
                'title' => 'Confidential Financial Reconciliation Report',
                'description' => 'Verify Q3 departmental operational expense receipts against ERP ledger.',
                'status' => TaskStatus::InProgress,
                'priority' => TaskPriority::High,
                'due_date' => now()->addDays(2)->format('Y-m-d'),
            ],
            [
                'title' => 'Vendor Contract Renegotiation Preparation',
                'description' => 'Collate service level agreement metrics for upcoming cloud provider contract review.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->addDays(4)->format('Y-m-d'),
            ],
        ];

        foreach ($sarahTasks as $taskData) {
            $task = $sarah->tasks()->create($taskData);

            AuditLog::create([
                'user_id' => $sarah->id,
                'action' => 'task.created',
                'entity_type' => 'task',
                'entity_id' => $task->id,
                'metadata' => [
                    'title' => $task->title,
                    'status' => $task->status->value,
                    'priority' => $task->priority->value,
                ],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'TaskFlow Seeder Script',
            ]);
        }

        // Admin tasks
        $adminTasks = [
            [
                'title' => 'Quarterly Systems Infrastructure Review',
                'description' => 'Analyze database query latency logs, slow queries, and server resource metrics.',
                'status' => TaskStatus::InProgress,
                'priority' => TaskPriority::High,
                'due_date' => now()->addDays(1)->format('Y-m-d'),
            ],
            [
                'title' => 'Audit User Role Permissions and Inactive Accounts',
                'description' => 'Review all assigned admin privileges and purge deprecated test accounts.',
                'status' => TaskStatus::Done,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->subDays(4)->format('Y-m-d'),
            ],
        ];

        foreach ($adminTasks as $taskData) {
            $admin->tasks()->create($taskData);
        }
    }
}
