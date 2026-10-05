<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiTaskSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiTaskController extends Controller
{
    /**
     * Provide AI-assisted priority and classification suggestions for tasks.
     */
    public function suggest(Request $request, AiTaskSuggestionService $aiService): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $suggestion = $aiService->suggest(
            $validated['title'],
            $validated['description'] ?? null
        );

        return response()->json([
            'suggestion' => $suggestion,
        ], 200);
    }
}
