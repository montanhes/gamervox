<?php

namespace App\Console\Commands;

use App\Enums\GameStatus;
use App\Mail\WeeklyDigestMail;
use App\Models\Game;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendWeeklyDigest extends Command
{
    protected $signature = 'gamervox:send-weekly-digest';

    protected $description = 'Envia o digest semanal com os jogos em alta pra quem optou por receber';

    public function handle(): int
    {
        $games = Game::query()
            ->where('status', GameStatus::Approved)
            ->withSum(['votes as trending_score' => fn ($q) => $q->where('created_at', '>=', now()->subDays(7))], 'value')
            ->orderByDesc('trending_score')
            ->orderByDesc('net_score')
            ->limit(5)
            ->get();

        if ($games->isEmpty()) {
            $this->info('Nenhum jogo aprovado; digest não enviado.');

            return self::SUCCESS;
        }

        $sent = 0;

        User::query()
            ->where('wants_digest', true)
            ->whereNot('email', 'like', '%@steam.gamervox.local')
            ->chunkById(200, function ($users) use ($games, &$sent) {
                foreach ($users as $user) {
                    Mail::to($user->email)->queue(new WeeklyDigestMail($user, $games));
                    $sent++;
                }
            });

        $this->info("Digest enfileirado para {$sent} usuários.");

        return self::SUCCESS;
    }
}
