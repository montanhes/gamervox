<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Game;
use App\Services\Moderation\ModerationServiceException;
use App\Services\Moderation\ModerationServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class CommentController extends Controller
{
    public function index(string $slug): AnonymousResourceCollection
    {
        $game = Game::where('slug', $slug)->where('status', 'approved')->firstOrFail();

        $comments = $game->comments()
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    public function store(
        StoreCommentRequest $request,
        string $slug,
        ModerationServiceInterface $moderationService,
    ): CommentResource {
        $game = Game::where('slug', $slug)->where('status', 'approved')->firstOrFail();

        $body = $request->validated('body');

        try {
            $result = $moderationService->moderateText($body);
        } catch (ModerationServiceException) {
            if (config('moderation.comment_fallback') === 'approve') {
                $result = null;
            } else {
                throw ValidationException::withMessages([
                    'body' => [trans('moderation.comment_unavailable')],
                ]);
            }
        }

        if ($result && ! $result->approved) {
            throw ValidationException::withMessages([
                'body' => [$result->reason],
            ]);
        }

        $comment = $game->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $body,
        ]);

        return new CommentResource($comment->load('user'));
    }
}
