<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiTaskSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiTaskController extends Controller
{
    public function __construct(
        protected AiTaskSuggestionService $aiService
    ) {}

    /**
     * Provide AI-assisted priority and classification suggestions for tasks.
     */
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $suggestion = $this->aiService->suggest(
            $validated['title'],
            $validated['description'] ?? null
        );

        return response()->json([
            'suggestion' => $suggestion,
        ], 200);
    }

    /**
     * Generate actionable subtasks from title & description.
     */
    public function subtasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $subtasks = $this->aiService->generateSubtasks(
            $validated['title'],
            $validated['description'] ?? null
        );

        return response()->json([
            'subtasks' => $subtasks,
        ], 200);
    }

    /**
     * Improve task description with structured objective and acceptance criteria.
     */
    public function improveDescription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $result = $this->aiService->improveDescription(
            $validated['title'],
            $validated['description'] ?? null
        );

        return response()->json($result, 200);
    }

    /**
     * Parse natural language into structured task fields.
     */
    public function parseNaturalLanguage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $result = $this->aiService->parseNaturalLanguage($validated['prompt']);

        return response()->json($result, 200);
    }
}
