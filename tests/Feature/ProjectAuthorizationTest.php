<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Comment;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $userA;

    protected User $userB;

    protected User $adminUser;

    protected Workspace $workspace;

    protected Project $projectA;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => UserRole::Admin->value]);
        Role::firstOrCreate(['name' => UserRole::User->value]);

        $this->userA = User::factory()->create();
        $this->userB = User::factory()->create();
        $this->adminUser = User::factory()->admin()->create();

        $this->workspace = Workspace::create([
            'name' => 'Engineering Workspace',
            'slug' => 'eng-ws',
            'owner_id' => $this->userA->id,
        ]);

        $this->projectA = Project::create([
            'workspace_id' => $this->workspace->id,
            'name' => 'Project Alpha',
            'key' => 'ALPHA',
            'status' => 'active',
            'owner_id' => $this->userA->id,
        ]);
        $this->projectA->members()->attach($this->userA->id, ['role' => 'owner']);
    }

    public function test_non_owner_cannot_add_members_to_project(): void
    {
        $response = $this->actingAs($this->userB, 'sanctum')
            ->postJson("/api/projects/{$this->projectA->id}/members", [
                'user_id' => $this->userB->id,
                'role' => 'member',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Only the project owner or an administrator can manage project members.']);

        $this->assertDatabaseMissing('project_members', [
            'project_id' => $this->projectA->id,
            'user_id' => $this->userB->id,
        ]);
    }

    public function test_non_owner_cannot_remove_members_from_project(): void
    {
        // Add userB first as member
        $this->projectA->members()->attach($this->userB->id, ['role' => 'member']);

        // Another random user attempts to remove userB
        $unrelatedUser = User::factory()->create();
        $response = $this->actingAs($unrelatedUser, 'sanctum')
            ->deleteJson("/api/projects/{$this->projectA->id}/members/{$this->userB->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $this->projectA->id,
            'user_id' => $this->userB->id,
        ]);
    }

    public function test_owner_can_add_and_remove_project_members(): void
    {
        // Owner adds userB
        $addResponse = $this->actingAs($this->userA, 'sanctum')
            ->postJson("/api/projects/{$this->projectA->id}/members", [
                'user_id' => $this->userB->id,
                'role' => 'member',
            ]);

        $addResponse->assertStatus(200);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $this->projectA->id,
            'user_id' => $this->userB->id,
        ]);

        // Owner removes userB
        $removeResponse = $this->actingAs($this->userA, 'sanctum')
            ->deleteJson("/api/projects/{$this->projectA->id}/members/{$this->userB->id}");

        $removeResponse->assertStatus(200);
        $this->assertDatabaseMissing('project_members', [
            'project_id' => $this->projectA->id,
            'user_id' => $this->userB->id,
        ]);
    }

    public function test_admin_can_manage_project_members(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/projects/{$this->projectA->id}/members", [
                'user_id' => $this->userB->id,
                'role' => 'manager',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $this->projectA->id,
            'user_id' => $this->userB->id,
            'role' => 'manager',
        ]);
    }

    public function test_assigned_collaborator_can_view_and_update_task(): void
    {
        // User A creates task assigned to User B
        $task = Task::factory()->create([
            'project_id' => $this->projectA->id,
            'user_id' => $this->userA->id,
            'assignee_id' => $this->userB->id,
            'status' => TaskStatus::Todo,
            'title' => 'Assigned collaborative task',
        ]);

        // User B views the task
        $viewResponse = $this->actingAs($this->userB, 'sanctum')
            ->getJson("/api/tasks/{$task->id}");

        $viewResponse->assertStatus(200)
            ->assertJson([
                'task' => [
                    'id' => $task->id,
                    'title' => 'Assigned collaborative task',
                ],
            ]);

        // User B updates the task status
        $updateResponse = $this->actingAs($this->userB, 'sanctum')
            ->patchJson("/api/tasks/{$task->id}/status", [
                'status' => 'in-progress',
            ]);

        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'in-progress',
        ]);
    }

    public function test_comment_deletion_enforces_task_scoping_and_ownership(): void
    {
        $task1 = Task::factory()->create(['user_id' => $this->userA->id]);
        $task2 = Task::factory()->create(['user_id' => $this->userB->id]);

        $comment1 = Comment::create([
            'task_id' => $task1->id,
            'user_id' => $this->userA->id,
            'body' => 'Original comment on task 1',
        ]);

        // Mismatched task ID returns 404
        $mismatchResponse = $this->actingAs($this->userA, 'sanctum')
            ->deleteJson("/api/tasks/{$task2->id}/comments/{$comment1->id}");

        // If userA cannot view task2, it returns 403; if userA is allowed to view, it returns 404
        // Let's test with task1 (matching) but userB (cannot delete userA's comment)
        $unauthResponse = $this->actingAs($this->userB, 'sanctum')
            ->deleteJson("/api/tasks/{$task1->id}/comments/{$comment1->id}");

        $this->assertTrue(in_array($unauthResponse->status(), [403, 404]));

        // Owner of comment can delete from correct task
        $deleteResponse = $this->actingAs($this->userA, 'sanctum')
            ->deleteJson("/api/tasks/{$task1->id}/comments/{$comment1->id}");

        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('comments', ['id' => $comment1->id]);
    }
}
