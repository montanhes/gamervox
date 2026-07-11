<?php

namespace App\Http\Controllers\Api;

use App\Enums\CupStatus;
use App\Http\Controllers\Controller;
use App\Models\Cup;
use App\Models\CupMatch;
use App\Models\CupVote;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CupController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cup = Cup::where('status', CupStatus::Active)->latest('id')->first()
            ?? Cup::where('status', CupStatus::Finished)->latest('id')->first();

        if ($cup === null) {
            return response()->json(['data' => null]);
        }

        $matches = $cup->matches()
            ->with(['gameA:id,slug,title,image_path', 'gameB:id,slug,title,image_path'])
            ->orderBy('round')
            ->orderBy('position')
            ->get();

        $userId = $request->user('sanctum')?->id;

        $counts = CupVote::whereIn('cup_match_id', $matches->pluck('id'))
            ->selectRaw('cup_match_id, game_id, count(*) as total')
            ->groupBy('cup_match_id', 'game_id')
            ->get()
            ->groupBy('cup_match_id');

        $myVotes = $userId
            ? CupVote::whereIn('cup_match_id', $matches->pluck('id'))
                ->where('user_id', $userId)
                ->pluck('game_id', 'cup_match_id')
            : collect();

        return response()->json([
            'data' => [
                'id' => $cup->id,
                'name' => $cup->name,
                'status' => $cup->status->label(),
                'current_round' => $cup->current_round,
                'total_rounds' => $cup->total_rounds,
                'round_ends_at' => $cup->round_ends_at,
                'matches' => $matches->map(function (CupMatch $match) use ($counts, $myVotes) {
                    $matchCounts = $counts->get($match->id, collect());

                    return [
                        'id' => $match->id,
                        'round' => $match->round,
                        'position' => $match->position,
                        'winner_id' => $match->winner_id,
                        'my_vote' => $myVotes->get($match->id),
                        'game_a' => $this->gamePayload($match->gameA, $matchCounts),
                        'game_b' => $this->gamePayload($match->gameB, $matchCounts),
                    ];
                }),
            ],
        ]);
    }

    public function vote(Request $request, CupMatch $match): JsonResponse
    {
        $validated = $request->validate(['game_id' => ['required', 'integer']]);
        $gameId = (int) $validated['game_id'];

        $cup = $match->cup;

        if (
            $cup->status !== CupStatus::Active
            || $match->round !== $cup->current_round
            || $match->winner_id !== null
        ) {
            throw ValidationException::withMessages(['game_id' => [__('cup.match_closed')]]);
        }

        if (! in_array($gameId, [$match->game_a_id, $match->game_b_id], true)) {
            throw ValidationException::withMessages(['game_id' => [__('cup.invalid_game')]]);
        }

        CupVote::updateOrCreate(
            ['cup_match_id' => $match->id, 'user_id' => $request->user()->id],
            ['game_id' => $gameId],
        );

        $counts = $match->votes()
            ->selectRaw('game_id, count(*) as total')
            ->groupBy('game_id')
            ->pluck('total', 'game_id');

        return response()->json([
            'my_vote' => $gameId,
            'votes_a' => (int) $counts->get($match->game_a_id, 0),
            'votes_b' => (int) $counts->get($match->game_b_id, 0),
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, object>  $matchCounts
     * @return array<string, mixed>|null
     */
    private function gamePayload(?Game $game, $matchCounts): ?array
    {
        if ($game === null) {
            return null;
        }

        return [
            'id' => $game->id,
            'slug' => $game->slug,
            'title' => $game->title,
            'image_url' => $game->image_path ? Storage::disk('public')->url($game->image_path) : null,
            'votes' => (int) ($matchCounts->firstWhere('game_id', $game->id)->total ?? 0),
        ];
    }
}
