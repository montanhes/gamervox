# Deploy do Gamervox

Guia de instalação em servidor de produção + referência completa de variáveis de ambiente.

**Arquitetura**: monorepo com `backend/` (Laravel 13, API + rotas de share/OG) e `frontend/` (React SPA, build estático). Em produção o frontend vira arquivos estáticos servidos pelo Nginx; o backend roda em PHP-FPM com MariaDB, fila e scheduler.

---

## 1. Variáveis de ambiente

### 1.1 `backend/.env`

Copie de `backend/.env.example` e ajuste. Agrupado por prioridade:

#### Essenciais (obrigatórias em produção)

| Variável | Valor em produção | Observação |
|---|---|---|
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | Nunca `true` em produção |
| `APP_KEY` | — | Gerada por `php artisan key:generate` |
| `APP_URL` | `https://api.seudominio.com` | URL pública do backend (usada nos links de OG/share) |
| `FRONTEND_URL` | `https://seudominio.com` | URL pública do SPA (redirects de share, links de e-mail, callback social) |
| `SANCTUM_STATEFUL_DOMAINS` | `seudominio.com` | Domínio do SPA, sem protocolo. Vários: separar por vírgula |
| `SESSION_DOMAIN` | `.seudominio.com` | Ponto na frente se API e SPA são subdomínios do mesmo domínio |
| `APP_LOCALE` | `pt_BR` | |

> API e SPA precisam compartilhar domínio-raiz (ex.: `seudominio.com` + `api.seudominio.com`) — a autenticação é por cookie de sessão (Sanctum SPA). Domínios totalmente diferentes não funcionam.

#### Banco de dados

| Variável | Exemplo | Observação |
|---|---|---|
| `DB_CONNECTION` | `mariadb` | |
| `DB_HOST` | `127.0.0.1` | No Sail é `mariadb`; em servidor, o host real |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `gamervox` | |
| `DB_USERNAME` / `DB_PASSWORD` | — | Criar usuário dedicado |

#### Fila, cache e sessão

| Variável | Produção | Observação |
|---|---|---|
| `QUEUE_CONNECTION` | `database` (ou `redis`) | **Obrigatório worker rodando** — moderação de jogos, notificações e digest são assíncronos |
| `CACHE_STORE` | `database` (ou `redis`) | |
| `SESSION_DRIVER` | `database` | |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | — | Só se usar Redis |

#### E-mail (notificações de moderação + digest semanal)

| Variável | Exemplo | Observação |
|---|---|---|
| `MAIL_MAILER` | `smtp` | `log` desativa envio real (dev) |
| `MAIL_HOST` / `MAIL_PORT` | conforme provedor | |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | — | |
| `MAIL_FROM_ADDRESS` | `no-reply@seudominio.com` | |
| `MAIL_FROM_NAME` | `Gamervox` | |

#### Integrações externas (chaves que só você pode gerar)

| Variável | Onde gerar | O que quebra sem ela |
|---|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey | **Crítico**: jogos ficam `pending` pra sempre (moderação por IA) |
| `RAWG_API_KEY` | https://rawg.io/apidocs | Autofill de título/descrição/capa no cadastro (degrada silenciosamente) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | https://console.cloud.google.com (OAuth 2.0) | Login com Google |
| `GOOGLE_REDIRECT_URI` | `https://api.seudominio.com/auth/google/callback` | Cadastrar a mesma URL no console do Google |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | https://discord.com/developers/applications | Login com Discord |
| `DISCORD_REDIRECT_URI` | `https://api.seudominio.com/auth/discord/callback` | Cadastrar no app do Discord |
| `STEAM_API_KEY` | https://steamcommunity.com/dev/apikey | Login com Steam |
| `STEAM_REDIRECT_URI` | `https://api.seudominio.com/auth/steam/callback` | |

Login local (e-mail/senha) funciona sem nenhuma chave social.

### 1.2 `frontend/.env` (usado no build)

| Variável | Valor em produção |
|---|---|
| `VITE_API_URL` | `https://api.seudominio.com` |

É embutida no build — mudou a URL, refaça `npm run build`.

---

## 2. Passo a passo de instalação (Ubuntu 24.04 + Nginx)

### 2.1 Dependências do sistema

