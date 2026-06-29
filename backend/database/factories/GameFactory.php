<?php

namespace Database\Factories;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Game>
 */
class GameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(),
            'status' => GameStatus::Approved,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => GameStatus::Pending]);
    }

    public function rejected(): static
    {
        return $this->state(['status' => GameStatus::Rejected, 'moderation_reason' => fake()->sentence()]);
    }
}
