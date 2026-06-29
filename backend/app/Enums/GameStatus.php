<?php

namespace App\Enums;

enum GameStatus: int
{
    case Pending = 0;
    case Approved = 1;
    case Rejected = 2;

    public function label(): string
    {
        return strtolower($this->name);
    }

    public static function fromLabel(string $label): self
    {
        return match ($label) {
            'pending' => self::Pending,
            'approved' => self::Approved,
            'rejected' => self::Rejected,
            default => throw new \ValueError("'{$label}' is not a valid GameStatus label"),
        };
    }
}
