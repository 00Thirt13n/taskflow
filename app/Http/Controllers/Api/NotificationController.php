<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $unreadCount = $request->user()->notifications()
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data' => $notifications->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'message' => $n->message,
                'data' => $n->data,
                'read_at' => $n->read_at?->toIso8601String(),
                'is_read' => !is_null($n->read_at),
                'created_at' => $n->created_at->diffForHumans(),
            ]),
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
