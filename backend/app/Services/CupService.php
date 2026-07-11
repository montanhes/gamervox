<?php

namespace App\Services;

use App\Enums\CupStatus;
use App\Enums\GameStatus;
use App\Models\Cup;
use App\Models\CupMatch;
use App\Models\Game;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CupService
{
    /**
     * Cria uma copa com os top N jogos do ranking em chaveamento mata-mata.
     */
    public function start(string $name, int $size, int $roundDays): Cup
    {
        if (Cup::where('status', CupStatus::Active)->exists()) {
            throw new \RuntimeException('Já existe uma copa ativa.');
        }

        if (($size & ($size - 1)) !== 0 || $size < 4) {
            throw new \RuntimeException('O tamanho precisa ser potência de 2 (mínimo 4).');
        }

        $games = Game::query()
            ->where('status', GameStatus::Approved)
            ->orderByDesc('net_score')
            ->orderByDesc('id')
            ->limit($size)
            ->get();

        if ($games->count() < $size) {
            throw new \RuntimeException("Jogos aprovados insuficientes: {$games->count()}/{$size}.");
        }

        return DB::transaction(function () use ($name, $size, $roundDays, $games) {
            $cup = Cup::create([
                'name' => $name,
                'slug' => Str::slug($name).'-'.now()->format('Y-m'),
                'status' => CupStatus::Active,
                'size' => $size,
                'current_round' => 1,
                'total_rounds' => (int) log($size, 2),
                'round_days' => $roundDays,
                'round_ends_at' => now()->addDays($roundDays),
            ]);

            // Seeding clássico: 1º vs último, 2º vs penúltimo...
            for ($position = 1; $position <= $size / 2; $position++) {
                $cup->matches()->create([
                    'round' => 1,
                    'position' => $position,
                    'game_a_id' => $games[$position - 1]->id,
                    'game_b_id' => $games[$size - $position]->id,
                ]);
            }

            return $cup;
        });
    }

    /**
     * Fecha a rodada atual (se venceu o prazo) e monta a próxima; na final,
     * encerra a copa. Retorna true se avançou.
     */
    public function advance(Cup $cup, bool $force = false): bool
    {
        if ($cup->status !== CupStatus::Active) {
            return false;
        }

        if (! $force && $cup->round_ends_at?->isFuture()) {
            return false;
        }

        return DB::transaction(function () use ($cup) {
            $matches = $cup->matches()
                ->where('round', $cup->current_round)
                ->orderBy('position')
                ->get();

            foreach ($matches as $match) {
                if ($match->winner_id === null) {
                    $match->update(['winner_id' => $this->resolveWinner($match)]);
                }
            }

            if ($cup->current_round >= $cup->total_rounds) {
                $cup->update(['status' => CupStatus::Finished, 'round_ends_at' => null]);

                return true;
            }

            $nextRound = $cup->current_round + 1;

            foreach ($matches->chunk(2)->values() as $index => $pair) {
                $cup->matches()->create([
                    'round' => $nextRound,
                    'position' => $index + 1,
                    'game_a_id' => $pair->first()->winner_id,
                    'game_b_id' => $pair->last()->winner_id,
                ]);
            }

            $cup->update([
                'current_round' => $nextRound,
                'round_ends_at' => now()->addDays($cup->round_days),
            ]);

            return true;
        });
    }

    private function resolveWinner(CupMatch $match): int
    {
        $votesA = $match->votes()->where('game_id', $match->game_a_id)->count();
        $votesB = $match->votes()->where('game_id', $match->game_b_id)->count();

        if ($votesA !== $votesB) {
            return $votesA > $votesB ? $match->game_a_id : $match->game_b_id;
        }

        // Empate: decide pelo saldo geral do ranking.
        $netA = Game::whereKey($match->game_a_id)->value('net_score') ?? 0;
        $netB = Game::whereKey($match->game_b_id)->value('net_score') ?? 0;

        return $netB > $netA ? $match->game_b_id : $match->game_a_id;
    }
}
