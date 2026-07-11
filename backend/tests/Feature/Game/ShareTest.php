<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ShareTest extends TestCase
{
    use RefreshDatabase;

    public function test_share_page_serves_og_tags_and_redirects_humans(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $response = $this->get("/share/games/{$game->slug}");

        $response->assertOk();
        $response->assertSee('og:title', false);
        $response->assertSee(e($game->title), false);
        $response->assertSee('twitter:card', false);
        $response->assertSee("/games/{$game->slug}", false);
    }

    public function test_share_page_hides_pending_games(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Pending]);

        $this->get("/share/games/{$game->slug}")->assertNotFound();
    }

    public function test_og_image_is_generated_and_served_as_jpeg(): void
    {
        Storage::fake('public');
        $game = Game::factory()->create(['status' => GameStatus::Approved, 'net_score' => 42]);

        $response = $this->get("/og/games/{$game->slug}.jpg");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/jpeg');
        Storage::disk('public')->assertExists("og/{$game->slug}.jpg");
    }
}
