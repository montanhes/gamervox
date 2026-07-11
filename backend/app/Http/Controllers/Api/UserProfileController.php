<?php

namespace App\Http\Controllers\Api;

use App\Enums\GameStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;

class UserProfileController extends Controller
{
    private const PIONEER_MAX_ID = 100;

    private const COLLECTOR_MIN_GAMES = 5;

    private const CURATOR_MIN_NET_SCORE = 50;

    private const ACTIVE_VOICE_MIN_VOTES = 100;

    public function show(User $user): JsonResponse
    {
        $approvedGames = Game::query()
            ->where('user_id', $user->id)
            ->where('status', GameStatus::Approved);

        $gamesCount = (clone $approvedGames)->count();
        $votesCount = Vote::where('user_id', $user->id)->count();
        $bestNetScore = (int) (clone $approvedGames)->max('net_score');

        $games = (clone $approvedGames)
            ->with('tags')
            ->orderByDesc('net_score')
            ->limit(12)
            ->get();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at,
                'stats' => [
                    'games_count' => $gamesCount,
                    'votes_count' => $votesCount,
                ],
                'badges' => $this->badges($user, $gamesCount, $votesCount, $bestNetScore),
                'games' => GameResource::collection($games),
            ],
        ]);
    }

    /**
     * @return list<string>
     */
    private function badges(User $user, int $gamesCount, int $votesCount, int $bestNetScore): array
    {
        return array_values(array_filter([
            $user->id <= self::PIONEER_MAX_ID ? 'pioneer' : null,
            $gamesCount >= self::COLLECTOR_MIN_GAMES ? 'collector' : null,
            $bestNetScore >= self::CURATOR_MIN_NET_SCORE ? 'curator' : null,
            $votesCount >= self::ACTIVE_VOICE_MIN_VOTES ? 'active_voice' : null,
        ]));
    }
}
