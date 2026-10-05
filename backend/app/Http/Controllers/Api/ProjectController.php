<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Project::query()
            ->with('creator:id,name,email')
            ->withCount('tasks')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->input('search');
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->input('status'));
            })
            ->latest();

        $projects = $query->paginate($request->input('per_page', 15));

        return $this->successResponse([
            'items' => ProjectResource::collection($projects->items()),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ], 'Projects retrieved successfully');
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        Gate::authorize('create', Project::class);

        $project = Project::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status', 'active'),
            'created_by' => $request->user()->id,
        ]);

        return $this->successResponse(new ProjectResource($project->load('creator')), 'Project created successfully', JsonResponse::HTTP_CREATED);
    }

    public function show(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $project->load(['creator'])->loadCount('tasks');

        return $this->successResponse(new ProjectResource($project), 'Project details retrieved');
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        Gate::authorize('update', $project);

        $project->update($request->validated());

        return $this->successResponse(new ProjectResource($project->fresh('creator')), 'Project updated successfully');
    }

    public function destroy(Project $project): JsonResponse
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return $this->successResponse(null, 'Project deleted successfully');
    }

    public function tasks(Project $project, Request $request): JsonResponse
    {
        Gate::authorize('view', $project);

        $tasks = $project->tasks()
            ->with(['assignee', 'tags', 'subtasks'])
            ->withCount(['comments', 'attachments', 'subtasks'])
            ->filter($request->all())
            ->latest()
            ->paginate($request->input('per_page', 20));

        return $this->successResponse([
            'project' => new ProjectResource($project),
            'items' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ], 'Project tasks retrieved');
    }
}
