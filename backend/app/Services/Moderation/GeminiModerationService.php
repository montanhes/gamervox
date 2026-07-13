<?php

namespace App\Services\Moderation;

use App\Models\Game;
use Gemini\Contracts\ClientContract;
use Gemini\Data\Blob;
use Gemini\Data\GenerationConfig;
use Gemini\Data\Schema;
use Gemini\Enums\DataType;
use Gemini\Enums\MimeType;
use Gemini\Enums\ResponseMimeType;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GeminiModerationService implements ModerationServiceInterface
{
    private const MODEL = 'gemini-flash-latest';

    public function __construct(
        private readonly ClientContract $client,
    ) {}

    public function moderateGame(Game $game): ModerationResult
    {
        $tags = $game->relationLoaded('tags') ? $game->tags->pluck('name')->implode(', ') : '';

        $prompt = <<<PROMPT
            Você é um moderador de conteúdo para o site Gamervox, uma plataforma onde a
            comunidade vota a favor do retorno de IPs de jogos — remakes, remasters,
            continuações ou até um jogo novo de uma franquia. O cadastro é uma PROPOSTA/DESEJO
            do usuário: é esperado e desejável que o título mencione "Remake", "Sequel",
            "Remaster" etc. de um jogo ou franquia existente, mesmo que esse remake/sequência
            específico ainda não exista de verdade — essa é a finalidade central do site (dar
            voz aos fãs pra pressionar as detentoras das IPs).

            Critérios de aprovação (rejeitar só se violar algum destes):
            1. A proposta se refere a uma franquia/IP de jogo real e reconhecível (não precisa
               ser um jogo específico já lançado — pode ser um remake, sequência ou spin-off
               que ainda não existe).
            2. A descrição não contém spam, links suspeitos, conteúdo ofensivo, discurso de
               ódio ou conteúdo sexual explícito.
            3. As tags (se houver) são relevantes ao gênero/plataforma do jogo.
            4. Não é uma proposta completamente fora do tema do site (ex.: propaganda de
               produto, pedido não relacionado a jogos).

            NÃO rejeite só porque o jogo/remake/sequência proposto ainda não existe de verdade —
            isso é o uso normal e esperado do site.

            Título: {$game->title}
            Descrição: {$game->description}
            Tags: {$tags}

            Avalie e responda no formato definido pelo schema, com "reason" em português (pt-BR),
            no máximo 200 caracteres.
            PROMPT;

        $parts = [$prompt];

        if ($game->image_path && Storage::disk('public')->exists($game->image_path)) {
            $parts[] = new Blob(
                mimeType: MimeType::IMAGE_WEBP,
                data: base64_encode(Storage::disk('public')->get($game->image_path)),
            );
        }

        return $this->generate($parts);
    }

    public function moderateText(string $text): ModerationResult
    {
        $prompt = <<<PROMPT
            Você é um moderador de conteúdo para o site Gamervox, uma plataforma de votação sobre
            remakes/continuações de jogos antigos. Avalie o comentário abaixo: ele não deve conter
            spam, links suspeitos, conteúdo ofensivo, discurso de ódio, conteúdo sexual explícito,
            ou estar completamente fora do tema do site.

            Comentário: {$text}

            Avalie e responda no formato definido pelo schema, com "reason" em português (pt-BR),
            no máximo 200 caracteres.
            PROMPT;

        return $this->generate([$prompt]);
    }

    /**
     * @param  list<string|Blob>  $parts
     */
    private function generate(array $parts): ModerationResult
    {
        try {
            $response = $this->client
                ->generativeModel(model: self::MODEL)
                ->withGenerationConfig(new GenerationConfig(
                    responseMimeType: ResponseMimeType::APPLICATION_JSON,
                    responseSchema: new Schema(
                        type: DataType::OBJECT,
                        properties: [
                            'approved' => new Schema(type: DataType::BOOLEAN),
                            'reason' => new Schema(type: DataType::STRING),
                        ],
                        required: ['approved', 'reason'],
                    ),
                ))
                ->generateContent($parts);

            $data = $response->json(associative: true);

            return new ModerationResult(
                approved: (bool) $data['approved'],
                reason: (string) $data['reason'],
            );
        } catch (Throwable $e) {
            throw new ModerationServiceException('Falha ao consultar o serviço de moderação Gemini: '.$e->getMessage(), previous: $e);
        }
    }
}
