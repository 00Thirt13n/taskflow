<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedViewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $views = $request->user()->savedViews()
            ->orderBy('is_default', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'data' => $views,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'filters' => ['required', 'array'],
            'view_mode' => ['nullable', 'string', 'in:list,board,calendar,timeline'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        if (!empty($validated['is_default'])) {
            $request->user()->savedViews()->update(['is_default' => false]);
        }

        $view = $request->user()->savedViews()->create([
            'name' => $validated['name'],
            'filters' => $validated['filters'],
            'view_mode' => $validated['view_mode'] ?? 'list',
            'is_default' => $validated['is_default'] ?? false,
        ]);

        return response()->json([
            'message' => 'Filter view saved successfully.',
            'data' => $view,
        ], 201);
    }

    public function destroy(Request $request, SavedView $savedView): JsonResponse
    {
        if ($savedView->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $savedView->delete();

        return response()->json(['message' => 'Saved view deleted.']);
    }
}
