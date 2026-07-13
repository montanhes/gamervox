<?php

namespace App\Http\Controllers\Api;

use App\Enums\GameStatus;
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
        $sort = $request->input('sort', 'top');

        $query = Game::query()
            ->where('status', GameStatus::Approved)
            ->with('tags')
            ->when($request->string('search')->trim()->isNotEmpty(), function ($query) use ($request) {
                $query->whereFullText(['title', 'description'], $request->string('search')->toString());
            })
            ->when($request->filled('tags'), function ($query) use ($request) {
                $query->whereHas('tags', fn ($q) => $q->whereIn('slug', (array) $request->input('tags')));
            })
            ->when($request->boolean('announced'), fn ($query) => $query->whereNotNull('announced_at'));

        if ($sort === 'trending') {
            // Saldo de votos dos últimos 7 dias. Agregado não entra em cursor
            // pagination, então "em alta" é uma vitrine de tamanho fixo.
            $games = $query
                ->withSum(['votes as trending_score' => fn ($q) => $q->where('created_at', '>=', now()->subDays(7))], 'value')
                ->orderByDesc('trending_score')
                ->orderByDesc('net_score')
                ->limit(24)
                ->get();

            return GameResource::collection($games)->additional(['meta' => ['next_cursor' => null]]);
        }

        if ($sort === 'recent') {
            $query->orderByDesc('id');
        } else {
            $query->orderByDesc('net_score')->orderByDesc('id');
        }

        return GameResource::collection($query->cursorPaginate(20));
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
        $game = Game::where('slug', $slug)
            ->with(['tags', 'socialLinks', 'user'])
            ->withExists(['followers as followed_by_me' => fn ($query) => $query->where('user_id', $request->user('sanctum')?->id ?? 0)])
            ->firstOrFail();

        if ($game->status !== GameStatus::Approved && $game->user_id !== $request->user()?->id) {
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

    public function requestReview(Request $request, string $slug): GameDetailResource
    {
        $game = Game::where('slug', $slug)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        abort_if($game->status !== GameStatus::Rejected, 422, 'Só é possível pedir revisão de jogos rejeitados.');

        if ($game->manual_review_requested_at === null) {
            $game->update(['manual_review_requested_at' => now()]);
        }

        return new GameDetailResource($game->load(['tags', 'socialLinks', 'user']));
    }
}
