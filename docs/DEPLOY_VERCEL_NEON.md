# Deploy do Telegram Hub com Vercel e Neon

O Telegram Hub usa PostgreSQL por meio da variável `DATABASE_URL`. A configuração mais simples para um deploy gratuito é conectar um projeto Neon ao projeto da Vercel pelo Marketplace.

## Criar o projeto

1. Envie o conteúdo do projeto para um repositório privado ou público no GitHub.
2. Na Vercel, importe o repositório e mantenha o framework detectado como Next.js.
3. No projeto da Vercel, abra **Storage/Marketplace**, instale **Neon** e crie um banco no plano disponível para sua conta.
4. Autorize a integração a preencher as variáveis de ambiente do projeto. Confirme que `DATABASE_URL` está disponível em Development, Preview e Production conforme a necessidade.

O produto antigo Vercel Postgres não deve ser usado para novos projetos; a integração atual de PostgreSQL é feita por provedores do Marketplace.

## Variáveis obrigatórias

Configure também, diretamente na Vercel:

```text
ADMIN_USERNAME=um_usuario_admin
ADMIN_PASSWORD=uma_senha_forte
ADMIN_SESSION_SECRET=um_segredo_aleatorio_com_32_caracteres_ou_mais
```

Nunca coloque esses valores no GitHub. O arquivo `.env.example` contém apenas placeholders.

## Criar as tabelas

Para preparar o banco localmente usando a mesma conexão do Neon:

```bash
npm install
npm run db:push
```

O primeiro acesso à aplicação também dispara o seed inicial quando as tabelas estiverem vazias. Para repetir o seed manualmente, autentique-se no painel de moderação e use o endpoint protegido de seed; não deixe esse endpoint aberto sem as credenciais administrativas.

## Deploy e teste

Depois do primeiro deploy, teste:

- `/api/health`, para confirmar a conexão;
- carregamento de categorias e links;
- login do painel de moderação;
- criação de um link, que deve entrar como pendente;
- aprovação pelo painel;
- avaliações, denúncias e resolução de denúncias;
- instalação PWA e atalhos do manifest.

Use o domínio HTTPS final da Vercel como origem do TWA Android. Não use `localhost` na configuração do Bubblewrap.
