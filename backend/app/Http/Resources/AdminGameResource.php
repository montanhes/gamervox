<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdminGameResource extends JsonResource
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
            'description' => $this->description,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'status' => $this->status?->label(),
            'moderation_reason' => $this->moderation_reason,
            'manual_review_requested' => $this->manual_review_requested_at !== null,
            'moderation_attempts' => $this->moderation_attempts,
            'created_at' => $this->created_at,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'user' => new PublicUserResource($this->whenLoaded('user')),
        ];
    }
}
