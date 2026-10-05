<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $workspaces = Workspace::with(['projects' => function ($q) {
            $q->select('id', 'workspace_id', 'name', 'key', 'color', 'icon', 'status');
        }])->get();

        return response()->json([
            'data' => $workspaces->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'slug' => $w->slug,
                'description' => $w->description,
                'projects' => $w->projects,
            ]),
        ]);
    }
}
