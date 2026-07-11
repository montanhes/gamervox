<?php

namespace Tests\Feature\Game;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GameLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_proxies_rawg_results(): void
    {
        Config::set('services.rawg.key', 'test-key');
        Http::fake([
            'api.rawg.io/api/games*' => Http::response([
                'results' => [
                    ['id' => 123, 'name' => 'Dino Crisis', 'released' => '1999-07-01', 'background_image' => 'https://media.rawg.io/dino.jpg'],
                ],
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/game-lookup?search=dino');

        $response->assertOk();
        $response->assertJsonPath('data.0.name', 'Dino Crisis');
        $response->assertJsonPath('data.0.image_url', 'https://media.rawg.io/dino.jpg');
    }

    public function test_search_returns_empty_without_api_key(): void
    {
        Config::set('services.rawg.key', null);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/game-lookup?search=dino');

        $response->assertOk();
        $response->assertJsonPath('data', []);
    }

    public function test_detail_returns_description(): void
    {
        Config::set('services.rawg.key', 'test-key');
        Http::fake([
            'api.rawg.io/api/games/123*' => Http::response([
                'id' => 123,
                'name' => 'Dino Crisis',
                'description_raw' => 'Survival horror com dinossauros.',
                'released' => '1999-07-01',
                'background_image' => 'https://media.rawg.io/dino.jpg',
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/game-lookup/123');

        $response->assertOk();
        $response->assertJsonPath('data.description', 'Survival horror com dinossauros.');
    }

    public function test_image_proxy_rejects_foreign_hosts(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/api/game-lookup/image?url=https://evil.example.com/x.jpg')
            ->assertUnprocessable();
    }

    public function test_lookup_requires_authentication(): void
    {
        $this->getJson('/api/game-lookup?search=dino')->assertUnauthorized();
    }
}
