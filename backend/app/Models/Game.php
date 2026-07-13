<?php

namespace App\Models;

use App\Enums\GameStatus;
use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'title', 'slug', 'description', 'image_path', 'status', 'moderation_reason', 'manual_review_requested_at', 'announced_at'])]
class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 0,
        'yes_votes_count' => 0,
        'no_votes_count' => 0,
        'net_score' => 0,
        'moderation_attempts' => 0,
    ];

    protected function casts(): array
    {
        return [
            'status' => GameStatus::class,
            'announced_at' => 'datetime',
            'manual_review_requested_at' => 'datetime',
            'yes_votes_count' => 'integer',
            'no_votes_count' => 'integer',
            'net_score' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Vote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    /**
     * @return HasMany<GameSocialLink, $this>
     */
    public function socialLinks(): HasMany
    {
        return $this->hasMany(GameSocialLink::class);
    }

    /**
     * @return BelongsToMany<Tag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return HasMany<GameFollower, $this>
     */
    public function followers(): HasMany
    {
        return $this->hasMany(GameFollower::class);
    }
}
