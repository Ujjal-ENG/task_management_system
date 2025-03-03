<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PermissionController extends Controller
{
    /**
     * Create initial task permission roles if they don't exist
     *
     * @return JsonResponse
     */
    public function initializeTaskPermissions(): JsonResponse
    {
        if (!request()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $permissions = [
            ['name' => 'create_task', 'description' => 'Can create tasks'],
            ['name' => 'read_task', 'description' => 'Can view tasks'],
            ['name' => 'update_task', 'description' => 'Can edit tasks'],
            ['name' => 'delete_task', 'description' => 'Can delete tasks'],
        ];

        DB::beginTransaction();
        try {
            foreach ($permissions as $permission) {
                Role::firstOrCreate(
                    ['name' => $permission['name']],
                    ['description' => $permission['description']]
                );
            }
            DB::commit();

            return response()->json(['message' => 'Task permissions initialized successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to initialize permissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Check if user has specific permission
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkPermission(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'permission' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $user = User::find($request->user_id);
        $hasPermission = $user->hasRole($request->permission) || $user->isAdmin();

        return response()->json([
            'user_id' => $user->id,
            'permission' => $request->permission,
            'has_permission' => $hasPermission
        ]);
    }

    /**
     * Get all permissions for a specific user
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getUserPermissions(Request $request, int $userId): JsonResponse
    {
        if (!$request->user()->isAdmin() && $request->user()->id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::with('roles')->findOrFail($userId);

        return response()->json([
            'user_id' => $user->id,
            'permissions' => $user->roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description
                ];
            })
        ]);
    }
}