```bash
sudo apt update
sudo apt install -y nginx mariadb-server \
  php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring php8.3-xml \
  php8.3-curl php8.3-gd php8.3-zip php8.3-intl php8.3-bcmath \
  fonts-dejavu-core git unzip

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node 20+ (pra buildar o frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

> `php8.3-gd` e `fonts-dejavu-core` são necessários pros cards OG (imagem de compartilhamento). Sem a fonte, o card sai sem texto (fallback gracioso, mas feio).

### 2.2 Banco de dados

```bash
sudo mysql
```

```sql
CREATE DATABASE gamervox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gamervox'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON gamervox.* TO 'gamervox'@'localhost';
FLUSH PRIVILEGES;
```

### 2.3 Código e backend

```bash
sudo mkdir -p /var/www/gamervox && sudo chown $USER /var/www/gamervox
git clone SEU_REPOSITORIO /var/www/gamervox
cd /var/www/gamervox/backend

composer install --no-dev --optimize-autoloader

cp .env.example .env
nano .env                      # preencher conforme a seção 1
php artisan key:generate

php artisan migrate --force
php artisan storage:link       # capas e cards OG são servidos de storage/app/public

# Cache de config/rotas/views
php artisan config:cache route:cache view:cache 2>/dev/null || {
  php artisan config:cache && php artisan route:cache && php artisan view:cache; }

# Permissões
sudo chown -R www-data:www-data storage bootstrap/cache
```

### 2.4 Build do frontend

```bash
cd /var/www/gamervox/frontend
echo "VITE_API_URL=https://api.seudominio.com" > .env
npm ci
npm run build                  # gera frontend/dist
```

### 2.5 Nginx

Dois server blocks: SPA e API.

`/etc/nginx/sites-available/gamervox-front`:

```nginx
server {
    listen 80;
    server_name seudominio.com;
    root /var/www/gamervox/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA: rotas caem no index
    }
}
```

`/etc/nginx/sites-available/gamervox-api`:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;
    root /var/www/gamervox/backend/public;
    index index.php;
    client_max_body_size 8M;               # upload de capa até 4MB + margem

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gamervox-front /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/gamervox-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 2.6 HTTPS (obrigatório — cookies de sessão cross-subdomínio)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d api.seudominio.com
```

### 2.7 Worker da fila (systemd)

Sem isso: moderação de jogos parada, sem notificações, sem e-mails.

`/etc/systemd/system/gamervox-worker.service`:

```ini
[Unit]
Description=Gamervox queue worker
After=network.target

[Service]
User=www-data
Restart=always
RestartSec=3
WorkingDirectory=/var/www/gamervox/backend
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gamervox-worker
```

### 2.8 Scheduler (cron)

Roda o digest semanal (segunda 12h) e o avanço automático da Copa (de hora em hora).

```bash
sudo crontab -u www-data -e
# adicionar:
* * * * * cd /var/www/gamervox/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 3. Pós-instalação

1. **Criar o primeiro admin** — não há UI de admin; direto no banco:
   ```sql
   UPDATE users SET is_admin = 1 WHERE email = 'voce@exemplo.com';
   ```
2. **Cadastrar as redes sociais reais** do Gamervox no rodapé — constante `FOOTER_SOCIALS` em `frontend/src/App.tsx` (URLs placeholder hoje).
3. **Selo "Anunciado!"** (IP ganhou remake real) — manual no banco:
   ```sql
   UPDATE games SET announced_at = NOW() WHERE slug = 'slug-do-jogo';
   ```
4. **Iniciar uma Copa dos Remakes**:
   ```bash
   php artisan gamervox:cup-start "Copa dos Remakes" --size=8 --days=3
   # avanço acontece sozinho pelo scheduler; manual: php artisan gamervox:cup-advance --force
   ```
5. **Testar OG/share**: colar `https://api.seudominio.com/share/games/{slug}` no https://cards-dev.twitter.com/validator ou no Discord e conferir o card.
6. **Testar fluxo completo**: registro → cadastro de jogo (com autofill RAWG) → moderação aprova (worker!) → notificação chega → voto → compartilhar.

## 4. Deploy de atualizações

```bash
cd /var/www/gamervox
git pull

cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
sudo systemctl restart gamervox-worker    # workers precisam reiniciar pra pegar código novo

cd ../frontend
npm ci && npm run build
```
