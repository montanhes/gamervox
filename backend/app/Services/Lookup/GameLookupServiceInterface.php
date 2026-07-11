<?php

namespace App\Services\Lookup;

interface GameLookupServiceInterface
{
    /**
     * @return list<array{id: int, name: string, released: string|null, image_url: string|null}>
     */
    public function search(string $query): array;

    /**
     * @return array{id: int, name: string, description: string|null, released: string|null, image_url: string|null}|null
     */
    public function find(int $id): ?array;
}
