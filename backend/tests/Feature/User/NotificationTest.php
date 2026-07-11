<?php

namespace Tests\Feature\User;

use App\Enums\GameStatus;
use App\Jobs\ModerateGameJob;
use App\Models\Game;
use App\Models\User;
use App\Models\Vote;
use App\Notifications\GameModeratedNotification;
use App\Notifications\GameVoteMilestoneNotification;
use App\Services\Moderation\ModerationResult;
use App\Services\Moderation\ModerationServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_is_notified_when_game_is_moderated(): void
    {
        Notification::fake();
        $game = Game::factory()->create(['status' => GameStatus::Pending]);

        $mock = Mockery::mock(ModerationServiceInterface::class);
        $mock->shouldReceive('moderateGame')->once()->andReturn(new ModerationResult(approved: true, reason: 'ok'));
        $this->app->instance(ModerationServiceInterface::class, $mock);

        (new ModerateGameJob($game))->handle($this->app->make(ModerationServiceInterface::class));

        Notification::assertSentTo($game->user, GameModeratedNotification::class);
    }

    public function test_milestone_notifies_owner_and_followers(): void
    {
        Notification::fake();
        $game = Game::factory()->create(['status' => GameStatus::Approved, 'net_score' => 9, 'yes_votes_count' => 9]);
        $follower = User::factory()->create();
        $game->followers()->create(['user_id' => $follower->id]);

        // Voto que cruza o marco de 10.
        Vote::factory()->for($game)->create(['value' => 1]);

        Notification::assertSentTo($game->user, GameVoteMilestoneNotification::class);
        Notification::assertSentTo($follower, GameVoteMilestoneNotification::class);
    }

    public function test_vote_below_milestone_does_not_notify(): void
    {
        Notification::fake();
        $game = Game::factory()->create(['status' => GameStatus::Approved, 'net_score' => 3, 'yes_votes_count' => 3]);

        Vote::factory()->for($game)->create(['value' => 1]);

        Notification::assertNothingSent();
    }

    public function test_user_can_list_and_mark_notifications_read(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->for($user)->create(['status' => GameStatus::Approved]);

        $user->notify(new GameVoteMilestoneNotification($game, 10));

        $response = $this->actingAs($user)->getJson('/api/me/notifications');
        $response->assertOk();
        $response->assertJsonPath('meta.unread_count', 1);
        $this->assertSame('vote_milestone', $response->json('data.0.data.kind'));

        $this->actingAs($user)->postJson('/api/me/notifications/read')->assertNoContent();

        $response = $this->actingAs($user)->getJson('/api/me/notifications');
        $response->assertJsonPath('meta.unread_count', 0);
    }
}
