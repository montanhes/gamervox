<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGameRequest;
use App\Http\Resources\GameDetailResource;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Services\GameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GameController extends Controller
{
    public function __construct(
        private readonly GameService $gameService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $games = Game::query()
            ->where('status', 'approved')
            ->with('tags')
            ->when($request->string('search')->trim()->isNotEmpty(), function ($query) use ($request) {
                $query->whereFullText(['title', 'description'], $request->string('search')->toString());
            })
            ->when($request->filled('tags'), function ($query) use ($request) {
                $query->whereHas('tags', fn ($q) => $q->whereIn('slug', (array) $request->input('tags')));
            })
            ->orderByDesc('net_score')
            ->orderByDesc('id')
            ->cursorPaginate(20);

        return GameResource::collection($games);
    }

    public function store(StoreGameRequest $request): GameDetailResource|JsonResponse
    {
        $data = $request->validated();

        if (empty($data['confirm_duplicate'])) {
            $similar = $this->gameService->findSimilar($data['title']);

            if ($similar->isNotEmpty()) {
                return response()->json([
                    'similar_games' => GameResource::collection($similar),
                ], 409);
            }
        }

        $game = $this->gameService->create($request->user(), $data, $request->file('image'));

        return new GameDetailResource($game->load(['tags', 'socialLinks', 'user']));
    }

    public function show(Request $request, string $slug): GameDetailResource
    {
        $game = Game::where('slug', $slug)->with(['tags', 'socialLinks', 'user'])->firstOrFail();

        if ($game->status !== 'approved' && $game->user_id !== $request->user()?->id) {
            throw new NotFoundHttpException;
        }

        return new GameDetailResource($game);
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        $games = Game::where('user_id', $request->user()->id)
            ->with(['tags', 'socialLinks'])
            ->orderByDesc('id')
            ->paginate(20);

        return GameDetailResource::collection($games);
    }
}
