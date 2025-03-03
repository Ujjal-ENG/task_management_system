<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $roles = [
            ['name' => 'admin', 'description' => 'Administrator with full access'],
            ['name' => 'create_task', 'description' => 'Can create tasks'],
            ['name' => 'read_task', 'description' => 'Can view tasks'],
            ['name' => 'update_task', 'description' => 'Can edit tasks'],
            ['name' => 'delete_task', 'description' => 'Can delete tasks'],
            ['name' => 'manager', 'description' => 'Can manage tasks and view reports'],
        ];

        DB::beginTransaction();
        try {
            foreach ($roles as $role) {
                Role::firstOrCreate(
                    ['name' => $role['name']],
                    ['description' => $role['description']]
                );
            }

            // Create admin user if not exists
            $adminUser = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Assign admin role to admin user
            $adminRole = Role::where('name', 'admin')->first();
            if (!$adminUser->roles()->where('role_id', $adminRole->id)->exists()) {
                $adminUser->roles()->attach($adminRole);
            }

            // Create manager user if not exists
            $managerUser = User::firstOrCreate(
                ['email' => 'manager@example.com'],
                [
                    'name' => 'Manager User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Assign manager role and task permissions
            $managerRole = Role::where('name', 'manager')->first();
            $createTaskRole = Role::where('name', 'create_task')->first();
            $readTaskRole = Role::where('name', 'read_task')->first();
            $updateTaskRole = Role::where('name', 'update_task')->first();

            if (!$managerUser->roles()->where('role_id', $managerRole->id)->exists()) {
                $managerUser->roles()->attach($managerRole);
            }
            if (!$managerUser->roles()->where('role_id', $createTaskRole->id)->exists()) {
                $managerUser->roles()->attach($createTaskRole);
            }
            if (!$managerUser->roles()->where('role_id', $readTaskRole->id)->exists()) {
                $managerUser->roles()->attach($readTaskRole);
            }
            if (!$managerUser->roles()->where('role_id', $updateTaskRole->id)->exists()) {
                $managerUser->roles()->attach($updateTaskRole);
            }

            // Create regular user if not exists
            $regularUser = User::firstOrCreate(
                ['email' => 'user@example.com'],
                [
                    'name' => 'Regular User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Assign basic task permissions to regular user
            if (!$regularUser->roles()->where('role_id', $readTaskRole->id)->exists()) {
                $regularUser->roles()->attach($readTaskRole);
            }
            if (!$regularUser->roles()->where('role_id', $createTaskRole->id)->exists()) {
                $regularUser->roles()->attach($createTaskRole);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
