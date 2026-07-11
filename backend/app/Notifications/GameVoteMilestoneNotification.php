<?php

namespace App\Notifications;

use App\Models\Game;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GameVoteMilestoneNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Game $game,
        public readonly int $milestone,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => 'vote_milestone',
            'slug' => $this->game->slug,
            'title' => $this->game->title,
            'milestone' => $this->milestone,
        ];
    }
}
