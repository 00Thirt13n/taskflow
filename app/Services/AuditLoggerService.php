<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditLoggerService
{
    /**
     * Record an audit event.
     */
    public function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?array $metadata = null,
        ?User $actor = null
    ): ?AuditLog {
        try {
            $user = $actor ?? Auth::user();

            return AuditLog::create([
                'user_id' => $user?->id,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'metadata' => $metadata,
                'ip_address' => request()?->ip() ?? '127.0.0.1',
                'user_agent' => request()?->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Never allow an audit logging failure to crash a primary business transaction
            Log::error('Failed to write audit log entry', [
                'action' => $action,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
