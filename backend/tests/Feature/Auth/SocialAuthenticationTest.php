<?php

namespace Tests\Feature\Auth;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_redirect_rejects_unsupported_provider(): void
    {
        $this->get('/auth/myspace/redirect')->assertNotFound();
    }

    public function test_new_google_login_creates_user_and_authenticates(): void
    {
        $this->mockSocialiteUser('google', '111', 'Ramon', 'ramon@example.com');

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(config('app.frontend_url').'/auth/callback');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'ramon@example.com']);
        $this->assertDatabaseHas('social_accounts', ['provider' => 'google', 'provider_id' => '111']);
    }

    public function test_existing_social_account_logs_in_same_user(): void
    {
        $user = User::factory()->create(['email' => 'ramon@example.com']);
        SocialAccount::create([
            'user_id' => $user->id,
            'provider' => 'discord',
            'provider_id' => '222',
        ]);

        $this->mockSocialiteUser('discord', '222', 'Ramon', 'ramon@example.com');

        $this->get('/auth/discord/callback');

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_steam_login_never_merges_by_email(): void
    {
        $this->mockSocialiteUser('steam', '7656119', 'SteamNick', null);

        $this->get('/auth/steam/callback');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('social_accounts', ['provider' => 'steam', 'provider_id' => '7656119']);
    }

    private function mockSocialiteUser(string $provider, string $id, string $name, ?string $email): void
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class)->makePartial();
        $socialiteUser->shouldReceive('getId')->andReturn($id);
        $socialiteUser->shouldReceive('getName')->andReturn($name);
        $socialiteUser->shouldReceive('getNickname')->andReturn($name);
        $socialiteUser->shouldReceive('getEmail')->andReturn($email);
        $socialiteUser->shouldReceive('getAvatar')->andReturn(null);

        $driver = Mockery::mock(Provider::class);
        $driver->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with($provider)->andReturn($driver);
    }
}
