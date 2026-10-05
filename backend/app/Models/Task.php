<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_URGENT = 'urgent';

    public const STATUS_TODO = 'todo';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_BLOCKED = 'blocked';
    public const STATUS_DONE = 'done';

    public const PRIORITIES = [
        self::PRIORITY_LOW,
        self::PRIORITY_MEDIUM,
        self::PRIORITY_HIGH,
        self::PRIORITY_URGENT,
    ];

    public const STATUSES = [
        self::STATUS_TODO,
        self::STATUS_IN_PROGRESS,
        self::STATUS_BLOCKED,
        self::STATUS_DONE,
    ];

    protected $fillable = [
        'project_id',
        'parent_task_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'assigned_to',
        'created_by',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tag');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class)->latest();
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->latest();
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class)->latest();
    }

    public function scopeRootOnly(Builder $query): Builder
    {
        return $query->whereNull('parent_task_id');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', '!=', self::STATUS_DONE)
            ->whereNotNull('due_date')
            ->where('due_date', '<', Carbon::now());
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $search = $filters['search'];
            $q->where(function ($subQ) use ($search) {
                $subQ->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        })
        ->when(!empty($filters['status']), function ($q) use ($filters) {
            if (is_array($filters['status'])) {
                $q->whereIn('status', $filters['status']);
            } else {
                $q->where('status', $filters['status']);
            }
        })
        ->when(!empty($filters['priority']), function ($q) use ($filters) {
            if (is_array($filters['priority'])) {
                $q->whereIn('priority', $filters['priority']);
            } else {
                $q->where('priority', $filters['priority']);
            }
        })
        ->when(!empty($filters['assigned_to']), function ($q) use ($filters) {
            $q->where('assigned_to', $filters['assigned_to']);
        })
        ->when(!empty($filters['project_id']), function ($q) use ($filters) {
            $q->where('project_id', $filters['project_id']);
        })
        ->when(!empty($filters['tag']), function ($q) use ($filters) {
            $tag = $filters['tag'];
            $q->whereHas('tags', function ($tagQuery) use ($tag) {
                if (is_numeric($tag)) {
                    $tagQuery->where('tags.id', $tag);
                } else {
                    $tagQuery->where('tags.name', $tag);
                }
            });
        })
        ->when(!empty($filters['due_date_from']), function ($q) use ($filters) {
            $q->where('due_date', '>=', Carbon::parse($filters['due_date_from'])->startOfDay());
        })
        ->when(!empty($filters['due_date_to']), function ($q) use ($filters) {
            $q->where('due_date', '<=', Carbon::parse($filters['due_date_to'])->endOfDay());
        })
        ->when(isset($filters['overdue']) && filter_var($filters['overdue'], FILTER_VALIDATE_BOOLEAN), function ($q) {
            $q->overdue();
        });
    }

    /**
     * Compute progress of subtasks
     */
    public function getSubtaskProgress(): array
    {
        $total = $this->subtasks()->count();
        $completed = $this->subtasks()->where('status', self::STATUS_DONE)->count();
        $percentage = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'total' => $total,
            'completed' => $completed,
            'percentage' => $percentage,
            'summary' => "{$completed} / {$total} subtasks completed",
        ];
    }
}
