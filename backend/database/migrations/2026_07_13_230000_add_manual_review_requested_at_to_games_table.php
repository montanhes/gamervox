<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            // Setado quando o dono pede revisão manual de um jogo rejeitado pela IA.
            $table->timestamp('manual_review_requested_at')->nullable()->after('moderation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn('manual_review_requested_at');
        });
    }
};
