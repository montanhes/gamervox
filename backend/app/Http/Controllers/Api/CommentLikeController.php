<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentLikeController extends Controller
{
    public function toggle(Request $request, Comment $comment): JsonResponse
    {
        $userId = $request->user()->id;

        $liked = DB::transaction(function () use ($comment, $userId) {
            $deleted = $comment->likes()->where('user_id', $userId)->delete();

            if ($deleted > 0) {
                Comment::where('id', $comment->id)
                    ->where('likes_count', '>', 0)
                    ->decrement('likes_count');

                return false;
            }

            $comment->likes()->create(['user_id' => $userId]);
            Comment::where('id', $comment->id)->increment('likes_count');

            return true;
        });

        return response()->json([
            'liked' => $liked,
            'likes_count' => $comment->fresh()->likes_count,
        ]);
    }
}
