<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class UsernameService
{
    /**
     * Gera username único a partir do nome (slug); nomes sem caracteres
     * latinos (ex.: CJK) caem no prefixo padrão "player".
     */
    public function generate(string $name): string
    {
        $base = Str::slug($name) ?: 'player';
        $base = Str::limit($base, 24, '');

        $username = $base;
        $suffix = 2;

        while (User::where('username', $username)->exists()) {
            $username = "{$base}-{$suffix}";
            $suffix++;
        }

        return $username;
    }
}
