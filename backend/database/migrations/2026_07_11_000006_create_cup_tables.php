<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->tinyInteger('status')->default(0); // 0 = active, 1 = finished
            $table->unsignedTinyInteger('size');
            $table->unsignedTinyInteger('current_round')->default(1);
            $table->unsignedTinyInteger('total_rounds');
            $table->unsignedTinyInteger('round_days');
            $table->timestamp('round_ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cup_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cup_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('round');
            $table->unsignedTinyInteger('position');
            $table->foreignId('game_a_id')->nullable()->constrained('games')->nullOnDelete();
            $table->foreignId('game_b_id')->nullable()->constrained('games')->nullOnDelete();
            $table->foreignId('winner_id')->nullable()->constrained('games')->nullOnDelete();
            $table->timestamps();

            $table->unique(['cup_id', 'round', 'position']);
        });

        Schema::create('cup_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cup_match_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['cup_match_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cup_votes');
        Schema::dropIfExists('cup_matches');
        Schema::dropIfExists('cups');
    }
};
