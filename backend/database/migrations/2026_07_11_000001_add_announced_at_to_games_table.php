<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            // Marcado manualmente quando a IP ganha remake/retorno anunciado de verdade.
            $table->timestamp('announced_at')->nullable()->after('moderation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn('announced_at');
        });
    }
};
