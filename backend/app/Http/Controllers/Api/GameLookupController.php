<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Lookup\GameLookupServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class GameLookupController extends Controller
{
    public function __construct(
        private readonly GameLookupServiceInterface $lookupService,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $query = $request->string('search')->trim()->toString();

        if (mb_strlen($query) < 3) {
            return response()->json(['data' => []]);
        }

        return response()->json(['data' => $this->lookupService->search($query)]);
    }

    public function show(int $id): JsonResponse
    {
        $game = $this->lookupService->find($id);

        abort_if($game === null, 404);

        return response()->json(['data' => $game]);
    }

    /**
     * Proxy da capa sugerida: o browser não consegue baixar direto da CDN
     * e transformar em File por causa de CORS.
     */
    public function image(Request $request): Response
    {
        $url = $request->string('url')->toString();
        $host = parse_url($url, PHP_URL_HOST);

        abort_unless(
            in_array($host, ['media.rawg.io'], true) && str_starts_with($url, 'https://'),
            422,
        );

        $response = Http::timeout(10)->get($url);

        abort_unless($response->successful(), 404);

        return response($response->body(), 200, [
            'Content-Type' => $response->header('Content-Type') ?: 'image/jpeg',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
