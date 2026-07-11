<?php

namespace App\Console\Commands;

use App\Services\CupService;
use Illuminate\Console\Command;

class CupStart extends Command
{
    protected $signature = 'gamervox:cup-start {name} {--size=8} {--days=3}';

    protected $description = 'Inicia uma Copa dos Remakes com os jogos mais votados do ranking';

    public function handle(CupService $cupService): int
    {
        try {
            $cup = $cupService->start(
                name: $this->argument('name'),
                size: (int) $this->option('size'),
                roundDays: (int) $this->option('days'),
            );
        } catch (\RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Copa \"{$cup->name}\" criada com {$cup->size} jogos; rodada 1 termina em {$cup->round_ends_at}.");

        return self::SUCCESS;
    }
}
