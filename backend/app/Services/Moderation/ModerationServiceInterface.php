<?php

namespace App\Services\Moderation;

use App\Models\Game;

interface ModerationServiceInterface
{
    /**
     * @throws ModerationServiceException
     */
    public function moderateGame(Game $game): ModerationResult;

    /**
     * @throws ModerationServiceException
     */
    public function moderateText(string $text): ModerationResult;
}
