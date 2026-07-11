<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['cup_match_id', 'user_id', 'game_id'])]
class CupVote extends Model
{
    /**
     * @return BelongsTo<CupMatch, $this>
     */
    public function match(): BelongsTo
    {
        return $this->belongsTo(CupMatch::class, 'cup_match_id');
    }
}
