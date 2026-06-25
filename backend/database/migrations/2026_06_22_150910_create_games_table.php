<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 160);
            $table->string('slug', 180)->unique();
            $table->text('description');
            $table->string('image_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('moderation_reason')->nullable();
            $table->unsignedInteger('yes_votes_count')->default(0);
            $table->unsignedInteger('no_votes_count')->default(0);
            $table->integer('net_score')->default(0);
            $table->unsignedTinyInteger('moderation_attempts')->default(0);
            $table->timestamps();

            $table->index(['status', 'net_score']);
            $table->fulltext(['title', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
