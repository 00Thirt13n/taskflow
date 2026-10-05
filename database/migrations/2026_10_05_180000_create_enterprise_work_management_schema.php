<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Workspaces
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->text('description')->nullable();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // 2. Projects
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('key', 20); // e.g. "WEB", "API", "SEC"
            $table->text('description')->nullable();
            $table->string('status', 30)->default('active'); // planning, active, on-hold, completed, archived
            $table->string('color', 20)->default('#4f46e5');
            $table->string('icon', 50)->default('folder');
            $table->date('start_date')->nullable();
            $table->date('target_date')->nullable();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['workspace_id', 'key'], 'uniq_projects_workspace_key');
            $table->index(['workspace_id', 'status'], 'idx_projects_workspace_status');
        });

        // 3. Project Members
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 30)->default('member'); // owner, manager, member, viewer
            $table->timestamps();

            $table->unique(['project_id', 'user_id'], 'uniq_project_member');
        });

        // 4. Labels / Tags
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->cascadeOnDelete();
            $table->string('name', 50);
            $table->string('color', 20)->default('#64748b');
            $table->timestamps();

            $table->index(['project_id', 'name'], 'idx_labels_project_name');
        });

        // 5. Expand Tasks table for Enterprise capabilities
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained('projects')->nullOnDelete();
            $table->string('task_key', 50)->nullable()->after('project_id');
            $table->foreignId('parent_task_id')->nullable()->after('project_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->integer('position')->default(0)->after('priority');
            $table->integer('estimated_minutes')->nullable()->after('position');
            $table->integer('logged_minutes')->default(0)->after('estimated_minutes');
            $table->date('start_date')->nullable()->after('due_date');
            $table->timestamp('completed_at')->nullable()->after('start_date');
            $table->boolean('is_blocked')->default(false)->after('completed_at');
            $table->string('blocker_reason')->nullable()->after('is_blocked');

            // Composite indexes for enterprise multi-view filtering & boards
            $table->index(['project_id', 'status', 'position'], 'idx_tasks_project_status_pos');
            $table->index(['project_id', 'due_date'], 'idx_tasks_project_due_date');
            $table->index(['assignee_id', 'status'], 'idx_tasks_assignee_status');
            $table->index('task_key', 'idx_tasks_key');
        });

        // 6. Task Labels Pivot
        Schema::create('task_labels', function (Blueprint $table) {
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('label_id')->constrained('labels')->cascadeOnDelete();
            $table->primary(['task_id', 'label_id']);
        });

        // 7. Task Dependencies (Blocks / Blocked by)
        Schema::create('task_dependencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('depends_on_task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('type', 30)->default('blocked_by'); // blocks, blocked_by
            $table->timestamps();

            $table->unique(['task_id', 'depends_on_task_id'], 'uniq_task_dependency');
        });

        // 8. Task Comments & Discussions
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['task_id', 'created_at'], 'idx_comments_task_created');
        });

        // 9. Task Activity Logs (field-level change history)
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 50); // created, updated, status_changed, comment_added, etc.
            $table->string('field', 50)->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['task_id', 'created_at'], 'idx_activity_task_created');
        });

        // 10. In-App Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 50); // task_assigned, task_due, comment_added, status_changed
            $table->string('title', 200);
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at', 'created_at'], 'idx_notif_user_read_created');
        });

        // 11. Saved Filter Views
        Schema::create('saved_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 100);
            $table->json('filters');
            $table->string('view_mode', 30)->default('list'); // list, board, calendar, timeline
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'created_at'], 'idx_saved_views_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_views');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('task_dependencies');
        Schema::dropIfExists('task_labels');

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_project_status_pos');
            $table->dropIndex('idx_tasks_project_due_date');
            $table->dropIndex('idx_tasks_assignee_status');
            $table->dropIndex('idx_tasks_key');

            $table->dropForeign(['project_id']);
            $table->dropForeign(['parent_task_id']);
            $table->dropForeign(['assignee_id']);

            $table->dropColumn([
                'project_id',
                'task_key',
                'parent_task_id',
                'assignee_id',
                'position',
                'estimated_minutes',
                'logged_minutes',
                'start_date',
                'completed_at',
                'is_blocked',
                'blocker_reason',
            ]);
        });

        Schema::dropIfExists('labels');
        Schema::dropIfExists('project_members');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('workspaces');
    }
};
