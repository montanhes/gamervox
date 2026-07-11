<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsernameTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_generates_username_from_name(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ramon Carvalho',
            'email' => 'ramon@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $this->assertSame('ramon-carvalho', $response->json('data.username'));
    }

    public function test_register_accepts_custom_username_and_rejects_duplicates(): void
    {
        User::factory()->create(['username' => 'gamer']);

        $this->postJson('/api/register', [
            'name' => 'Outro',
            'username' => 'gamer',
            'email' => 'outro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable();

        $response = $this->postJson('/api/register', [
            'name' => 'Outro',
            'username' => 'Gamer_2',
            'email' => 'outro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $this->assertSame('gamer_2', $response->json('data.username'));
    }

    public function test_user_can_update_own_username(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/api/me', [
            'name' => $user->name,
            'username' => 'novo-nick',
        ]);

        $response->assertOk();
        $this->assertSame('novo-nick', $user->fresh()->username);
    }

    public function test_duplicate_names_get_unique_usernames(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Maria Silva',
            'email' => 'maria1@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $response = $this->postJson('/api/register', [
            'name' => 'Maria Silva',
            'email' => 'maria2@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $this->assertSame('maria-silva-2', $response->json('data.username'));
    }
}
