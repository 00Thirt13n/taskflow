<?php

namespace App\Services;

use App\Enums\TaskPriority;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiTaskSuggestionService
{
    /**
     * Generate smart task suggestions (priority, category, urgency, tags, summary)
     * using Gemini API if configured, with automatic deterministic fallback.
     */
    public function suggest(string $title, ?string $description = null): array
    {
        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (! empty($apiKey)) {
            try {
                $geminiResult = $this->callGeminiApi($title, $description, $apiKey);
                if ($geminiResult !== null) {
                    return $geminiResult;
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini AI suggestion call failed, switching to heuristic fallback', [
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return $this->heuristicFallback($title, $description);
    }

    /**
     * Call Gemini API with strict timeout, JSON schema, and payload sanitization.
     */
    protected function callGeminiApi(string $title, ?string $description, string $apiKey): ?array
    {
        $prompt = <<<PROMPT
You are a task management AI assistant. Analyze the task title and description below and classify it.
Title: "{$title}"
Description: "{$description}"

Respond ONLY with a valid JSON object matching this exact schema:
{
  "priority": "low" | "medium" | "high",
  "category": string (e.g. "deployment", "bug", "feature", "infrastructure", "security", "planning", "documentation"),
  "estimated_urgency": "low" | "moderate" | "urgent" | "immediate",
  "suggested_tags": array of 1-4 short strings,
  "summary": string (concise 1-sentence action summary)
}
PROMPT;

        $response = Http::timeout(3.5)
            ->retry(1, 100)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'responseMimeType' => 'application/json',
                ],
            ]);

        if (! $response->successful()) {
            Log::warning('Gemini API returned non-200 code', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        }

        $body = $response->json();
        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (! $text) {
            return null;
        }

        $decoded = json_decode($text, true);
        if (! is_array($decoded)) {
            return null;
        }

        return $this->validateAndFormat($decoded, 'gemini');
    }

    /**
     * Deterministic, rule-based heuristic classification when AI is offline or unconfigured.
     */
    public function heuristicFallback(string $title, ?string $description = null): array
    {
        $text = strtolower($title.' '.($description ?? ''));

        // Priority heuristics
        $priority = TaskPriority::Medium->value;
        $urgency = 'moderate';

        if (preg_match('/\b(critical|urgent|asap|hotfix|emergency|blocker|outage|security|immediately|friday|deadline)\b/', $text)) {
            $priority = TaskPriority::High->value;
            $urgency = 'urgent';
        } elseif (preg_match('/\b(low|nice to have|eventually|someday|cleanup|minor|optional|typo)\b/', $text)) {
            $priority = TaskPriority::Low->value;
            $urgency = 'low';
        }

        // Category & Tag heuristics
        $category = 'general';
        $tags = ['task'];

        if (preg_match('/\b(deploy|release|ci\/cd|pipeline|docker|kubernetes|nginx|server|prod)\b/', $text)) {
            $category = 'deployment';
            $tags = ['deployment', 'infrastructure'];
        } elseif (preg_match('/\b(security|auth|sanctum|vulnerability|firewall|csrf|ssl|token)\b/', $text)) {
            $category = 'security';
            $tags = ['security', 'compliance'];
        } elseif (preg_match('/\b(bug|fix|error|exception|crash|broken|fault)\b/', $text)) {
            $category = 'bug';
            $tags = ['bugfix', 'quality'];
        } elseif (preg_match('/\b(index|optimize|query|sql|database|mysql|performance|slow|explain)\b/', $text)) {
            $category = 'database';
            $tags = ['database', 'performance'];
        } elseif (preg_match('/\b(ui|ux|frontend|react|design|css|responsive|component|accessibility)\b/', $text)) {
            $category = 'frontend';
            $tags = ['ui', 'frontend'];
        } elseif (preg_match('/\b(test|phpunit|vitest|e2e|coverage|mock|spec)\b/', $text)) {
            $category = 'testing';
            $tags = ['qa', 'testing'];
        } elseif (preg_match('/\b(doc|documentation|readme|spec|architecture|guide)\b/', $text)) {
            $category = 'documentation';
            $tags = ['docs'];
        }

        return [
            'priority' => $priority,
            'category' => $category,
            'estimated_urgency' => $urgency,
            'suggested_tags' => array_values(array_unique($tags)),
            'summary' => 'Classified as '.$category.' with '.$priority.' priority based on content analysis.',
            'source' => 'heuristic_engine',
        ];
    }

    /**
     * Validate and sanitize AI response structure against expected schema.
     */
    protected function validateAndFormat(array $data, string $source): array
    {
        $priority = in_array(strtolower($data['priority'] ?? ''), TaskPriority::values(), true)
            ? strtolower($data['priority'])
            : TaskPriority::Medium->value;

        $category = is_string($data['category'] ?? null)
            ? strtolower(substr(trim($data['category']), 0, 50))
            : 'general';

        $urgency = in_array(strtolower($data['estimated_urgency'] ?? ''), ['low', 'moderate', 'urgent', 'immediate'], true)
            ? strtolower($data['estimated_urgency'])
            : 'moderate';

        $tags = is_array($data['suggested_tags'] ?? null)
            ? array_slice(array_map('strval', $data['suggested_tags']), 0, 4)
            : [$category];

        $summary = is_string($data['summary'] ?? null)
            ? substr(trim($data['summary']), 0, 255)
            : 'AI classified as '.$category.' with '.$priority.' priority.';

        return [
            'priority' => $priority,
            'category' => $category,
            'estimated_urgency' => $urgency,
            'suggested_tags' => $tags,
            'summary' => $summary,
            'source' => $source,
        ];
    }
}
