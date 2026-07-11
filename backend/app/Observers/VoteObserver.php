<?php

namespace App\Observers;

use App\Models\Game;
use App\Models\Vote;
use App\Notifications\GameVoteMilestoneNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class VoteObserver
{
    private const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 5000, 10000];

    public function created(Vote $vote): void
    {
        $this->adjustCounters($vote->game_id, yesDelta: $vote->value === 1 ? 1 : 0, noDelta: $vote->value === -1 ? 1 : 0);
    }

    public function updated(Vote $vote): void
    {
        if (! $vote->wasChanged('value')) {
            return;
        }

        $previous = (int) $vote->getOriginal('value');
        $current = $vote->value;

        $this->adjustCounters(
            $vote->game_id,
            yesDelta: ($current === 1 ? 1 : 0) - ($previous === 1 ? 1 : 0),
            noDelta: ($current === -1 ? 1 : 0) - ($previous === -1 ? 1 : 0),
        );
    }

    public function deleted(Vote $vote): void
    {
        $this->adjustCounters($vote->game_id, yesDelta: $vote->value === 1 ? -1 : 0, noDelta: $vote->value === -1 ? -1 : 0);
    }

    /**
     * Atomically adjusts the cached vote counters on the game row.
     * net_score delta is always (yesDelta - noDelta), since each yes is +1 and each no is -1.
     */
    private function adjustCounters(int $gameId, int $yesDelta, int $noDelta): void
    {
        if ($yesDelta === 0 && $noDelta === 0) {
            return;
        }

        Game::whereKey($gameId)->update([
            'yes_votes_count' => DB::raw("yes_votes_count + ({$yesDelta})"),
            'no_votes_count' => DB::raw("no_votes_count + ({$noDelta})"),
            'net_score' => DB::raw('net_score + ('.($yesDelta - $noDelta).')'),
        ]);

        $this->notifyMilestone($gameId, netDelta: $yesDelta - $noDelta);
    }

    /**
     * Notifica dono e seguidores quando o saldo cruza um marco pra cima.
     */
    private function notifyMilestone(int $gameId, int $netDelta): void
    {
        if ($netDelta <= 0) {
            return;
        }

        $game = Game::with('user')->find($gameId);

        if ($game === null) {
            return;
        }

        $current = $game->net_score;
        $previous = $current - $netDelta;

        foreach (self::MILESTONES as $milestone) {
            if ($previous < $milestone && $current >= $milestone) {
                $followers = $game->followers()->with('user')->get()->pluck('user');
                $recipients = $followers->push($game->user)->filter()->unique('id');

                Notification::send($recipients, new GameVoteMilestoneNotification($game, $milestone));
            }
        }
    }
}
