<?php

namespace App\Http\Controllers\Api;

use App\Enums\GameStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Game;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class CommentController extends Controller
{
    public function index(string $slug): AnonymousResourceCollection
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        $comments = $game->comments()
            ->whereNull('parent_id')
            ->withCount('replies')
            ->with('user')
            ->orderByDesc('created_at')
            ->cursorPaginate(20);

        return CommentResource::collection($comments);
    }

    public function replies(string $slug, Comment $comment): AnonymousResourceCollection
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        abort_if($comment->game_id !== $game->id, 404);

        $replies = $comment->replies()
            ->withCount('replies')
            ->with('user')
            ->orderBy('created_at')
            ->cursorPaginate(10);

        return CommentResource::collection($replies);
    }

    public function store(StoreCommentRequest $request, string $slug): CommentResource
    {
        $game = Game::where('slug', $slug)->where('status', GameStatus::Approved)->firstOrFail();

        $parentId = $request->validated('parent_id');

        if ($parentId !== null) {
            $parentExists = Comment::where('id', $parentId)->where('game_id', $game->id)->exists();

            if (! $parentExists) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Comentário pai não encontrado para este jogo.'],
                ]);
            }
        }

        $comment = $game->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
            'parent_id' => $parentId,
        ]);

        return new CommentResource($comment->load('user')->loadCount('replies'));
    }
}
