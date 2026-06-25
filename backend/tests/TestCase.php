<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Simula requisições vindas do SPA pra Sanctum tratar como stateful (sessão).
        $this->withHeader('Referer', config('app.frontend_url'));
    }
}
