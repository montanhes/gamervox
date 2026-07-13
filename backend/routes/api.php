<?php

use App\Http\Controllers\Api\Admin\GameModerationController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CommentLikeController;
use App\Http\Controllers\Api\CupController;
use App\Http\Controllers\Api\GameFollowController;
use App\Http\Controllers\Api\GameLookupController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\VoteController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{slug}', [GameController::class, 'show']);
Route::get('/games/{slug}/comments', [CommentController::class, 'index']);
Route::get('/games/{slug}/comments/{comment}/replies', [CommentController::class, 'replies']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/cup', [CupController::class, 'show']);
Route::get('/users/{user:username}', [UserProfileController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me/games', [GameController::class, 'mine']);
    Route::get('/me/following', [GameFollowController::class, 'index']);
    Route::get('/me/notifications', [NotificationController::class, 'index']);
    Route::post('/me/notifications/read', [NotificationController::class, 'markAllRead']);

    Route::post('/games', [GameController::class, 'store'])->middleware('throttle:6,1');
    Route::get('/game-lookup', [GameLookupController::class, 'search'])->middleware('throttle:30,1');
    Route::get('/game-lookup/image', [GameLookupController::class, 'image'])->middleware('throttle:20,1');
    Route::get('/game-lookup/{id}', [GameLookupController::class, 'show'])->middleware('throttle:30,1');
    Route::post('/games/{slug}/vote', [VoteController::class, 'store']);
    Route::post('/games/{slug}/request-review', [GameController::class, 'requestReview'])->middleware('throttle:5,1');
    Route::post('/games/{slug}/follow', [GameFollowController::class, 'toggle'])->middleware('throttle:60,1');
    Route::delete('/games/{slug}/vote', [VoteController::class, 'destroy']);
    Route::post('/games/{slug}/comments', [CommentController::class, 'store'])->middleware('throttle:20,1');
    Route::post('/comments/{comment}/like', [CommentLikeController::class, 'toggle'])->middleware('throttle:60,1');
    Route::post('/cup/matches/{match}/vote', [CupController::class, 'vote'])->middleware('throttle:30,1');

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/games', [GameModerationController::class, 'index']);
        Route::patch('/games/{game}/moderate', [GameModerationController::class, 'update']);
    });
});
