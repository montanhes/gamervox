<?php

namespace App\Services;

use App\Models\Game;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Support\Facades\DB;

class VoteService
{
    public function castVote(User $user, Game $game, int $value): Vote
    {
        return DB::transaction(function () use ($user, $game, $value) {
            $vote = Vote::lockForUpdate()
                ->firstOrNew([
                    'user_id' => $user->id,
                    'game_id' => $game->id,
                ]);

            $vote->value = $value;
            $vote->save();

            return $vote;
        });
    }

    public function removeVote(User $user, Game $game): void
    {
        Vote::where('user_id', $user->id)->where('game_id', $game->id)->first()?->delete();
    }
}
