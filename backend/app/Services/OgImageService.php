<?php

namespace App\Services;

use App\Models\Game;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Typography\FontFactory;

class OgImageService
{
    private const WIDTH = 1200;

    private const HEIGHT = 630;

    private const COVER_WIDTH = 470;

    private const JPEG_QUALITY = 85;

    private const CACHE_TTL_SECONDS = 86400;

    private const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

    /**
     * Gera (ou reusa do cache) o card OG do jogo e devolve o path no disco public.
     */
    public function generate(Game $game): string
    {
        $path = "og/{$game->slug}.jpg";
        $disk = Storage::disk('public');

        // net_score muda com o tempo; regenera no máximo uma vez por dia.
        if ($disk->exists($path) && time() - $disk->lastModified($path) < self::CACHE_TTL_SECONDS) {
            return $path;
        }

        $canvas = Image::createImage(self::WIDTH, self::HEIGHT)->fill('#0b0e11');

        $textX = 80;

        if ($game->image_path && $disk->exists($game->image_path)) {
            $cover = Image::decode($disk->get($game->image_path))->cover(self::COVER_WIDTH, self::HEIGHT);
            $canvas->insert($cover);
            $textX = self::COVER_WIDTH + 60;
        }

        if (is_file(self::FONT_BOLD)) {
            $wrapWidth = self::WIDTH - $textX - 60;

            $canvas->text($game->title, $textX, 120, function (FontFactory $font) use ($wrapWidth) {
                $font->filename(self::FONT_BOLD);
                $font->size(58);
                $font->color('#f0f6fc');
                $font->wrap($wrapWidth);
                $font->align('left', 'top');
                $font->lineHeight(1.2);
            });

            $net = $game->net_score;
            $canvas->text(($net >= 0 ? '+' : '').$net, $textX, 420, function (FontFactory $font) {
                $font->filename(self::FONT_BOLD);
                $font->size(88);
                $font->color('#f5c518');
                $font->align('left', 'top');
            });

            $canvas->text('gamervox', $textX, 560, function (FontFactory $font) {
                $font->filename(self::FONT_BOLD);
                $font->size(30);
                $font->color('#9d4edd');
                $font->align('left', 'top');
            });
        }

        $encoded = $canvas->encode(new JpegEncoder(quality: self::JPEG_QUALITY));
        $disk->put($path, (string) $encoded);

        return $path;
    }
}
