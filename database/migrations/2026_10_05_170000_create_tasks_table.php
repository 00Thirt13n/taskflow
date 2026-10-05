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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('todo');
            $table->string('priority', 20)->default('medium');
            $table->date('due_date')->nullable();
            $table->timestamps();

            // Strategic composite indexes tailored for real API filter queries
            $table->index(['user_id', 'status'], 'idx_tasks_user_status');
            $table->index(['user_id', 'status', 'due_date'], 'idx_tasks_user_status_due_date');
            $table->index(['user_id', 'priority'], 'idx_tasks_user_priority');
            $table->index(['status', 'due_date'], 'idx_tasks_status_due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
