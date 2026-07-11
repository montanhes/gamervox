<?php

namespace Tests\Feature\Game;

use App\Enums\GameStatus;
use App\Jobs\ModerateGameJob;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GameTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_approved_games(): void
    {
        Game::factory()->count(3)->create(['status' => GameStatus::Approved]);
        Game::factory()->create(['status' => GameStatus::Pending]);

        $response = $this->getJson('/api/games');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_games_are_ordered_by_net_score_descending(): void
    {
        $low = Game::factory()->create(['status' => GameStatus::Approved, 'net_score' => 5]);
        $high = Game::factory()->create(['status' => GameStatus::Approved, 'net_score' => 50]);

        $response = $this->getJson('/api/games');

        $response->assertOk();
        $this->assertSame($high->id, $response->json('data.0.id'));
        $this->assertSame($low->id, $response->json('data.1.id'));
    }

    public function test_authenticated_user_can_submit_a_game(): void
    {
        Storage::fake('public');
        Queue::fake();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/games', [
            'title' => 'Breath of Fire',
            'description' => 'Um RPG clássico que merece um remake.',
            'image' => UploadedFile::fake()->image('cover.jpg', 1600, 900),
            'tags' => ['rpg', 'snes'],
            'social_links' => [
                ['platform' => 'x', 'url' => 'https://x.com/capcom'],
            ],
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.title', 'Breath of Fire');
        $response->assertJsonPath('data.slug', 'breath-of-fire');
        $response->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('games', ['slug' => 'breath-of-fire', 'status' => GameStatus::Pending]);
        $this->assertDatabaseHas('tags', ['slug' => 'rpg']);
        $this->assertDatabaseHas('game_social_links', ['platform' => 'x']);

        $game = Game::where('slug', 'breath-of-fire')->first();
        Storage::disk('public')->assertExists($game->image_path);
        Queue::assertPushed(ModerateGameJob::class, fn (ModerateGameJob $job) => $job->game->is($game));
    }

    public function test_submitting_a_similar_title_warns_before_confirmation(): void
    {
        Storage::fake('public');
        Queue::fake();
        Game::factory()->create(['title' => 'Breath of Fire', 'slug' => 'breath-of-fire', 'status' => GameStatus::Approved]);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/games', [
            'title' => 'Breath of Fire',
            'description' => 'Outra descrição.',
            'image' => UploadedFile::fake()->image('cover.jpg'),
        ]);

        $response->assertStatus(409);
        $response->assertJsonStructure(['similar_games']);

        $confirmed = $this->actingAs($user)->postJson('/api/games', [
            'title' => 'Breath of Fire',
            'description' => 'Outra descrição.',
            'image' => UploadedFile::fake()->image('cover.jpg'),
            'confirm_duplicate' => true,
        ]);

        $confirmed->assertCreated();
        $confirmed->assertJsonPath('data.slug', 'breath-of-fire-2');
    }

    public function test_guest_cannot_submit_a_game(): void
    {
        $this->postJson('/api/games', [])->assertUnauthorized();
    }

    public function test_show_returns_approved_game_to_anyone(): void
    {
        $game = Game::factory()->create(['status' => GameStatus::Approved]);

        $this->getJson("/api/games/{$game->slug}")->assertOk();
    }

    public function test_show_hides_pending_game_from_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $game = Game::factory()->create(['status' => GameStatus::Pending, 'user_id' => $owner->id]);

        $this->actingAs($other)->getJson("/api/games/{$game->slug}")->assertNotFound();
        $this->actingAs($owner)->getJson("/api/games/{$game->slug}")->assertOk();
    }

    public function test_user_can_list_their_own_submissions_with_status_and_reason(): void
    {
        $user = User::factory()->create();
        Game::factory()->for($user)->create(['status' => GameStatus::Rejected, 'moderation_reason' => 'Fora do tema.']);
        Game::factory()->create(['status' => GameStatus::Approved]);

        $response = $this->actingAs($user)->getJson('/api/me/games');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.status', 'rejected');
        $response->assertJsonPath('data.0.moderation_reason', 'Fora do tema.');
    }
}
