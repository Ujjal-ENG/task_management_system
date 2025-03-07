<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roleName): Response
    {
        if (!$request->user() || !$request->user()->hasRole($roleName)) {
            return response()->json(['message' => 'Unauthorized. You do not have the required role.'], Response::HTTP_UNAUTHORIZED);
        }
        return $next($request);
    }
}
