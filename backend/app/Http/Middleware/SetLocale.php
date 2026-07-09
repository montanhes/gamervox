<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('locales.supported');
        $locale = $request->user()?->locale;

        if (is_string($locale) && array_key_exists($locale, $supported)) {
            App::setLocale($supported[$locale]);
        }

        return $next($request);
    }
}
