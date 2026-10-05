<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', UserRole::Admin->value)->first();
        $userRole = Role::where('name', UserRole::User->value)->first();

        // 1. Primary Administrator
        User::firstOrCreate(
            ['email' => 'admin@taskflow.dev'],
            [
                'name' => 'Alexander Vance',
                'password' => Hash::make('Password123!'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]
        );

        // 2. Primary Standard Demo User
        User::firstOrCreate(
            ['email' => 'demo@taskflow.dev'],
            [
                'name' => 'Elena Rostova',
                'password' => Hash::make('Password123!'),
                'role_id' => $userRole->id,
                'email_verified_at' => now(),
            ]
        );

        // 3. Secondary Standard User (for cross-user isolation verification)
        User::firstOrCreate(
            ['email' => 'sarah@taskflow.dev'],
            [
                'name' => 'Sarah Chen',
                'password' => Hash::make('Password123!'),
                'role_id' => $userRole->id,
                'email_verified_at' => now(),
            ]
        );
    }
}
