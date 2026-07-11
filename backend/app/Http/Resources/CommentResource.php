<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
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
            'body' => $this->body,
            'created_at' => $this->created_at,
            'parent_id' => $this->parent_id,
            'replies_count' => $this->replies_count ?? 0,
            'likes_count' => $this->likes_count ?? 0,
            'liked_by_me' => (bool) ($this->liked_by_me ?? false),
            'user' => new PublicUserResource($this->whenLoaded('user')),
        ];
    }
}
