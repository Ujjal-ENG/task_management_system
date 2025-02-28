<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * get all users (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        if(!$request->user()->isAdmin()){
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $users = User::with('roles')->get();
        return response()->json(['users' => $users], 200);
    }


    /**
     * @param Request $request
     * @return JsonResponse
     * get all authenticated users
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');
        return response()->json(['user' => $user], 200);
    }
}
