# Gamervox

## Propósito

Plataforma onde gamers cadastram jogos antigos sem remake/continuação (ex: Breath of Fire) e a comunidade vota **Sim/Não** se quer o retorno da IP. Cada usuário vota uma vez por jogo (pode trocar o voto). A listagem principal fica ordenada pelos jogos com mais saldo de votos no topo, carregando de 20 em 20 via infinite scroll. Há busca por título/tags e cada jogo tem página própria com comentários da comunidade.

A ideia por trás do nome: **Gamer** (protagonismo, quem joga e decide) + **VOX** (do latim *vox populi*, a voz coletiva) — uma plataforma onde a comunidade gamer usa sua voz coletiva para pressionar/demonstrar interesse às publishers sobre IPs esquecidas.

## O que foi pedido

- Cadastro/login de jogadores, **de preferência via login social**.
- Cadastro de jogo: imagem, descrição, links de redes sociais da empresa dona da IP, tags opcionais.
- Voto Sim/Não por jogo, um voto por usuário, sem duplicidade.
- Listagem ordenada decrescente por votos, carregando 20 em 20 (infinite scroll).
- Barra de busca filtrando por título e tags.
- Página própria por jogo com comentários dos usuários cadastrados.
- Stack definida: backend Laravel + Sanctum + MariaDB + Sail; frontend React + TypeScript + Vite + TailwindCSS.

Decisões adicionais fechadas durante o planejamento:
- **Ranking**: saldo líquido (votos Sim − votos Não), não só bruto nem percentual.
- **Moderação de cadastro**: automatizada via IA (Google Gemini), sem fila manual de admin no MVP.
- **Login social**: Google + Discord + Steam.
- **i18n**: pt-BR e inglês desde o início, pt-BR como padrão.
- **Auth**: social + local (e-mail/senha) coexistindo.
- Estrutura em **monorepo** (`backend/` + `frontend/` na mesma raiz).

## O que foi feito

### Backend (`backend/`) — Laravel 13 + Sail + MariaDB + Sanctum

- **Auth**: registro/login/logout local (sessão Sanctum) + login social Google/Discord/Steam via Socialite (`socialiteproviders/steam` pro fluxo OpenID do Steam, que não tem e-mail e nunca casa conta por e-mail). Conta social casa com usuário existente pelo e-mail quando possível.
- **Jogos**: CRUD com slug único, detecção de duplicidade (avisa e pede confirmação antes de cadastrar jogo parecido), upload de imagem com resize + conversão automática para WebP (Intervention Image), tags opcionais (many-to-many), links sociais da IP.
- **Votos**: tabela com constraint única `(user_id, game_id)` — impede voto duplicado, trocar o voto faz update. Contadores (`yes_votes_count`, `no_votes_count`, `net_score`) cacheados na tabela `games` via `VoteObserver`, atualizados atomicamente (sem `COUNT()` a cada listagem).
- **Listagem**: paginação **cursor-based** (não offset) — escolhida porque `net_score` muda com frequência e paginação offset duplicaria/pularia itens durante o infinite scroll.
- **Moderação via Gemini**: job assíncrono (`ModerateGameJob`, com retry/backoff) avalia cada jogo cadastrado (texto + imagem) e aprova/rejeita automaticamente; comentários passam por moderação síncrona (texto). Endpoint admin (`PATCH /api/admin/games/{id}/moderate`) permite override manual quando a IA falha ou erra.
- **Comentários**: por jogo aprovado, com a mesma moderação por IA.
- **Rate limiting**: nas rotas de login/registro, cadastro de jogo e comentários.
- **i18n backend**: mensagens de validação/auth/paginação traduzidas em `lang/pt_BR` e `lang/en`.
- **Testes**: 41 testes de Feature/Unit (Pest/PHPUnit) cobrindo auth local e social, votos (incluindo troca e remoção de voto), cadastro de jogo, moderação (sucesso/falha/fallback), comentários, rate limit e override admin. Todos passando, Pint sem violações de estilo.

### Frontend (`frontend/`) — React + TypeScript + Vite + TailwindCSS v4

