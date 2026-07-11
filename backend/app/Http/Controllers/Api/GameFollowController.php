<?php

namespace App\Http\Controllers\Api;

use App\Enums\GameStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GameFollowController extends Controller
{
    public function toggle(Request $request, string $slug): JsonResponse
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();
        $userId = $request->user()->id;

        $following = DB::transaction(function () use ($game, $userId) {
            $deleted = $game->followers()->where('user_id', $userId)->delete();

            if ($deleted > 0) {
                Game::where('id', $game->id)
                    ->where('followers_count', '>', 0)
                    ->decrement('followers_count');

                return false;
            }

            $game->followers()->create(['user_id' => $userId]);
            Game::where('id', $game->id)->increment('followers_count');

            return true;
        });

        return response()->json([
            'following' => $following,
            'followers_count' => $game->fresh()->followers_count,
        ]);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $games = Game::query()
            ->where('status', GameStatus::Approved)
            ->whereHas('followers', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('tags')
            ->orderByDesc('net_score')
            ->orderByDesc('id')
            ->cursorPaginate(20);

        return GameResource::collection($games);
    }
}
