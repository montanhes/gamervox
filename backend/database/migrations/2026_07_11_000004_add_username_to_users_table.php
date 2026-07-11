<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 30)->nullable()->unique()->after('name');
        });

        // Backfill: gera username a partir do nome pros usuários existentes.
        $taken = [];
        DB::table('users')->orderBy('id')->each(function ($user) use (&$taken) {
            $base = Str::slug($user->name) ?: 'player';
            $base = Str::limit($base, 24, '');

            $username = $base;
            $suffix = 2;
            while (in_array($username, $taken, true) || DB::table('users')->where('username', $username)->exists()) {
                $username = "{$base}-{$suffix}";
                $suffix++;
            }

            $taken[] = $username;
            DB::table('users')->where('id', $user->id)->update(['username' => $username]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 30)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
