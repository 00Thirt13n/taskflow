<?php

namespace App\Services;

use App\Enums\TaskPriority;
use Carbon\Carbon;
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
     * Generate actionable subtasks for a task.
     */
    public function generateSubtasks(string $title, ?string $description = null): array
    {
        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (! empty($apiKey)) {
            try {
                $prompt = "Generate 3 to 5 actionable subtasks for this task.\nTitle: \"{$title}\"\nDescription: \"{$description}\"\nRespond ONLY with JSON array of strings: [\"subtask 1\", \"subtask 2\"]";
                $res = $this->rawGeminiJson($prompt, $apiKey);
                if (is_array($res) && !empty($res)) {
                    return array_slice(array_map('strval', $res), 0, 5);
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini subtask generation failed, falling back', ['error' => $e->getMessage()]);
            }
        }

        // Heuristic subtask generator
        $text = strtolower($title . ' ' . ($description ?? ''));
        if (str_contains($text, 'auth') || str_contains($text, 'login')) {
            return [
                'Configure authentication routes and rate limits',
                'Implement token issue and revocation endpoints',
                'Write automated feature tests for invalid credentials',
            ];
        }

        if (str_contains($text, 'deploy') || str_contains($text, 'docker') || str_contains($text, 'server')) {
            return [
                'Validate environment configuration and secrets',
                'Build and verify multi-stage container images',
                'Run health check probes and smoke tests',
            ];
        }

        if (str_contains($text, 'design') || str_contains($text, 'ui') || str_contains($text, 'frontend')) {
            return [
                'Define design tokens and accessible contrast ratios',
                'Build responsive component layout across viewports',
                'Conduct keyboard navigation and screen reader checks',
            ];
        }

        return [
            'Draft initial technical specification and requirements',
            'Implement core functional logic and validation rules',
            'Verify with automated test coverage and peer review',
        ];
    }

    /**
     * Generate enhanced description with clear objective and acceptance criteria.
     */
    public function improveDescription(string $title, ?string $currentDescription = null): array
    {
        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (! empty($apiKey)) {
            try {
                $prompt = "Improve this task description for an enterprise engineering team. Provide structured Markdown with Objective and Acceptance Criteria checkboxes.\nTitle: \"{$title}\"\nCurrent: \"{$currentDescription}\"\nRespond with JSON: {\"improved_description\": \"markdown string\"}";
                $res = $this->rawGeminiJson($prompt, $apiKey);
                if (isset($res['improved_description'])) {
                    return ['improved_description' => $res['improved_description'], 'source' => 'gemini'];
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini description improvement failed, using heuristic template', ['error' => $e->getMessage()]);
            }
        }

        $improved = "### Objective\n" . ($currentDescription ?: "Deliver high-quality implementation for: {$title}") . "\n\n### Acceptance Criteria\n- [ ] Core business requirements implemented and verified\n- [ ] Edge cases handled with graceful error reporting\n- [ ] Automated tests written and passing locally and in CI\n- [ ] Documentation updated to reflect changes";

        return [
            'improved_description' => $improved,
            'source' => 'heuristic_engine',
        ];
    }

    /**
     * Parse natural language into structured task fields.
     */
    public function parseNaturalLanguage(string $input): array
    {
        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (! empty($apiKey)) {
            try {
                $prompt = "Extract task details from this natural language request: \"{$input}\".\nToday is " . now()->toDateString() . ".\nRespond ONLY with JSON: {\"title\": string, \"priority\": \"low\"|\"medium\"|\"high\", \"due_date\": \"YYYY-MM-DD\"|null, \"suggested_assignee\": string|null, \"suggested_tags\": [string]}";
                $res = $this->rawGeminiJson($prompt, $apiKey);
                if (is_array($res) && !empty($res['title'])) {
                    return [
                        'title' => $res['title'],
                        'priority' => in_array($res['priority'] ?? '', ['low', 'medium', 'high']) ? $res['priority'] : 'medium',
                        'due_date' => $res['due_date'] ?? null,
                        'suggested_assignee' => $res['suggested_assignee'] ?? null,
                        'suggested_tags' => $res['suggested_tags'] ?? [],
                        'source' => 'gemini',
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini NLP task parse failed, using heuristic parser', ['error' => $e->getMessage()]);
            }
        }

        // Heuristic NLP parser
        $text = $input;
        $priority = 'medium';
        if (preg_match('/\b(urgent|critical|high priority|asap)\b/i', $text)) {
            $priority = 'high';
        } elseif (preg_match('/\b(low priority|minor)\b/i', $text)) {
            $priority = 'low';
        }

        $dueDate = null;
        if (preg_match('/\b(by|before|on)\s+today\b/i', $text)) {
            $dueDate = now()->toDateString();
        } elseif (preg_match('/\b(by|before|on)\s+tomorrow\b/i', $text)) {
            $dueDate = now()->addDay()->toDateString();
        } elseif (preg_match('/\b(by|before|on)\s+friday\b/i', $text)) {
            $dueDate = now()->next(Carbon::FRIDAY)->toDateString();
        } elseif (preg_match('/\b(by|before|on)\s+monday\b/i', $text)) {
            $dueDate = now()->next(Carbon::MONDAY)->toDateString();
        }

        $assignee = null;
        if (preg_match('/\bassign(?:ed)?\s+to\s+([A-Za-z]+)\b/i', $text, $matches)) {
            $assignee = $matches[1];
        }

        // Clean title
        $cleanTitle = preg_replace('/\b(high|medium|low)\s+priority\b/i', '', $text);
        $cleanTitle = preg_replace('/\bassign(?:ed)?\s+to\s+[A-Za-z]+\b/i', '', $cleanTitle);
        $cleanTitle = preg_replace('/\b(by|before|on)\s+(today|tomorrow|friday|monday)\b/i', '', $cleanTitle);
        $cleanTitle = trim(preg_replace('/[,\s]+$/', '', $cleanTitle));
        $cleanTitle = ucfirst(trim($cleanTitle));

        return [
            'title' => $cleanTitle ?: $input,
            'priority' => $priority,
            'due_date' => $dueDate,
            'suggested_assignee' => $assignee,
            'suggested_tags' => ['quick-create'],
            'source' => 'heuristic_engine',
        ];
    }

    /**
     * Raw helper to execute JSON-mode Gemini call.
     */
    protected function rawGeminiJson(string $prompt, string $apiKey): ?array
    {
        $response = Http::timeout(3.5)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'responseMimeType' => 'application/json',
                ],
            ]);

        if (!$response->successful()) {
            return null;
        }

        $body = $response->json();
        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!$text) {
            return null;
        }

        return json_decode($text, true);
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

        $decoded = $this->rawGeminiJson($prompt, $apiKey);
        if (!is_array($decoded)) {
            return null;
        }

        return $this->validateAndFormat($decoded, 'gemini');
    }

    /**
     * Deterministic, rule-based heuristic classification when AI is offline or unconfigured.
     */
    public function heuristicFallback(string $title, ?string $description = null): array
    {
        $text = strtolower($title . ' ' . ($description ?? ''));

        $priority = TaskPriority::Medium->value;
        $urgency = 'moderate';

        if (preg_match('/\b(critical|urgent|asap|hotfix|emergency|blocker|outage|security|immediately|friday|deadline)\b/', $text)) {
            $priority = TaskPriority::High->value;
            $urgency = 'urgent';
        } elseif (preg_match('/\b(low|nice to have|eventually|someday|cleanup|minor|optional|typo)\b/', $text)) {
            $priority = TaskPriority::Low->value;
            $urgency = 'low';
        }

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
            'summary' => 'Classified as ' . $category . ' with ' . $priority . ' priority based on content analysis.',
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
            : 'AI classified as ' . $category . ' with ' . $priority . ' priority.';

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
