<?php

namespace App\Http\Controllers;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Services\OgImageService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ShareController extends Controller
{
    public function __construct(
        private readonly OgImageService $ogImageService,
    ) {}

    public function game(string $slug): View
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        return view('share.game', [
            'game' => $game,
            'frontendUrl' => rtrim(config('app.frontend_url'), '/')."/games/{$game->slug}",
            'ogImageUrl' => route('share.og', ['slug' => $game->slug]),
            'description' => Str::limit($game->description, 160),
        ]);
    }

    public function ogImage(string $slug): Response
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        $path = $this->ogImageService->generate($game);

        return response(Storage::disk('public')->get($path), 200, [
            'Content-Type' => 'image/jpeg',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
