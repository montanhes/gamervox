<x-mail::message>
# {{ __('notifications.digest_heading') }}

{{ __('notifications.digest_intro') }}

@foreach ($games as $game)
- [{{ $game->title }}]({{ $frontendUrl }}/games/{{ $game->slug }}) — {{ $game->net_score >= 0 ? '+' : '' }}{{ $game->net_score }}
@endforeach

<x-mail::button :url="$frontendUrl">
{{ __('notifications.digest_cta') }}
</x-mail::button>

{{ __('notifications.digest_optout') }}
</x-mail::message>
