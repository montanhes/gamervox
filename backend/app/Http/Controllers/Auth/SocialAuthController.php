<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\UsernameService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class SocialAuthController extends Controller
{
    /** @var list<string> */
    private const PROVIDERS = ['google', 'discord', 'steam'];

    public function redirect(string $provider): RedirectResponse
    {
        $this->ensureProviderIsSupported($provider);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $this->ensureProviderIsSupported($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable) {
            return redirect(config('app.frontend_url').'/auth/callback?error=social_login_failed');
        }

        $user = $this->resolveUser($provider, $socialUser);

        Auth::login($user);

        return redirect(config('app.frontend_url').'/auth/callback');
    }

    private function resolveUser(string $provider, SocialiteUser $socialUser): User
    {
        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            return $socialAccount->user;
        }

        // Steam não fornece e-mail via OpenID, então nunca dá pra casar por e-mail.
        $user = $provider !== 'steam'
            ? User::where('email', $socialUser->getEmail())->first()
            : null;

        if (! $user) {
            $name = $socialUser->getName() ?: $socialUser->getNickname();

            $user = User::create([
                'name' => $name,
                'username' => app(UsernameService::class)->generate($name ?? 'player'),
                'email' => $socialUser->getEmail() ?: Str::uuid().'@steam.gamervox.local',
                'avatar_url' => $socialUser->getAvatar(),
            ]);
        }

        $user->socialAccounts()->create([
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar_url' => $socialUser->getAvatar(),
        ]);

        return $user;
    }

    private function ensureProviderIsSupported(string $provider): void
    {
        if (! in_array($provider, self::PROVIDERS, true)) {
            throw new NotFoundHttpException;
        }
    }
}
