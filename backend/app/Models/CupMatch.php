<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['cup_id', 'round', 'position', 'game_a_id', 'game_b_id', 'winner_id'])]
class CupMatch extends Model
{
    /**
     * @return BelongsTo<Cup, $this>
     */
    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class);
    }

    /**
     * @return BelongsTo<Game, $this>
     */
    public function gameA(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_a_id');
    }

    /**
     * @return BelongsTo<Game, $this>
     */
    public function gameB(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_b_id');
    }

    /**
     * @return HasMany<CupVote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(CupVote::class);
    }
}
