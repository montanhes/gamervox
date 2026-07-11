<?php

namespace App\Enums;

enum CupStatus: int
{
    case Active = 0;
    case Finished = 1;

    public function label(): string
    {
        return strtolower($this->name);
    }
}