- **i18n**: `react-i18next` com pt-BR (padrão) e inglês, detecção automática do idioma do navegador com fallback.
- **Auth**: tela de login/cadastro local + botões de login social (Google/Discord/Steam), sessão hidratada via TanStack Query.
- **Feed principal**: infinite scroll (`useInfiniteQuery` + `react-intersection-observer`), cards de jogo com voto otimista (atualiza a UI sem esperar resposta do servidor).
- **Busca**: input com debounce (~400ms) por título/tag; clicar numa tag filtra a listagem.
- **Cadastro de jogo**: formulário com upload de imagem, tags, aviso de duplicidade com confirmação.
- **Página de detalhe do jogo**: descrição, tags, links sociais, status de moderação (visível pro autor/admin), votação, comentários.
- **"Minhas publicações"**: lista os jogos cadastrados pelo usuário com status (em análise/aprovado/rejeitado) e motivo da rejeição.
- **Build/lint**: `npm run build` e `npm run lint` passando sem erros; `tsc --noEmit` limpo.

Todos os fluxos principais (registro, login local e social parcialmente, cadastro de jogo, voto, busca, filtro por tag, comentário, listagem "minhas publicações") foram testados manualmente em navegador real durante o desenvolvimento.

## Tecnologias usadas

**Backend**
- Laravel 13 + Laravel Sail (Docker)
- MariaDB 11 + Redis
- Laravel Sanctum (auth SPA via cookie/sessão)
- Laravel Socialite + `socialiteproviders/manager` + `socialiteproviders/steam`
- `google-gemini-php/laravel` (moderação de conteúdo via IA)
- `intervention/image` + `intervention/image-laravel` (resize e conversão WebP)
- Pest/PHPUnit + Laravel Pint

**Frontend**
- React 19 + TypeScript + Vite
- TailwindCSS v4 (`@tailwindcss/vite`, arquitetura de tokens com `@theme inline`)
- TanStack Query (`useInfiniteQuery`, cache otimista)
- React Router
- `react-i18next` + `i18next-browser-languagedetector`
- `react-intersection-observer` (sentinel do infinite scroll)
- `use-debounce` (debounce da busca)
- Axios

## O que precisa ser configurado por você

Tudo já está implementado e testado, mas alguns valores dependem de credenciais externas que só você pode gerar:

1. **Login social** — em `backend/.env`, preencher:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (Google Cloud Console)
   - `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` (Discord Developer Portal)
   - `STEAM_API_KEY` (steamcommunity.com/dev/apikey)

2. **Moderação por IA** — em `backend/.env`:
   - `GEMINI_API_KEY` (Google AI Studio: aistudio.google.com/app/apikey)
   - Sem essa chave, todo jogo cadastrado fica em status `pending` indefinidamente (o job falha e mantém pendente pra override manual), e comentários são recusados (fail-closed).

3. **Worker da fila** — a moderação de jogos é assíncrona (`QUEUE_CONNECTION=database`). É preciso rodar, com os containers do Sail de pé:
   ```
   cd backend && ./vendor/bin/sail artisan queue:work
   ```
   Sem isso, os jobs de moderação ficam parados na tabela `jobs` esperando um worker.

4. **Subir o ambiente** (containers já configurados, só rodar):
   ```
   cd backend && ./vendor/bin/sail up -d
   cd frontend && npm run dev
   ```
   Backend em `http://localhost:8000`, frontend em `http://localhost:5173`.

5. **Admin** — não existe UI de admin nem seed de usuário admin. Pra usar o override manual de moderação, marcar `is_admin = true` manualmente no banco (via `sail artisan tinker` ou client de DB) pro usuário desejado.

6. **Git** — repositório inicializado (`git init`) mas **nenhum commit foi feito ainda**. Os arquivos estão prontos para o primeiro commit quando você decidir.

7. **Produção** — configurações atuais são de desenvolvimento (URLs `localhost`, `SESSION_DOMAIN=localhost`, CORS liberado só pro frontend local). Pra produção, ajustar `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` (domínio-pai comum entre front e back) e as `*_REDIRECT_URI` dos provedores sociais.
