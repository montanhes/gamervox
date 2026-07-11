<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Models\Comment;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentLikeTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_like_and_unlike_a_comment(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);
        $comment = Comment::factory()->for($game)->create();

        $response = $this->actingAs($user)->postJson("/api/comments/{$comment->id}/like");
        $response->assertOk();
        $response->assertJson(['liked' => true, 'likes_count' => 1]);
        $this->assertDatabaseHas('comment_likes', ['user_id' => $user->id, 'comment_id' => $comment->id]);

        $response = $this->actingAs($user)->postJson("/api/comments/{$comment->id}/like");
        $response->assertOk();
        $response->assertJson(['liked' => false, 'likes_count' => 0]);
        $this->assertDatabaseMissing('comment_likes', ['user_id' => $user->id, 'comment_id' => $comment->id]);
    }

    public function test_comment_listing_includes_likes_count_and_liked_by_me(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);
        $comment = Comment::factory()->for($game)->create();

        $this->actingAs($user)->postJson("/api/comments/{$comment->id}/like")->assertOk();

        $response = $this->actingAs($user)->getJson("/api/games/{$game->slug}/comments");
        $response->assertOk();
        $response->assertJsonPath('data.0.likes_count', 1);
        $response->assertJsonPath('data.0.liked_by_me', true);

        $other = User::factory()->create();
        $response = $this->actingAs($other)->getJson("/api/games/{$game->slug}/comments");
        $response->assertJsonPath('data.0.likes_count', 1);
        $response->assertJsonPath('data.0.liked_by_me', false);
    }

    public function test_guest_cannot_like_a_comment(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);
        $comment = Comment::factory()->for($game)->create();

        $this->postJson("/api/comments/{$comment->id}/like")->assertUnauthorized();
    }
}
