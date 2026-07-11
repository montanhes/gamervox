<?php

namespace Tests\Feature\User;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_view_a_public_profile_with_stats_and_games(): void
    {
        $user = User::factory()->create();
        Game::factory()->count(2)->for($user)->create(['status' => GameStatus::Approved]);
        Game::factory()->for($user)->create(['status' => GameStatus::Pending]);

        $response = $this->getJson("/api/users/{$user->username}");

        $response->assertOk();
        $response->assertJsonPath('data.name', $user->name);
        $response->assertJsonPath('data.stats.games_count', 2);
        $this->assertCount(2, $response->json('data.games'));
    }

    public function test_profile_does_not_leak_email(): void
    {
        $user = User::factory()->create();

        $response = $this->getJson("/api/users/{$user->username}");

        $response->assertOk();
        $this->assertArrayNotHasKey('email', $response->json('data'));
    }

    public function test_badges_are_computed_from_activity(): void
    {
        $user = User::factory()->create();
        Game::factory()->count(5)->for($user)->create(['status' => GameStatus::Approved]);
        Game::factory()->for($user)->create(['status' => GameStatus::Approved, 'net_score' => 60]);

        $response = $this->getJson("/api/users/{$user->username}");

        $response->assertOk();
        $badges = $response->json('data.badges');
        $this->assertContains('pioneer', $badges);
        $this->assertContains('collector', $badges);
        $this->assertContains('curator', $badges);
        $this->assertNotContains('active_voice', $badges);
    }
}
