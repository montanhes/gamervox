<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class WeeklyDigestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param  Collection<int, \App\Models\Game>  $games
     */
    public function __construct(
        public readonly User $user,
        public readonly Collection $games,
    ) {
        $this->locale($user->preferredLocale() ?? config('app.locale'));
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('notifications.digest_subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.weekly-digest',
            with: [
                'games' => $this->games,
                'frontendUrl' => rtrim(config('app.frontend_url'), '/'),
            ],
        );
    }
}
