<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'yes_votes_count' => $this->yes_votes_count,
            'no_votes_count' => $this->no_votes_count,
            'net_score' => $this->net_score,
            'is_announced' => $this->announced_at !== null,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
