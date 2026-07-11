<?php

namespace Tests\Feature\Cup;

use App\Enums\CupStatus;
use App\Enums\GameStatus;
use App\Models\Cup;
use App\Models\Game;
use App\Models\User;
use App\Services\CupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CupTest extends TestCase
{
    use RefreshDatabase;

    private function startCup(int $size = 4): Cup
    {
        Game::factory()->count($size)->sequence(fn ($sequence) => [
            'status' => GameStatus::Approved,
            'net_score' => 100 - $sequence->index,
        ])->create();

        return app(CupService::class)->start('Copa dos Remakes', $size, 3);
    }

    public function test_cup_start_builds_seeded_bracket(): void
    {
        $cup = $this->startCup(4);

        $this->assertSame(2, $cup->total_rounds);
        $this->assertCount(2, $cup->matches);

        // Seeding: 1º enfrenta 4º, 2º enfrenta 3º.
        $first = $cup->matches->firstWhere('position', 1);
        $this->assertSame(100, Game::find($first->game_a_id)->net_score);
        $this->assertSame(97, Game::find($first->game_b_id)->net_score);
    }

    public function test_cup_start_fails_with_insufficient_games(): void
    {
        Game::factory()->count(2)->create(['status' => GameStatus::Approved]);

        $this->expectException(\RuntimeException::class);
        app(CupService::class)->start('Copa', 4, 3);
    }

    public function test_user_can_vote_on_current_round_match(): void
    {
        $cup = $this->startCup(4);
        $match = $cup->matches->firstWhere('position', 1);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson("/api/cup/matches/{$match->id}/vote", [
            'game_id' => $match->game_b_id,
        ]);

        $response->assertOk();
        $response->assertJson(['my_vote' => $match->game_b_id, 'votes_a' => 0, 'votes_b' => 1]);

        // Revotar troca o voto, não duplica.
        $this->actingAs($user)->postJson("/api/cup/matches/{$match->id}/vote", [
            'game_id' => $match->game_a_id,
        ])->assertJson(['votes_a' => 1, 'votes_b' => 0]);
    }

    public function test_vote_rejects_game_outside_match(): void
    {
        $cup = $this->startCup(4);
        $match = $cup->matches->firstWhere('position', 1);
        $other = $cup->matches->firstWhere('position', 2);
        $user = User::factory()->create();

        $this->actingAs($user)->postJson("/api/cup/matches/{$match->id}/vote", [
            'game_id' => $other->game_a_id,
        ])->assertUnprocessable();
    }

    public function test_advance_resolves_winners_and_builds_next_round(): void
    {
        $cup = $this->startCup(4);
        $match = $cup->matches->firstWhere('position', 1);
        $user = User::factory()->create();

        // Voto no azarão da partida 1.
        $this->actingAs($user)->postJson("/api/cup/matches/{$match->id}/vote", [
            'game_id' => $match->game_b_id,
        ])->assertOk();

        app(CupService::class)->advance($cup, force: true);
        $cup->refresh();

        $this->assertSame(2, $cup->current_round);
        $final = $cup->matches()->where('round', 2)->first();
        $this->assertSame($match->game_b_id, $final->game_a_id);

        // Partida 2 sem votos: empate decidido pelo net_score (game_a, 2º seed).
        $second = $cup->matches()->where('round', 1)->where('position', 2)->first();
        $this->assertSame($second->game_a_id, $second->winner_id);
        $this->assertSame($second->game_a_id, $final->game_b_id);
    }

    public function test_advance_on_final_round_finishes_cup(): void
    {
        $cup = $this->startCup(4);
        $service = app(CupService::class);

        $service->advance($cup, force: true);
        $service->advance($cup->refresh(), force: true);

        $this->assertSame(CupStatus::Finished, $cup->refresh()->status);
        $this->assertNotNull($cup->matches()->where('round', 2)->first()->winner_id);
    }

    public function test_cup_endpoint_returns_bracket_with_my_votes(): void
    {
        $cup = $this->startCup(4);
        $match = $cup->matches->firstWhere('position', 1);
        $user = User::factory()->create();

        $this->actingAs($user)->postJson("/api/cup/matches/{$match->id}/vote", [
            'game_id' => $match->game_a_id,
        ])->assertOk();

        $response = $this->actingAs($user)->getJson('/api/cup');
        $response->assertOk();
        $response->assertJsonPath('data.name', 'Copa dos Remakes');
        $response->assertJsonPath('data.matches.0.my_vote', $match->game_a_id);
        $response->assertJsonPath('data.matches.0.game_a.votes', 1);
    }

    public function test_cup_endpoint_returns_null_without_cups(): void
    {
        $this->getJson('/api/cup')->assertOk()->assertJson(['data' => null]);
    }
}
