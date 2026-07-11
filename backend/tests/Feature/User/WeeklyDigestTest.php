<?php

namespace Tests\Feature\User;

use App\Enums\GameStatus;
use App\Mail\WeeklyDigestMail;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class WeeklyDigestTest extends TestCase
{
    use RefreshDatabase;

    public function test_digest_goes_only_to_opted_in_users_with_real_email(): void
    {
        Mail::fake();
        Game::factory()->create(['status' => GameStatus::Approved]);

        $optedIn = User::factory()->create(['wants_digest' => true]);
        $optedOut = User::factory()->create(['wants_digest' => false]);
        $steam = User::factory()->create(['wants_digest' => true, 'email' => 'abc@steam.gamervox.local']);

        $this->artisan('gamervox:send-weekly-digest')->assertSuccessful();

        Mail::assertQueued(WeeklyDigestMail::class, fn ($mail) => $mail->hasTo($optedIn->email));
        Mail::assertNotQueued(WeeklyDigestMail::class, fn ($mail) => $mail->hasTo($optedOut->email));
        Mail::assertNotQueued(WeeklyDigestMail::class, fn ($mail) => $mail->hasTo($steam->email));
    }

    public function test_digest_skipped_without_approved_games(): void
    {
        Mail::fake();
        User::factory()->create(['wants_digest' => true]);

        $this->artisan('gamervox:send-weekly-digest')->assertSuccessful();

        Mail::assertNothingQueued();
    }
}
