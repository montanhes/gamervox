<?php

namespace App\Jobs;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Notifications\GameModeratedNotification;
use App\Services\Moderation\ModerationServiceInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class ModerateGameJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public readonly Game $game,
    ) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 30, 90];
    }

    public function handle(ModerationServiceInterface $moderationService): void
    {
        $this->game->loadMissing('tags');

        $result = $moderationService->moderateGame($this->game);

        $this->game->update([
            'status' => $result->approved ? GameStatus::Approved : GameStatus::Rejected,
            'moderation_reason' => $result->reason,
        ]);

        $this->game->user->notify(new GameModeratedNotification($this->game->fresh()));
    }

    public function failed(Throwable $exception): void
    {
        $this->game->increment('moderation_attempts');

        Log::error('Falha ao moderar jogo via Gemini após esgotar tentativas.', [
            'game_id' => $this->game->id,
            'exception' => $exception->getMessage(),
        ]);
    }
}
