<?php

namespace Tests\Feature\Game;

use App\Models\Comment;
use App\Models\Game;
use App\Models\User;
use App\Services\Moderation\ModerationResult;
use App\Services\Moderation\ModerationServiceException;
use App\Services\Moderation\ModerationServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_comments_of_an_approved_game(): void
    {
        $game = Game::factory()->create(['status' => 'approved']);
        Comment::factory()->count(2)->for($game)->create();

        $response = $this->getJson("/api/games/{$game->slug}/comments");

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_authenticated_user_can_post_an_approved_comment(): void
    {
        $this->mockModeration(new ModerationResult(approved: true, reason: 'ok'));

        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => 'approved']);

        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/comments", [
            'body' => 'Que jogo incrível, merece um remake!',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('comments', ['game_id' => $game->id, 'user_id' => $user->id]);
    }

    public function test_comment_rejected_by_moderation_is_not_persisted(): void
    {
        $this->mockModeration(new ModerationResult(approved: false, reason: 'Spam detectado.'));

        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => 'approved']);

        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/comments", [
            'body' => 'compre seguidores aqui!!!',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonPath('errors.body.0', 'Spam detectado.');
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_moderation_failure_fails_closed_by_default(): void
    {
        $mock = Mockery::mock(ModerationServiceInterface::class);
        $mock->shouldReceive('moderateText')->andThrow(new ModerationServiceException('timeout'));
        $this->app->instance(ModerationServiceInterface::class, $mock);

        $user = User::factory()->create();
        $game = Game::factory()->create(['status' => 'approved']);

        $response = $this->actingAs($user)->postJson("/api/games/{$game->slug}/comments", [
            'body' => 'Comentário normal.',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_guest_cannot_post_comment(): void
    {
        $game = Game::factory()->create(['status' => 'approved']);

        $this->postJson("/api/games/{$game->slug}/comments", ['body' => 'oi'])->assertUnauthorized();
    }

    private function mockModeration(ModerationResult $result): void
    {
        $mock = Mockery::mock(ModerationServiceInterface::class);
        $mock->shouldReceive('moderateText')->once()->andReturn($result);

        $this->app->instance(ModerationServiceInterface::class, $mock);
    }
}
