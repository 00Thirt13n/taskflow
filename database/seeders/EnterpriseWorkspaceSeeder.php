<?php

namespace Database\Seeders;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Label;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Role;
use App\Models\SavedView;
use App\Models\Task;
use App\Models\TaskDependency;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EnterpriseWorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', UserRole::Admin->value)->first();
        $userRole = Role::where('name', UserRole::User->value)->first();

        // 1. Ensure team users exist (Northstar Engineering Team)
        $alex = User::updateOrCreate(
            ['email' => 'admin@taskflow.dev'],
            [
                'name' => 'Maya Lin',
                'password' => Hash::make('Password123!'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]
        );

        $elena = User::updateOrCreate(
            ['email' => 'demo@taskflow.dev'],
            [
                'name' => 'Arjun Patel',
                'password' => Hash::make('Password123!'),
                'role_id' => $userRole->id,
                'email_verified_at' => now(),
            ]
        );

        $sarah = User::updateOrCreate(
            ['email' => 'sarah@taskflow.dev'],
            [
                'name' => 'Sofia Rossi',
                'password' => Hash::make('Password123!'),
                'role_id' => $userRole->id,
                'email_verified_at' => now(),
            ]
        );

        $michael = User::updateOrCreate(
            ['email' => 'michael@taskflow.dev'],
            [
                'name' => 'Daniel Kim',
                'password' => Hash::make('Password123!'),
                'role_id' => $userRole->id,
                'email_verified_at' => now(),
            ]
        );

        // 2. Primary Workspace: Northstar Engineering
        $workspace = Workspace::updateOrCreate(
            ['slug' => 'northstar-engineering'],
            [
                'name' => 'Northstar Engineering',
                'description' => 'Core engineering platform, cloud infrastructure, and product design.',
                'owner_id' => $alex->id,
            ]
        );

        // 3. Projects
        $webProject = Project::firstOrCreate(
            ['workspace_id' => $workspace->id, 'key' => 'WEB'],
            [
                'name' => 'Website Redesign',
                'description' => 'Next-generation work management frontend redesign with multi-view capabilities and dark mode.',
                'status' => 'active',
                'color' => '#6366f1',
                'icon' => 'globe',
                'start_date' => now()->subDays(14)->toDateString(),
                'target_date' => now()->addDays(21)->toDateString(),
                'owner_id' => $alex->id,
            ]
        );

        $mobProject = Project::firstOrCreate(
            ['workspace_id' => $workspace->id, 'key' => 'MOB'],
            [
                'name' => 'Mobile Application v2',
                'description' => 'Native iOS & Android mobile companion client for offline field task tracking.',
                'status' => 'active',
                'color' => '#10b981',
                'icon' => 'phone',
                'start_date' => now()->subDays(7)->toDateString(),
                'target_date' => now()->addDays(45)->toDateString(),
                'owner_id' => $elena->id,
            ]
        );

        $infProject = Project::firstOrCreate(
            ['workspace_id' => $workspace->id, 'key' => 'INF'],
            [
                'name' => 'Infrastructure & Scaling',
                'description' => 'Multi-stage Docker, Nginx caching, MySQL indexing, and zero-downtime deployment pipelines.',
                'status' => 'active',
                'color' => '#f59e0b',
                'icon' => 'server',
                'start_date' => now()->subDays(20)->toDateString(),
                'target_date' => now()->addDays(10)->toDateString(),
                'owner_id' => $michael->id,
            ]
        );

        $secProject = Project::firstOrCreate(
            ['workspace_id' => $workspace->id, 'key' => 'SEC'],
            [
                'name' => 'Security & Compliance',
                'description' => 'RBAC access controls, IDOR mitigation, OWASP Top 10 security audit, and rate limiting.',
                'status' => 'planning',
                'color' => '#ef4444',
                'icon' => 'shield-lock',
                'start_date' => now()->toDateString(),
                'target_date' => now()->addDays(60)->toDateString(),
                'owner_id' => $alex->id,
            ]
        );

        // 4. Project Memberships
        $webProject->members()->syncWithoutDetaching([
            $alex->id => ['role' => 'owner'],
            $elena->id => ['role' => 'manager'],
            $sarah->id => ['role' => 'member'],
            $michael->id => ['role' => 'member'],
        ]);

        $mobProject->members()->syncWithoutDetaching([
            $elena->id => ['role' => 'owner'],
            $alex->id => ['role' => 'manager'],
            $sarah->id => ['role' => 'member'],
        ]);

        $infProject->members()->syncWithoutDetaching([
            $michael->id => ['role' => 'owner'],
            $alex->id => ['role' => 'manager'],
            $elena->id => ['role' => 'member'],
        ]);

        $secProject->members()->syncWithoutDetaching([
            $alex->id => ['role' => 'owner'],
            $elena->id => ['role' => 'member'],
            $michael->id => ['role' => 'member'],
        ]);

        // 5. Labels
        $labels = [
            'Bug' => '#ef4444',
            'Feature' => '#3b82f6',
            'Security' => '#f97316',
            'Frontend' => '#8b5cf6',
            'Backend' => '#06b6d4',
            'DevOps' => '#10b981',
            'Design' => '#ec4899',
        ];

        $createdLabels = [];
        foreach ($labels as $name => $color) {
            $createdLabels[$name] = Label::firstOrCreate(
                ['project_id' => $webProject->id, 'name' => $name],
                ['color' => $color]
            );
        }

        // 6. Enterprise Tasks for Website Redesign (Narrative Story)
        $tasksData = [
            [
                'key' => 'WEB-101',
                'title' => 'Design high-fidelity design system & dark mode tokens',
                'description' => 'Establish typography scale, border-radius tokens, semantic status palettes, and dark mode contrast ratios adhering to WCAG 2.1 AA.',
                'status' => TaskStatus::Done,
                'priority' => TaskPriority::High,
                'assignee_id' => $sarah->id,
                'user_id' => $alex->id,
                'position' => 1,
                'estimated_minutes' => 480,
                'logged_minutes' => 420,
                'start_date' => now()->subDays(12)->toDateString(),
                'due_date' => now()->subDays(2)->toDateString(),
                'completed_at' => now()->subDays(2),
                'labels' => ['Design', 'Frontend'],
                'subtasks' => [
                    ['title' => 'Define typography scale and font weights', 'status' => TaskStatus::Done],
                    ['title' => 'Design dark theme semantic surface colors', 'status' => TaskStatus::Done],
                    ['title' => 'Generate high-density button and badge variants', 'status' => TaskStatus::Done],
                ],
                'comments' => [
                    ['user_id' => $sarah->id, 'body' => 'Tokens exported to CSS variables in index.css. Contrast meets 4.5:1 ratio.'],
                    ['user_id' => $alex->id, 'body' => 'Looks exceptionally clean and dense. Approved.'],
                ],
            ],
            [
                'key' => 'WEB-102',
                'title' => 'Implement OAuth 2.0 & Laravel Sanctum authentication',
                'description' => 'Deploy token-based SPA authentication with SHA-256 token hashing, Argon2id passwords, and auth middleware security boundaries.',
                'status' => TaskStatus::Done,
                'priority' => TaskPriority::High,
                'assignee_id' => $elena->id,
                'user_id' => $alex->id,
                'position' => 2,
                'estimated_minutes' => 360,
                'logged_minutes' => 340,
                'start_date' => now()->subDays(10)->toDateString(),
                'due_date' => now()->subDays(4)->toDateString(),
                'completed_at' => now()->subDays(4),
                'labels' => ['Backend', 'Security'],
                'subtasks' => [
                    ['title' => 'Configure Sanctum personal_access_tokens migration', 'status' => TaskStatus::Done],
                    ['title' => 'Implement AuthController with 5 req/min rate limit', 'status' => TaskStatus::Done],
                    ['title' => 'Write 100% passing PHPUnit feature tests', 'status' => TaskStatus::Done],
                ],
                'comments' => [
                    ['user_id' => $elena->id, 'body' => 'Auth test suite passing with 31 assertions and 0 failures.'],
                ],
            ],
            [
                'key' => 'WEB-103',
                'title' => 'Build interactive multi-view task manager (Kanban & Calendar)',
                'description' => 'Implement responsive views: interactive Table, drag-and-drop Kanban board, monthly/weekly Calendar, and timeline view.',
                'status' => TaskStatus::InProgress,
                'priority' => TaskPriority::High,
                'assignee_id' => $elena->id,
                'user_id' => $alex->id,
                'position' => 1,
                'estimated_minutes' => 600,
                'logged_minutes' => 310,
                'start_date' => now()->subDays(3)->toDateString(),
                'due_date' => now()->addDays(2)->toDateString(),
                'labels' => ['Frontend', 'Feature'],
                'subtasks' => [
                    ['title' => 'HTML5 drag-and-drop column status listener', 'status' => TaskStatus::Done],
                    ['title' => 'Interactive monthly calendar grid generator', 'status' => TaskStatus::InProgress],
                    ['title' => 'Timeline / Gantt milestone visualization', 'status' => TaskStatus::Todo],
                ],
                'comments' => [
                    ['user_id' => $elena->id, 'body' => 'Kanban drag-and-drop persists position and status via PATCH endpoint.'],
                    ['user_id' => $sarah->id, 'body' => 'Tested the drag feedback on tablet viewport. Smooth animations.'],
                ],
            ],
            [
                'key' => 'WEB-104',
                'title' => 'Setup CloudWatch observability & Nginx rate limiting',
                'description' => 'Configure Nginx reverse proxy with gzip compression, security headers (CSP, HSTS), and structured JSON logging.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::Medium,
                'assignee_id' => $michael->id,
                'user_id' => $alex->id,
                'position' => 1,
                'estimated_minutes' => 240,
                'logged_minutes' => 60,
                'start_date' => now()->toDateString(),
                'due_date' => now()->addDays(5)->toDateString(),
                'labels' => ['DevOps', 'Security'],
                'subtasks' => [
                    ['title' => 'Configure X-Frame-Options and Content-Security-Policy', 'status' => TaskStatus::Done],
                    ['title' => 'Set up request correlation ID header', 'status' => TaskStatus::Todo],
                ],
                'comments' => [],
            ],
            [
                'key' => 'WEB-105',
                'title' => 'Production SSL and zero-downtime deployment pipeline',
                'description' => 'Automated GitHub Actions CI/CD pipeline deploying multi-stage Docker container to VPS behind Nginx.',
                'status' => TaskStatus::Todo,
                'priority' => TaskPriority::High,
                'assignee_id' => $alex->id,
                'user_id' => $alex->id,
                'position' => 2,
                'estimated_minutes' => 300,
                'logged_minutes' => 30,
                'start_date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
                'is_blocked' => true,
                'blocker_reason' => 'Waiting for DNS delegation approval and Let’s Encrypt wildcard issuance.',
                'labels' => ['DevOps'],
                'subtasks' => [
                    ['title' => 'Validate GitHub Actions workflow YAML', 'status' => TaskStatus::Done],
                    ['title' => 'DNS A record propagation check', 'status' => TaskStatus::Todo],
                ],
                'comments' => [
                    ['user_id' => $alex->id, 'body' => 'Ticket filed with network operations for DNS routing.'],
                ],
            ],
            [
                'key' => 'WEB-106',
                'title' => 'Comprehensive WCAG 2.1 AA accessibility audit',
                'description' => 'Verify keyboard tab trapping in modals, screen reader aria-labels on action buttons, and color contrast compliance.',
                'status' => TaskStatus::InProgress,
                'priority' => TaskPriority::Medium,
                'assignee_id' => $sarah->id,
                'user_id' => $alex->id,
                'position' => 2,
                'estimated_minutes' => 180,
                'logged_minutes' => 120,
                'start_date' => now()->subDays(6)->toDateString(),
                'due_date' => now()->subDays(2)->toDateString(), // Overdue by 2 days!
                'labels' => ['Design', 'Frontend'],
                'subtasks' => [
                    ['title' => 'Audit form labels and aria-describedby for errors', 'status' => TaskStatus::Done],
                    ['title' => 'Verify keyboard navigation across Kanban columns', 'status' => TaskStatus::InProgress],
                ],
                'comments' => [
                    ['user_id' => $sarah->id, 'body' => 'Minor focus outline adjustments in progress.'],
                ],
            ],
        ];

        foreach ($tasksData as $tData) {
            $task = Task::updateOrCreate(
                ['task_key' => $tData['key']],
                [
                    'project_id' => $webProject->id,
                    'user_id' => $tData['user_id'],
                    'assignee_id' => $tData['assignee_id'],
                    'title' => $tData['title'],
                    'description' => $tData['description'],
                    'status' => $tData['status'],
                    'priority' => $tData['priority'],
                    'position' => $tData['position'],
                    'estimated_minutes' => $tData['estimated_minutes'],
                    'logged_minutes' => $tData['logged_minutes'],
                    'start_date' => $tData['start_date'],
                    'due_date' => $tData['due_date'],
                    'completed_at' => $tData['completed_at'] ?? null,
                    'is_blocked' => $tData['is_blocked'] ?? false,
                    'blocker_reason' => $tData['blocker_reason'] ?? null,
                ]
            );

            // Attach labels
            if (!empty($tData['labels'])) {
                $labelIds = [];
                foreach ($tData['labels'] as $lName) {
                    if (isset($createdLabels[$lName])) {
                        $labelIds[] = $createdLabels[$lName]->id;
                    }
                }
                $task->labels()->sync($labelIds);
            }

            // Create subtasks
            if (!empty($tData['subtasks'])) {
                foreach ($tData['subtasks'] as $idx => $st) {
                    Task::firstOrCreate(
                        ['parent_task_id' => $task->id, 'title' => $st['title']],
                        [
                            'project_id' => $webProject->id,
                            'user_id' => $tData['user_id'],
                            'assignee_id' => $tData['assignee_id'],
                            'status' => $st['status'],
                            'priority' => TaskPriority::Medium,
                            'position' => $idx + 1,
                        ]
                    );
                }
            }

            // Create comments
            if (!empty($tData['comments'])) {
                foreach ($tData['comments'] as $c) {
                    Comment::firstOrCreate(
                        ['task_id' => $task->id, 'user_id' => $c['user_id'], 'body' => $c['body']]
                    );
                }
            }

            // Create activity logs
            ActivityLog::firstOrCreate(
                ['task_id' => $task->id, 'action' => 'created'],
                [
                    'user_id' => $tData['user_id'],
                    'field' => null,
                    'old_value' => null,
                    'new_value' => $tData['title'],
                    'created_at' => now()->subDays(5),
                ]
            );
        }

        // 7. Dependencies: WEB-105 is blocked by WEB-104
        $web104 = Task::where('task_key', 'WEB-104')->first();
        $web105 = Task::where('task_key', 'WEB-105')->first();
        if ($web104 && $web105) {
            TaskDependency::firstOrCreate([
                'task_id' => $web105->id,
                'depends_on_task_id' => $web104->id,
                'type' => 'blocked_by',
            ]);
        }

        // 8. Notifications
        Notification::firstOrCreate(
            ['user_id' => $elena->id, 'title' => 'Assigned to WEB-103'],
            [
                'type' => 'task_assigned',
                'message' => 'Alexander Vance assigned you to: Build interactive multi-view task manager (Kanban & Calendar)',
                'data' => ['task_key' => 'WEB-103', 'project_key' => 'WEB'],
                'read_at' => null,
            ]
        );

        Notification::firstOrCreate(
            ['user_id' => $elena->id, 'title' => 'Sarah Chen commented on WEB-103'],
            [
                'type' => 'comment_added',
                'message' => 'Sarah Chen commented: Tested the drag feedback on tablet viewport. Smooth animations.',
                'data' => ['task_key' => 'WEB-103'],
                'read_at' => now()->subHours(2),
            ]
        );

        Notification::firstOrCreate(
            ['user_id' => $sarah->id, 'title' => 'Task Overdue: WEB-106'],
            [
                'type' => 'task_due',
                'message' => 'Task WEB-106 "Comprehensive WCAG 2.1 AA accessibility audit" was due 2 days ago.',
                'data' => ['task_key' => 'WEB-106'],
                'read_at' => null,
            ]
        );

        // 9. Saved Views for Demo User
        SavedView::firstOrCreate(
            ['user_id' => $elena->id, 'name' => 'My Active Work'],
            [
                'filters' => ['status' => 'in-progress', 'assignee_id' => $elena->id],
                'view_mode' => 'board',
                'is_default' => true,
            ]
        );

        SavedView::firstOrCreate(
            ['user_id' => $elena->id, 'name' => 'High Priority Deliverables'],
            [
                'filters' => ['priority' => 'high'],
                'view_mode' => 'list',
                'is_default' => false,
            ]
        );

        SavedView::firstOrCreate(
            ['user_id' => $elena->id, 'name' => 'Overdue Items'],
            [
                'filters' => ['overdue' => 'true'],
                'view_mode' => 'list',
                'is_default' => false,
            ]
        );
    }
}
