<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vote>
 */
class VoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'game_id' => Game::factory(),
            'value' => 1,
        ];
    }

    public function no(): static
    {
        return $this->state(['value' => -1]);
    }
}
