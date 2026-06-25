<?php

use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('auth/{provider}')->group(function () {
    Route::get('redirect', [SocialAuthController::class, 'redirect'])->name('auth.social.redirect');
    Route::get('callback', [SocialAuthController::class, 'callback'])->name('auth.social.callback');
});
