<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminGameModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_override_game_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $game = Game::factory()->create(['status' => GameStatus::Pending]);

        $response = $this->actingAs($admin)->patchJson("/api/admin/games/{$game->id}/moderate", [
            'status' => 'approved',
            'reason' => 'Aprovado manualmente após falha da IA.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('games', [
            'id' => $game->id,
            'status' => GameStatus::Approved,
            'moderation_reason' => 'Aprovado manualmente após falha da IA.',
        ]);
    }

    public function test_non_admin_cannot_override_game_status(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $game = Game::factory()->create(['status' => GameStatus::Pending]);

        $this->actingAs($user)
            ->patchJson("/api/admin/games/{$game->id}/moderate", ['status' => 'approved'])
            ->assertForbidden();
    }

    public function test_guest_cannot_override_game_status(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Pending]);

        $this->patchJson("/api/admin/games/{$game->id}/moderate", ['status' => 'approved'])
            ->assertUnauthorized();
    }
}
