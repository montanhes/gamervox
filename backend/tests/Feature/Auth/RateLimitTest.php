<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_rate_limited_after_too_many_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'nope@example.com', 'password' => 'wrong']);
        }

        $response = $this->postJson('/api/login', ['email' => 'nope@example.com', 'password' => 'wrong']);

        $response->assertStatus(429);
    }
}
