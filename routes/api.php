<?php


use App\Http\Controllers\RoleController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // User profile
    Route::get('/user', [UserController::class, 'profile']);

    // Task routes
    Route::get('/task-dashboard', [TaskController::class, 'taskIndex']);
    Route::get('/task/TaskForm', [TaskController::class, 'create'])->name('create-task');
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    Route::post('/tasks/bulk-update', [TaskController::class, 'bulkUpdate']);
    Route::get('/tasks/{id}/activities', [TaskController::class, 'activities']);
    Route::get('/tasks/statistics', [TaskController::class, 'statistics']);
    Route::get('/tasks/export', [TaskController::class, 'export']);

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles/assign', [RoleController::class, 'assignRole']);
        Route::post('/roles/remove', [RoleController::class, 'removeRole']);
    });
});
