<?php

namespace App\Http\Controllers\Api;

use App\Enums\GameStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CastVoteRequest;
use App\Models\Game;
use App\Services\VoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    public function __construct(
        private readonly VoteService $voteService,
    ) {}

    public function store(CastVoteRequest $request, string $slug): JsonResponse
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        $this->voteService->castVote($request->user(), $game, $request->integer('value'));

        $game->refresh();

        return response()->json([
            'yes_votes_count' => $game->yes_votes_count,
            'no_votes_count' => $game->no_votes_count,
            'net_score' => $game->net_score,
        ]);
    }

    public function destroy(Request $request, string $slug): JsonResponse
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        $this->voteService->removeVote($request->user(), $game);

        $game->refresh();

        return response()->json([
            'yes_votes_count' => $game->yes_votes_count,
            'no_votes_count' => $game->no_votes_count,
            'net_score' => $game->net_score,
        ]);
    }
}
