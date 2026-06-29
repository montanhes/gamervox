<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $type = $this->columnType('status');

        if ($type === 'enum') {
            Schema::table('games', function (Blueprint $table) {
                $table->tinyInteger('status_tmp')->default(0)->after('status');
            });

            DB::statement("UPDATE games SET status_tmp = CASE
                WHEN status = 'approved' THEN 1
                WHEN status = 'rejected' THEN 2
                ELSE 0 END");

            Schema::table('games', function (Blueprint $table) {
                if ($this->indexExists('games_status_net_score_index')) {
                    $table->dropIndex('games_status_net_score_index');
                }
                $table->dropColumn('status');
            });

            Schema::table('games', function (Blueprint $table) {
                $table->renameColumn('status_tmp', 'status');
            });
        }

        if (! $this->indexExists('games_status_net_score_index')) {
            Schema::table('games', function (Blueprint $table) {
                $table->index(['status', 'net_score']);
            });
        }
    }

    public function down(): void
    {
        $type = $this->columnType('status');

        if ($type === 'tinyint') {
            Schema::table('games', function (Blueprint $table) {
                $table->string('status_tmp')->default('pending')->after('status');
            });

            DB::statement("UPDATE games SET status_tmp = CASE
                WHEN status = 1 THEN 'approved'
                WHEN status = 2 THEN 'rejected'
                ELSE 'pending' END");

            Schema::table('games', function (Blueprint $table) {
                if ($this->indexExists('games_status_net_score_index')) {
                    $table->dropIndex('games_status_net_score_index');
                }
                $table->dropColumn('status');
            });

            Schema::table('games', function (Blueprint $table) {
                $table->renameColumn('status_tmp', 'status');
            });
        }

        if (! $this->indexExists('games_status_net_score_index')) {
            Schema::table('games', function (Blueprint $table) {
                $table->index(['status', 'net_score']);
            });
        }
    }

    private function columnType(string $column): string
    {
        $row = DB::selectOne("
            SELECT DATA_TYPE FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'games'
              AND COLUMN_NAME = ?
        ", [$column]);

        return $row?->DATA_TYPE ?? '';
    }

    private function indexExists(string $indexName): bool
    {
        return (bool) DB::selectOne("
            SELECT 1 FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'games'
              AND INDEX_NAME = ?
        ", [$indexName]);
    }
};
