<?php

namespace App\Console\Commands;

use App\Enums\CupStatus;
use App\Models\Cup;
use App\Services\CupService;
use Illuminate\Console\Command;

class CupAdvance extends Command
{
    protected $signature = 'gamervox:cup-advance {--force : Avança mesmo antes do fim da rodada}';

    protected $description = 'Fecha a rodada vencida da copa ativa e monta a próxima';

    public function handle(CupService $cupService): int
    {
        $cup = Cup::where('status', CupStatus::Active)->first();

        if ($cup === null) {
            $this->info('Nenhuma copa ativa.');

            return self::SUCCESS;
        }

        if (! $cupService->advance($cup, force: (bool) $this->option('force'))) {
            $this->info('Rodada ainda em andamento.');

            return self::SUCCESS;
        }

        $cup->refresh();
        $this->info(
            $cup->status === CupStatus::Finished
                ? "Copa \"{$cup->name}\" encerrada!"
                : "Rodada {$cup->current_round} de {$cup->total_rounds} iniciada.",
        );

        return self::SUCCESS;
    }
}
