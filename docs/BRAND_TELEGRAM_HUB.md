# Identidade Visual Oficial — Telegram Hub

## Conceito da marca

**Telegram Hub** é o ponto de encontro para descobrir, organizar e compartilhar comunidades do Telegram. A marca combina a ideia de um **hub** — um centro que conecta pessoas e interesses — com uma atmosfera **Nebula Glass**, formada por camadas de vidro translúcido, órbitas e luzes de uma nebulosa.

**Assinatura principal:** `Descubra. Conecte. Compartilhe.`

**Promessa:** encontrar comunidades relevantes com clareza, curadoria e uma experiência visual memorável.

**Personalidade:** exploradora, conectada, confiável, tecnológica e acolhedora.

## Símbolo e logo

O símbolo oficial é um hub orbital: um núcleo em forma de **H** conectado a três pontos de uma órbita. O núcleo representa o Telegram Hub; os pontos representam comunidades, categorias e pessoas; as órbitas representam descoberta e conexão contínuas.

Arquivos oficiais:

- `public/brand/telegram-hub-mark.svg`: símbolo vetorial editável.
- `public/icons/icon-512.png`: ícone principal para Android/PWA.
- `public/icons/icon-maskable-512.png`: ícone adaptável com área segura.
- `public/brand/telegram-hub-feature-1024x500.png`: banner da Play Store.
- `public/brand/telegram-hub-splash-1080x1920.png`: splash vertical para Android.

O símbolo deve manter uma área livre mínima equivalente a 12% do lado do ícone. Não aplicar sombras externas fortes, distorcer a órbita ou usar o símbolo sobre fundos com baixo contraste.

## Paleta Nebula Glass

| Função | Nome | Hex |
| --- | --- | --- |
| Fundo principal | Nebula Navy | `#070B16` |
| Superfície profunda | Midnight | `#0D162D` |
| Ação e links | Cyan Signal | `#38BDF8` |
| Azul de conexão | Telegram Blue | `#229ED9` |
| Contraste secundário | Electric Indigo | `#818CF8` |
| Brilho espacial | Nebula Violet | `#A855F7` |
| Destaque suave | Lavender Glow | `#C084FC` |
| Texto principal | Ice White | `#F8FAFC` |
| Texto secundário | Star Mist | `#94A3B8` |
| Sucesso | Aurora Green | `#34D399` |
| Atenção | Solar Amber | `#FBBF24` |
| Erro/recusa | Rose Nova | `#FB7185` |

Superfícies de vidro usam branco entre 8% e 14% de opacidade, bordas entre 10% e 20% e `backdrop-filter: blur(16px–24px)`. O cyan é reservado para ações primárias, links e estados ativos; o violeta serve para descoberta e agrupamento; amber, green e rose permanecem reservados para estados semânticos.

## Tipografia

- **Títulos e wordmark:** Sora ou Space Grotesk, peso 700–800, com tracking levemente fechado.
- **Interface e textos:** Inter ou Geist Sans, peso 400–600.
- **Handles, IDs e URLs:** JetBrains Mono ou uma pilha monoespaçada do sistema.

No aplicativo, a pilha de fallback deve continuar funcionando sem download de fonte: `Sora, Inter, system-ui, sans-serif` para títulos e `Inter, system-ui, sans-serif` para interface.

## Materiais Android e Play Store

- **Ícone:** PNG 512×512, sem texto, com o símbolo centralizado e safe area de pelo menos 72% do canvas. O arquivo maskable deve preservar o mesmo núcleo sem encostar nas bordas.
- **Splash screen:** 1080×1920, fundo Nebula Glass, símbolo central, wordmark “Telegram Hub” e a assinatura abaixo. A composição deve permanecer legível em telas 9:16.
- **Feature graphic:** 1024×500, texto no terço esquerdo e símbolo no terço direito. Não colocar informações essenciais nos 5% extremos da imagem.
- **Screenshots:** 1080×1920, usando o fundo `#070B16`, cards translúcidos, cyan para ações e violetas para coleções.

Os assets gerados ficam em `public/brand` e podem ser regenerados com:

```bash
npm run generate:icons
npm run generate:brand
```

## Sistema de categorias

As categorias existentes seguem a mesma semântica de cor e podem continuar no catálogo:

| Categoria | Ícone | Direção cromática |
| --- | --- | --- |
| Tecnologia & IA | Cpu | cyan → indigo |
| Promoções & Cupons | Tag | amber → orange |
| Bots & Ferramentas | Bot | violet → pink |
| Cursos & Estudos | GraduationCap | emerald → teal |
| Filmes & Séries | Film | rose → red |
| Cripto & Web3 | Coins | yellow → amber |
| Vagas & Carreira | Briefcase | blue → sky |
| Memes & Humor | Smile | fuchsia → purple |
| Figurinhas & Stickers | Sparkles | indigo → pink |
| Notícias & Mídia | Newspaper | slate → zinc |
| Jogos & Gaming | Gamepad2 | violet → blue |
| Design & Wallpapers | Palette | teal → sky |

## Voz da marca

Usar frases curtas, úteis e convidativas: “Encontre seu próximo hub”, “Explore por interesse” e “Link enviado para moderação”. Evitar linguagem agressiva, promessas de número de membros ou afirmações de que uma comunidade é oficial sem verificação.

## Aplicação no produto

O tema padrão é Nebula Glass. O cabeçalho usa o símbolo orbital e o wordmark Telegram Hub; cards recebem brilho discreto no hover; filtros usam cyan; coleções usam violeta; status de aprovação usa verde, pendência amber e recusa rose. O nome interno de cookies e chaves locais foi preservado para não apagar sessões e favoritos existentes durante a troca de marca.
