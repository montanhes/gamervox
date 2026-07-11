<?php

namespace App\Notifications;

use App\Enums\GameStatus;
use App\Models\Game;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GameModeratedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Game $game,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Contas Steam recebem e-mail placeholder que não existe.
        if (! str_ends_with($notifiable->email, '@steam.gamervox.local')) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => 'game_moderated',
            'slug' => $this->game->slug,
            'title' => $this->game->title,
            'status' => $this->game->status->label(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->game->status === GameStatus::Approved;
        $url = rtrim(config('app.frontend_url'), '/')."/games/{$this->game->slug}";

        $mail = (new MailMessage)
            ->subject(__('notifications.moderated_subject', ['title' => $this->game->title]))
            ->greeting(__('notifications.greeting', ['name' => $notifiable->name]));

        if ($approved) {
            return $mail
                ->line(__('notifications.approved_line', ['title' => $this->game->title]))
                ->action(__('notifications.view_game'), $url);
        }

        return $mail
            ->line(__('notifications.rejected_line', ['title' => $this->game->title]))
            ->line($this->game->moderation_reason ?? '');
    }
}
