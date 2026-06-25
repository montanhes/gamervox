<?php

namespace Tests\Unit\Services\Moderation;

use App\Models\Game;
use App\Services\Moderation\GeminiModerationService;
use App\Services\Moderation\ModerationServiceException;
use Gemini\Contracts\ClientContract;
use Gemini\Responses\GenerativeModel\GenerateContentResponse;
use Gemini\Testing\ClientFake;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeminiModerationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_moderate_game_returns_approved_result(): void
    {
        $fake = new ClientFake([
            GenerateContentResponse::fake([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode(['approved' => true, 'reason' => 'Jogo real e descrição coerente.']),
                        ]],
                    ],
                ]],
            ]),
        ]);
        $this->app->instance(ClientContract::class, $fake);

        $game = Game::factory()->create(['title' => 'Breath of Fire', 'status' => 'pending']);

        $result = (new GeminiModerationService($fake))->moderateGame($game);

        $this->assertTrue($result->approved);
        $this->assertSame('Jogo real e descrição coerente.', $result->reason);
    }

    public function test_moderate_text_returns_rejected_result(): void
    {
        $fake = new ClientFake([
            GenerateContentResponse::fake([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode(['approved' => false, 'reason' => 'Spam detectado.']),
                        ]],
                    ],
                ]],
            ]),
        ]);

        $result = (new GeminiModerationService($fake))->moderateText('compre seguidores aqui!!! clique no link');

        $this->assertFalse($result->approved);
        $this->assertSame('Spam detectado.', $result->reason);
    }

    public function test_wraps_client_failures_in_moderation_exception(): void
    {
        $fake = new class extends ClientFake
        {
            public function __construct() {}

            public function generativeModel(\BackedEnum|string $model): never
            {
                throw new \RuntimeException('connection refused');
            }
        };

        $game = Game::factory()->create(['status' => 'pending']);

        $this->expectException(ModerationServiceException::class);

        (new GeminiModerationService($fake))->moderateGame($game);
    }
}
