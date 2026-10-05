<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Diagnostic health check for load balancers and orchestrators.
     */
    public function check(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        $dbStatus = 'healthy';
        $dbLatencyMs = null;

        try {
            DB::select('SELECT 1');
            $dbLatencyMs = round((microtime(true) - $startTime) * 1000, 2);
        } catch (\Throwable $e) {
            $dbStatus = 'unreachable: '.$e->getMessage();
        }

        $status = ($dbStatus === 'healthy') ? 'ok' : 'degraded';
        $httpCode = ($status === 'ok') ? 200 : 503;

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'service' => config('app.name', 'TaskFlow'),
            'environment' => config('app.env', 'production'),
            'php_version' => PHP_VERSION,
            'database' => [
                'status' => $dbStatus,
                'latency_ms' => $dbLatencyMs,
            ],
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'uptime' => 'active',
        ], $httpCode);
    }
}
