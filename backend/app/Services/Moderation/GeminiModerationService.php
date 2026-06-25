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
    private const MODEL = 'gemini-2.0-flash';

    public function __construct(
        private readonly ClientContract $client,
    ) {}

    public function moderateGame(Game $game): ModerationResult
    {
        $tags = $game->relationLoaded('tags') ? $game->tags->pluck('name')->implode(', ') : '';

        $prompt = <<<PROMPT
            Você é um moderador de conteúdo para o site Gamervox, uma plataforma onde usuários
            cadastram JOGOS ANTIGOS REAIS que não tiveram remake/remaster/continuação, para a
            comunidade votar se quer ou não o retorno da IP.

            Critérios de aprovação:
            1. O título corresponde a um jogo real e existente (não invenção, não placeholder).
            2. A descrição é coerente com o jogo informado e não contém spam, links suspeitos,
               conteúdo ofensivo, discurso de ódio ou conteúdo sexual explícito.
            3. As tags (se houver) são relevantes ao gênero/plataforma do jogo.
            4. Não é uma proposta fora do tema do site (ex.: propaganda, pedido de produto).

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
