# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gamervox: gamers cadastram jogos antigos sem remake/continuação e a comunidade vota Sim/Não pelo retorno da IP. Ranking por saldo líquido de votos (yes − no). Monorepo: `backend/` (Laravel 13 + Sail + MariaDB + Sanctum) e `frontend/` (React 19 + TypeScript + Vite + TailwindCSS v4).

## Commands

### Backend (`backend/`)

```bash
./vendor/bin/sail up -d                  # sobe containers (mariadb, redis, app)
./vendor/bin/sail artisan queue:work     # worker da fila — moderação de jogos é assíncrona, sem isso fica parada na tabela jobs
./vendor/bin/sail artisan test           # roda toda a suíte (Pest/PHPUnit)
./vendor/bin/sail artisan test --filter=NomeDoTeste
./vendor/bin/sail artisan test tests/Feature/CaminhoDoArquivo.php
./vendor/bin/sail pint                   # lint/format (Laravel Pint)
./vendor/bin/sail pint --test            # checa sem alterar
```

Sem Sail (host PHP), os mesmos comandos `artisan`/`pint`/`test` funcionam direto sem o prefixo `sail`. Testes usam `DB_DATABASE=testing`, `QUEUE_CONNECTION=sync`, `CACHE_STORE=array` (ver `phpunit.xml`) — não precisam dos containers Sail subindo para a suíte rodar.

Backend serve em `http://localhost:8000` (via `composer dev`, que sobe `serve` + `queue:listen` + `pail` + vite juntos) ou porta do Sail (`APP_PORT`, default 80).

### Frontend (`frontend/`)

```bash
npm run dev       # vite dev server, http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview
```

## Arquitetura

### Backend

- **Auth**: local (sessão Sanctum, SPA via cookie) + social (Google/Discord/Steam via Socialite). `SocialAuthController` casa conta social com usuário existente pelo e-mail quando possível; Steam (OpenID) não tem e-mail, então nunca casa por e-mail. `EnsureUserIsAdmin` middleware (`admin`) protege rotas de override de moderação — não há UI de admin, é preciso marcar `is_admin = true` direto no banco.
- **Votos**: constraint única `(user_id, game_id)` em `votes` impede duplicidade; revotar faz update, não insert. `VoteObserver` mantém `yes_votes_count`, `no_votes_count`, `net_score` cacheados na tabela `games` (atualização atômica), evitando `COUNT()` a cada listagem — qualquer mudança no fluxo de voto precisa preservar essa consistência observer→contadores.
- **Listagem de jogos**: paginação **cursor-based**, não offset — escolhida porque `net_score` muda com frequência e paginação offset duplicaria/pularia itens durante infinite scroll. Ver `GameController@index` / `GameService`.
- **Moderação por IA (Gemini)**: `ModerateGameJob` (assíncrono, com retry/backoff) avalia texto + imagem de cada jogo cadastrado e aprova/rejeita automaticamente. Gemini é usado **somente para jogos** — comentários são publicados diretamente sem moderação por IA. Sem `GEMINI_API_KEY`, jogos ficam `pending` indefinidamente. Contrato de moderação abstraído por `ModerationServiceInterface` (implementação: `GeminiModerationService`) — trocar de provedor de IA implica nova implementação dessa interface, não espalhar chamadas Gemini pelo código.
- **Upload de imagem**: `ImageUploadService` faz resize + conversão automática para WebP (Intervention Image).
- **Duplicidade de jogo**: `GameService` detecta jogo parecido e avisa/pede confirmação antes de cadastrar (não bloqueia silenciosamente).
- **Rate limiting**: `throttle:5,1` em registro/login, `throttle:6,1` em cadastro de jogo, `throttle:20,1` em comentários (ver `routes/api.php`).
- **i18n backend**: mensagens de validação/auth/paginação em `lang/pt_BR` e `lang/en`.
- Camadas: Controllers ficam magros, regra de negócio em `app/Services/`; `app/Http/Requests` centraliza validação/autorização; `app/Http/Resources` formata as respostas da API.

### Frontend

- **Data layer**: TanStack Query é a fonte de verdade de estado servidor (`useGamesInfinite`, `useVote`, `useAuth` em `src/hooks/`). Voto é otimista — UI atualiza antes da resposta do servidor, com rollback em erro.
- **Feed principal**: infinite scroll via `useInfiniteQuery` + `react-intersection-observer` (sentinel), consumindo a paginação cursor-based do backend — não trocar para paginação offset sem revisar o backend também.
- **Busca**: debounce (~400ms, `use-debounce`) por título/tag; clicar numa tag filtra a listagem.
- **i18n**: `react-i18next`, pt-BR como padrão (`src/i18n/locales/pt-BR`, `en`), detecção automática do idioma do navegador com fallback.
- **API client**: `src/lib/api.ts` (axios) centraliza a base URL e config; `src/api/*.ts` agrupa chamadas por domínio (auth, games, comments).
- Sessão hidratada via TanStack Query a partir de `/me`; callback de login social tratado em `AuthCallbackPage`.

## Decisões fechadas (não revisitar sem necessidade)

- Stack: Laravel + Sanctum + MariaDB + Sail no backend; React + TS + Vite + Tailwind no frontend — fixado no planejamento original.
- Ranking por saldo líquido (yes − no), não bruto nem percentual.
- Moderação 100% automatizada via Gemini no MVP, sem fila manual de admin.
- Auth social (Google/Discord/Steam) coexiste com local (e-mail/senha).
- i18n pt-BR + inglês desde o início, pt-BR é o padrão.

## Pendências de configuração de ambiente

Não são bugs — dependem de credenciais externas que só o usuário pode gerar: `GOOGLE_CLIENT_ID/SECRET`, `DISCORD_CLIENT_ID/SECRET`, `STEAM_API_KEY`, `GEMINI_API_KEY` em `backend/.env`. Configs atuais (`localhost`, `SESSION_DOMAIN`, CORS) são de desenvolvimento; produção exige ajustar `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` e `*_REDIRECT_URI` dos provedores sociais.
