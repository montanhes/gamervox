<?php

namespace App\Services\Lookup;

use Illuminate\Support\Facades\Http;

class RawgGameLookupService implements GameLookupServiceInterface
{
    private const BASE_URL = 'https://api.rawg.io/api';

    public function search(string $query): array
    {
        $key = config('services.rawg.key');

        if (! $key) {
            return [];
        }

        $response = Http::timeout(5)
            ->retry(2, 200, throw: false)
            ->get(self::BASE_URL.'/games', [
                'key' => $key,
                'search' => $query,
                'page_size' => 5,
            ]);

        if (! $response->successful()) {
            return [];
        }

        return collect($response->json('results', []))
            ->map(fn (array $game) => [
                'id' => (int) $game['id'],
                'name' => (string) $game['name'],
                'released' => $game['released'] ?? null,
                'image_url' => $game['background_image'] ?? null,
            ])
            ->values()
            ->all();
    }

    public function find(int $id): ?array
    {
        $key = config('services.rawg.key');

        if (! $key) {
            return null;
        }

        $response = Http::timeout(5)
            ->retry(2, 200, throw: false)
            ->get(self::BASE_URL."/games/{$id}", ['key' => $key]);

        if (! $response->successful()) {
            return null;
        }

        return [
            'id' => (int) $response->json('id'),
            'name' => (string) $response->json('name'),
            'description' => $response->json('description_raw'),
            'released' => $response->json('released'),
            'image_url' => $response->json('background_image'),
        ];
    }
}
