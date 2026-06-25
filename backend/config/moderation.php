<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Comment Moderation Fallback
    |--------------------------------------------------------------------------
    |
    | Quando o serviço de moderação (Gemini) falha ao avaliar um comentário
    | (timeout, erro 5xx, etc.), decide o que fazer:
    | - "reject": fail-closed, comentário não é publicado (padrão, mais seguro)
    | - "approve": fail-open, comentário é publicado mesmo sem avaliação
    */
    'comment_fallback' => env('MODERATION_COMMENT_FALLBACK', 'reject'),

];
