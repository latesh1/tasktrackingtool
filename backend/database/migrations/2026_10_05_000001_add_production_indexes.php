<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add performance indexes for production.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index('project_id', 'idx_tasks_project_id');
            $table->index('assigned_to', 'idx_tasks_assigned_to');
            $table->index('created_by', 'idx_tasks_created_by');
            $table->index('parent_task_id', 'idx_tasks_parent_task_id');
        });

        Schema::table('task_comments', function (Blueprint $table) {
            $table->index('task_id', 'idx_comments_task_id');
            $table->index('user_id', 'idx_comments_user_id');
        });

        Schema::table('task_activities', function (Blueprint $table) {
            $table->index('task_id', 'idx_activities_task_id');
            $table->index('user_id', 'idx_activities_user_id');
            $table->index('action', 'idx_activities_action');
        });

        Schema::table('task_attachments', function (Blueprint $table) {
            $table->index('task_id', 'idx_attachments_task_id');
            $table->index('user_id', 'idx_attachments_user_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id', 'idx_notifications_user_id');
            $table->index('task_id', 'idx_notifications_task_id');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->index('tokenable_id', 'idx_pat_tokenable_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_project_id');
            $table->dropIndex('idx_tasks_assigned_to');
            $table->dropIndex('idx_tasks_created_by');
            $table->dropIndex('idx_tasks_parent_task_id');
        });

        Schema::table('task_comments', function (Blueprint $table) {
            $table->dropIndex('idx_comments_task_id');
            $table->dropIndex('idx_comments_user_id');
        });

        Schema::table('task_activities', function (Blueprint $table) {
            $table->dropIndex('idx_activities_task_id');
            $table->dropIndex('idx_activities_user_id');
            $table->dropIndex('idx_activities_action');
        });

        Schema::table('task_attachments', function (Blueprint $table) {
            $table->dropIndex('idx_attachments_task_id');
            $table->dropIndex('idx_attachments_user_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_id');
            $table->dropIndex('idx_notifications_task_id');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('idx_pat_tokenable_id');
        });
    }
};
