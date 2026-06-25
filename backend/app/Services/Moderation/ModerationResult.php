<?php

namespace App\Services\Moderation;

readonly class ModerationResult
{
    public function __construct(
        public bool $approved,
        public string $reason,
    ) {}
}
