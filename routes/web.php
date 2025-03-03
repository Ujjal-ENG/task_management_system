<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');

        Route::get('/users', function () {
            return Inertia::render('Admin/Users');
        })->name('admin.users');

        Route::get('/settings', function () {
            return Inertia::render('Admin/Settings');
        })->name('admin.settings');
    });
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/api.php';

require __DIR__.'/api.php';
