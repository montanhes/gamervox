<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Models\Comment;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_comments_of_an_approved_game(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);
        Comment::factory()->count(2)->for($game)->create();

        $response = $this->getJson("/api/games/{$game->slug}/comments");

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_authenticated_user_can_post_a_comment_without_moderation(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        // Comentários publicam direto, sem moderação por IA (decisão de produto:
        // Gemini modera somente jogos).
        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/comments", [
            'body' => 'Que jogo incrível, merece um remake!',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('comments', ['game_id' => $game->id, 'user_id' => $user->id]);
    }

    public function test_guest_cannot_post_comment(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->postJson("/api/games/{$game->slug}/comments", ['body' => 'oi'])->assertUnauthorized();
    }
}
