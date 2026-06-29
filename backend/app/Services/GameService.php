<?php

namespace App\Services;

use App\Enums\GameStatus;
use App\Jobs\ModerateGameJob;
use App\Models\Game;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GameService
{
    public function __construct(
        private readonly ImageUploadService $imageUploadService,
    ) {}

    /**
     * @param  array{title: string, description: string, tags?: list<string>, social_links?: list<array{platform: string, url: string}>}  $data
     */
    public function create(User $user, array $data, UploadedFile $image): Game
    {
        $slug = $this->uniqueSlug($data['title']);

        $game = DB::transaction(function () use ($user, $data, $image, $slug) {
            $game = Game::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'slug' => $slug,
                'description' => $data['description'],
                'status' => GameStatus::Pending,
            ]);

            $game->image_path = $this->imageUploadService->storeGameCover($image, $slug);
            $game->save();

            if (! empty($data['tags'])) {
                $game->tags()->sync($this->resolveTagIds($data['tags']));
            }

            foreach ($data['social_links'] ?? [] as $link) {
                $game->socialLinks()->create($link);
            }

            return $game;
        });

        ModerateGameJob::dispatch($game);

        return $game;
    }

    /**
     * @return Collection<int, Game>
     */
    public function findSimilar(string $title): Collection
    {
        $slug = Str::slug($title);

        return Game::query()
            ->where('status', GameStatus::Approved)
            ->where(function ($query) use ($slug, $title) {
                $query->where('slug', 'like', "{$slug}%")
                    ->orWhere('title', 'like', "%{$title}%");
            })
            ->limit(5)
            ->get();
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 2;

        while (Game::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    /**
     * @param  list<string>  $tagNames
     * @return list<int>
     */
    private function resolveTagIds(array $tagNames): array
    {
        return array_map(
            fn (string $name) => Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            )->id,
            $tagNames,
        );
    }
}
