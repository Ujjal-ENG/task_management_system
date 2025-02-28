<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{

    /**
     * @param Request $request
     * @return JsonResponse
     * get all roles admin (Only)
     */
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $roles = Role::all();
        return response()->json($roles);
    }


    /**
     * @param Request $request
     * @return JsonResponse
     * Role Assigned from Admin End
     */
    public function assignRole(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make(request()->all(), [
            'role_id' => 'required|integer|exists:roles,id',
            'user_id' => 'required|integer|exists:users,id'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $user = User::query()->findOrFail(request()->user_id);
        $role = Role::query()->findOrFail(request()->role_id);

        if(!$user->roles()->where('role_id', $role->id)->exists()) {
            $user->roles()->attach($role);
        }

        return response()->json(['success' => 'Role assigned successfully.']);

    }


    /**
     * @param Request $request
     * @return JsonResponse
     * Role removed from the Admin part
     */
    public function removeRole(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $validator = Validator::make(request()->all(), [
            'role_id' => 'required|integer|exists:roles,id',
            'user_id' => 'required|integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $user = User::query()->findOrFail($request->user_id);
        $user->roles()->detach($request->role_id);

        return response()->json(['success' => 'Role removed successfully.']);
    }
}
