<?php

namespace Tests\Feature\Game;

use App\Jobs\ModerateGameJob;
use App\Models\Game;
use App\Services\Moderation\ModerationResult;
use App\Services\Moderation\ModerationServiceException;
use App\Services\Moderation\ModerationServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ModerateGameJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_approves_game_when_moderation_passes(): void
    {
        $game = Game::factory()->create(['status' => 'pending']);

        $this->mockModerationService(new ModerationResult(approved: true, reason: 'Tudo certo.'));

        (new ModerateGameJob($game))->handle($this->app->make(ModerationServiceInterface::class));

        $game->refresh();
        $this->assertSame('approved', $game->status);
        $this->assertSame('Tudo certo.', $game->moderation_reason);
    }

    public function test_handle_rejects_game_when_moderation_fails_criteria(): void
    {
        $game = Game::factory()->create(['status' => 'pending']);

        $this->mockModerationService(new ModerationResult(approved: false, reason: 'Conteúdo fora do tema.'));

        (new ModerateGameJob($game))->handle($this->app->make(ModerationServiceInterface::class));

        $game->refresh();
        $this->assertSame('rejected', $game->status);
        $this->assertSame('Conteúdo fora do tema.', $game->moderation_reason);
    }

    public function test_failed_keeps_game_pending_and_increments_attempts(): void
    {
        $game = Game::factory()->create(['status' => 'pending', 'moderation_attempts' => 0]);

        $job = new ModerateGameJob($game);
        $job->failed(new ModerationServiceException('API fora do ar'));

        $game->refresh();
        $this->assertSame('pending', $game->status);
        $this->assertSame(1, $game->moderation_attempts);
    }

    private function mockModerationService(ModerationResult $result): void
    {
        $mock = Mockery::mock(ModerationServiceInterface::class);
        $mock->shouldReceive('moderateGame')->once()->andReturn($result);

        $this->app->instance(ModerationServiceInterface::class, $mock);
    }
}
