<?php

namespace App\Models;

use App\Enums\CupStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'status', 'size', 'current_round', 'total_rounds', 'round_days', 'round_ends_at'])]
class Cup extends Model
{
    protected function casts(): array
    {
        return [
            'status' => CupStatus::class,
            'round_ends_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<CupMatch, $this>
     */
    public function matches(): HasMany
    {
        return $this->hasMany(CupMatch::class);
    }
}
