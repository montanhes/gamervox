<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameFollowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_follow_and_unfollow_a_game(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/follow");
        $response->assertOk();
        $response->assertJson(['following' => true, 'followers_count' => 1]);

        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/follow");
        $response->assertOk();
        $response->assertJson(['following' => false, 'followers_count' => 0]);
    }

    public function test_game_detail_exposes_followed_by_me(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->actingAs($user)->postJson("/api/games/{$game->slug}/follow")->assertOk();

        $response = $this->actingAs($user)->getJson("/api/games/{$game->slug}");
        $response->assertOk();
        $response->assertJsonPath('data.followed_by_me', true);
        $response->assertJsonPath('data.followers_count', 1);
    }

    public function test_user_can_list_followed_games(): void
    {
        $user = User::factory()->create();
        $followed = Game::factory()->create(['status' => GameStatus::Approved]);
        Game::factory()->create(['status' => GameStatus::Approved]);

        $this->actingAs($user)->postJson("/api/games/{$followed->slug}/follow")->assertOk();

        $response = $this->actingAs($user)->getJson('/api/me/following');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame($followed->slug, $response->json('data.0.slug'));
    }

    public function test_guest_cannot_follow_a_game(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->postJson("/api/games/{$game->slug}/follow")->assertUnauthorized();
    }
}
