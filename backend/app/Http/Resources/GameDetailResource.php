<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class GameDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canSeeStatus = $request->user()?->id === $this->user_id || $request->user()?->is_admin;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'yes_votes_count' => $this->yes_votes_count,
            'no_votes_count' => $this->no_votes_count,
            'net_score' => $this->net_score,
            'is_announced' => $this->announced_at !== null,
            'followers_count' => $this->followers_count,
            'followed_by_me' => (bool) ($this->followed_by_me ?? false),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'social_links' => $this->whenLoaded('socialLinks', fn () => $this->socialLinks->map(fn ($link) => [
                'platform' => $link->platform,
                'url' => $link->url,
            ])),
            'user' => new UserResource($this->whenLoaded('user')),
            'status' => $this->when($canSeeStatus, $this->status?->label()),
            'moderation_reason' => $this->when($canSeeStatus, $this->moderation_reason),
        ];
    }
}
