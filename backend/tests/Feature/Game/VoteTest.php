<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_cast_a_yes_vote(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/vote", ['value' => 1]);

        $response->assertOk();
        $response->assertJson(['yes_votes_count' => 1, 'no_votes_count' => 0, 'net_score' => 1]);

        $this->assertDatabaseHas('votes', ['user_id' => $user->id, 'game_id' => $game->id, 'value' => 1]);
    }

    public function test_user_cannot_cast_two_separate_votes_for_the_same_game(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->actingAs($user)->postJson("/api/games/{$game->slug}/vote", ['value' => 1]);
        $this->actingAs($user)->postJson("/api/games/{$game->slug}/vote", ['value' => 1]);

        $this->assertSame(1, Vote::where('user_id', $user->id)->where('game_id', $game->id)->count());
        $this->assertSame(1, $game->refresh()->yes_votes_count);
    }

    public function test_switching_vote_from_yes_to_no_adjusts_counters_correctly(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->actingAs($user)->postJson("/api/games/{$game->slug}/vote", ['value' => 1]);
        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/vote", ['value' => -1]);

        $response->assertJson(['yes_votes_count' => 0, 'no_votes_count' => 1, 'net_score' => -1]);
    }

    public function test_removing_a_vote_decrements_counters(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->actingAs($user)->postJson("/api/games/{$game->slug}/vote", ['value' => 1]);
        $response = $this->actingAs($user)->deleteJson("/api/games/{$game->slug}/vote");

        $response->assertJson(['yes_votes_count' => 0, 'no_votes_count' => 0, 'net_score' => 0]);
        $this->assertDatabaseCount('votes', 0);
    }

    public function test_net_score_reflects_multiple_users_voting(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);
        $voters = User::factory()->count(3)->create();

        foreach ($voters as $i => $voter) {
            $this->actingAs($voter)->postJson("/api/games/{$game->slug}/vote", ['value' => $i === 0 ? -1 : 1]);
        }

        $game->refresh();
        $this->assertSame(2, $game->yes_votes_count);
        $this->assertSame(1, $game->no_votes_count);
        $this->assertSame(1, $game->net_score);
    }

    public function test_guest_cannot_vote(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->postJson("/api/games/{$game->slug}/vote", ['value' => 1])->assertUnauthorized();
    }
}
