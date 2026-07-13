<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\GameStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateGameRequest;
use App\Http\Resources\AdminGameResource;
use App\Http\Resources\GameDetailResource;
use App\Models\Game;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GameModerationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $games = Game::query()
            ->where(function ($query) {
                $query->where('status', GameStatus::Pending)
                    ->orWhere(function ($query) {
                        $query->where('status', GameStatus::Rejected)
                            ->whereNotNull('manual_review_requested_at');
                    });
            })
            ->with(['tags', 'user'])
            ->orderBy('created_at')
            ->paginate(20);

        return AdminGameResource::collection($games);
    }

    public function update(ModerateGameRequest $request, Game $game): GameDetailResource
    {
        $game->update([
            'status' => GameStatus::fromLabel($request->validated('status')),
            'moderation_reason' => $request->validated('reason'),
            'manual_review_requested_at' => null,
        ]);

        return new GameDetailResource($game);
    }
}
