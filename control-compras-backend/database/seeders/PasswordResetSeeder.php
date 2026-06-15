<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PasswordResetSeeder extends Seeder
{
    public function run(): void
    {
        $u = User::where('email', 'admin@cooperativa.com')->first();
        if ($u) {
            $u->password = Hash::make('Admin2026!');
            $u->save();
        }
    }
}
