<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>{{ $game->title }} — Gamervox</title>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Gamervox">
    <meta property="og:title" content="{{ $game->title }} — Gamervox">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:image" content="{{ $ogImageUrl }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{{ $frontendUrl }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $game->title }} — Gamervox">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $ogImageUrl }}">
    {{-- Humanos são redirecionados pro SPA; crawlers ficam e leem as tags acima. --}}
    <meta http-equiv="refresh" content="0;url={{ $frontendUrl }}">
</head>
<body>
    <p><a href="{{ $frontendUrl }}">{{ $game->title }} — Gamervox</a></p>
</body>
</html>
