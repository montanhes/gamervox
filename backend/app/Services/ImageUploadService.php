<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Laravel\Facades\Image;

class ImageUploadService
{
    private const MAX_WIDTH = 1280;

    private const WEBP_QUALITY = 80;

    public function storeGameCover(UploadedFile $file, string $slug): string
    {
        $encoded = Image::decode($file)
            ->scaleDown(width: self::MAX_WIDTH)
            ->encode(new WebpEncoder(quality: self::WEBP_QUALITY));

        $path = "games/{$slug}-".Str::random(8).'.webp';

        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }
}
