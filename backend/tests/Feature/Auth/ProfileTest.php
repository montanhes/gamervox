<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_name(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user)->patchJson('/api/me', ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_update_profile_fails_with_empty_name(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/api/me', ['name' => '']);

        $response->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_guest_cannot_update_profile(): void
    {
        $this->patchJson('/api/me', ['name' => 'New Name'])->assertUnauthorized();
    }
}
