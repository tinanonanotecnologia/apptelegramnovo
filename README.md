# Telegram Hub

Hub de descoberta do Telegram com interface Nebula Glass, busca e filtros, favoritos, avaliações, moderação e suporte a Progressive Web App.

## Recursos

- Diretório de canais, grupos, bots e pacotes de stickers, organizado por categorias.
- Busca por nome, identificador, descrição e tags; filtros por categoria, tipo e idioma.
- Favoritos locais, avaliações, QR codes, compartilhamento e roleta de descoberta.
- Cadastro e moderação de links com autenticação de administrador.
- PWA instalável com manifest, ícones e cache offline.
- PostgreSQL com Drizzle ORM.

## Requisitos

- Node.js 20.9 ou superior.
- PostgreSQL acessível pela aplicação.

## Desenvolvimento local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e configure a URL do seu PostgreSQL e as credenciais de moderação. Não compartilhe nem faça commit do arquivo `.env`.

3. Aplique o esquema ao banco de dados:

   ```bash
   npx drizzle-kit push
   ```

4. Inicie a aplicação:

   ```bash
   npm run dev
   ```

A aplicação ficará disponível em `http://localhost:3000`.

## Credenciais do painel de moderação

Configure no servidor:

- `ADMIN_USERNAME`: usuário escolhido pelo administrador.
- `ADMIN_PASSWORD`: senha forte e exclusiva.
- `ADMIN_SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres; pode ser gerado com `openssl rand -hex 32`.

Não existem credenciais padrão embutidas. O painel permanece bloqueado até que as três variáveis estejam configuradas. A sessão de administração expira após oito horas.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | URL de conexão PostgreSQL. |
| `ADMIN_USERNAME` | Usuário do painel de moderação. |
| `ADMIN_PASSWORD` | Senha do painel de moderação. |
| `ADMIN_SESSION_SECRET` | Chave de assinatura das sessões, com pelo menos 32 caracteres. |

Configure essas variáveis também no ambiente de implantação; arquivos `.env` locais não fazem parte do repositório.

## Verificações

```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build
```

## Publicação no GitHub

Este projeto foi preparado com `.gitignore`; inicialize um repositório Git, crie um repositório vazio no GitHub e configure-o como remoto antes de enviar a branch `main`. Nunca adicione `.env`, senhas, tokens ou arquivos de chave ao commit.

## Deploy gratuito com Vercel e Neon

Consulte [`docs/DEPLOY_VERCEL_NEON.md`](docs/DEPLOY_VERCEL_NEON.md) para conectar um PostgreSQL Neon pelo Marketplace da Vercel, configurar as variáveis de ambiente e aplicar o schema.

## Empacotamento Android

O projeto é uma PWA e não inclui um projeto Android nativo. Para gerar o aplicativo Android com Trusted Web Activity/Bubblewrap, siga [`docs/ANDROID_TWA.md`](docs/ANDROID_TWA.md) depois que a aplicação estiver publicada em HTTPS.
