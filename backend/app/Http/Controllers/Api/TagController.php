<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        $tags = Tag::withCount('tasks')->orderBy('name')->get();

        return $this->successResponse(TagResource::collection($tags), 'Tags retrieved');
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = Tag::create($request->validated());

        return $this->successResponse(new TagResource($tag), 'Tag created successfully', JsonResponse::HTTP_CREATED);
    }

    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $tag->update($request->validated());

        return $this->successResponse(new TagResource($tag), 'Tag updated successfully');
    }

    public function destroy(Request $request, Tag $tag): JsonResponse
    {
        if ($request->user()->isMember()) {
            return $this->errorResponse('Unauthorized to delete tags', null, JsonResponse::HTTP_FORBIDDEN);
        }

        $tag->delete();

        return $this->successResponse(null, 'Tag deleted successfully');
    }
}
