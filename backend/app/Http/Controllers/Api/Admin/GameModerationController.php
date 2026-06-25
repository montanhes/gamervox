<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateGameRequest;
use App\Http\Resources\GameDetailResource;
use App\Models\Game;

class GameModerationController extends Controller
{
    public function update(ModerateGameRequest $request, Game $game): GameDetailResource
    {
        $game->update([
            'status' => $request->validated('status'),
            'moderation_reason' => $request->validated('reason'),
        ]);

        return new GameDetailResource($game);
    }
}
