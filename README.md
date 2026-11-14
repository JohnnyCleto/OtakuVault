# OtakuVault: catálogo de animes e mangás

Aplicativo mobile feito com **React Native + Expo (Expo Go)** para descobrir animes e mangás, salvar favoritos e organizar o que você está assistindo, completou, dropou ou não recomenda. Os dados vêm da **API pública da AniList**, sem necessidade de chave.

Projeto acadêmico da disciplina de aplicativos nativos.

> O nome "OtakuVault" está definido em `src/theme.ts` (`APP_NAME`) e pode ser trocado em um só lugar.

---

## Sumário

1. [Funcionalidades](#funcionalidades)
2. [Telas do aplicativo](#telas-do-aplicativo)
3. [Tecnologias](#tecnologias)
4. [Como rodar](#como-rodar)
5. [Estrutura do projeto](#estrutura-do-projeto)
6. [Como o app funciona por dentro](#como-o-app-funciona-por-dentro)
7. [Dados salvos no aparelho](#dados-salvos-no-aparelho)
8. [Limitações conhecidas](#limitações-conhecidas)
9. [Créditos](#créditos)

---

## Funcionalidades

### Descoberta de conteúdo
- **Início** com quatro seções:
  - *Em alta*: carrossel principal com banners.
  - *Novos episódios*: episódios lançados nos últimos 3 dias, dos mais populares para os menos.
  - *Recém adicionados*.
  - *Mais bem avaliados*.
- **Mangás** com quatro seções: os mais lidos no momento, mais bem avaliados, populares de todos os tempos e recém atualizados.
- **Busca** em tela própria:
  - Campo de pesquisa com espera de 500 ms entre as teclas (debounce), para não gastar requisições.
  - Filtro **Tudo / Animes / Mangás**.
  - Grade de **12 categorias** (Aventura, Ação, Comédia, Drama, Fantasia, Romance, Slice of Life, Sobrenatural, Sci-Fi, Mistério, Esportes e Terror), cada uma com a capa de um título popular do gênero.
- **Lista por categoria** com paginação ("Carregar mais").
- **Detalhes** de qualquer anime ou mangá:
  - Capa, título (inglês e original), nota, posição no ranking, formato, ano, status, episódios ou capítulos e volumes.
  - Gêneros clicáveis, que levam à lista da categoria.
  - Estúdio (anime) ou autoria (mangá), sinopse e link para o trailer, quando existir.
- **Personagens** de cada título, com foto, nome, nome original, papel (Principal, Coadjuvante ou Figurante) e dublador japonês (animes).

### Carrossel
- Arrasta com o dedo e encaixa em cada banner.
- Troca sozinho a cada 5 segundos, e pausa enquanto o usuário arrasta.
- Indicador de posição (bolinhas).
- Na versão web, aparecem setas para clicar.
- A troca automática pode ser desligada em Configurações.

### Organização pessoal
- **Favoritos**: guarde animes e mangás com o botão "Favoritar". A aba tem filtro Tudo/Animes/Mangás e botão X para remover.
- **Minha lista** (inspirada no MyAnimeList): cada título pode ter um status.

  | Status | Anime | Mangá |
  |--------|-------|-------|
  | Em andamento | Assistindo | Lendo |
  | Terminou | Completo | Completo |
  | Abandonou | Dropado | Dropado |
  | Avaliação negativa | Não recomendo | Não recomendo |

  A tela **Minha lista** filtra por status, mostra a contagem de cada um e permite remover itens.

### Conta de usuário
- **Cadastro e login** com validação de campos (e-mail válido, senha com no mínimo 6 caracteres, e-mail único).
- **Sessão persistente**: o app lembra quem está logado ao ser reaberto.
- **Perfil**: avatar com inicial, "sobre mim", contagem de favoritos, contadores da lista por status e data de cadastro ("Membro desde").
- **Editar perfil**: altera nome e "sobre mim" (até 160 caracteres) e a senha.
- Favoritos e lista são **separados por usuário**. Sem login, valem para o "visitante".

### Configurações
- Ligar ou desligar a troca automática do carrossel.
- Atualizar dados da API (limpar o cache).
- Limpar favoritos e limpar a lista (com confirmação).
- Sair da conta.
- Excluir conta, o que apaga também favoritos e lista deste aparelho (com confirmação).
- Informações sobre o app e a fonte dos dados.

### Robustez
- Cada seção carrega de forma independente, com indicador de carregamento e botão **"Tentar de novo"** em caso de erro.
- **Fila de requisições** que respeita o limite da AniList, **retry automático** (até 2 tentativas) para erros de rede, erro 429 e erros 5xx, **timeout de 10 s** por requisição e **cache em memória de 5 minutos**.
- Conteúdo adulto é sempre filtrado nas consultas.

---

## Telas do aplicativo

O app tem **13 telas**: 4 abas e 9 telas de navegação.

| # | Tela | Rota | Origem dos dados |
|---|------|------|------------------|
| 1 | Início | `(tabs)/index` | AniList |
| 2 | Mangás | `(tabs)/mangas` | AniList |
| 3 | Favoritos | `(tabs)/favoritos` | AsyncStorage |
| 4 | Mais (menu) | `(tabs)/mais` | AsyncStorage |
| 5 | Busca e categorias | `busca` | AniList |
| 6 | Lista da categoria | `categoria/[nome]` | AniList |
| 7 | Detalhes do título | `titulo/[id]` | AniList |
| 8 | Personagens | `personagens/[id]` | AniList |
| 9 | Minha lista | `minha-lista` | AsyncStorage |
| 10 | Perfil | `perfil` | AsyncStorage |
| 11 | Editar perfil | `editar-perfil` | AsyncStorage |
| 12 | Configurações | `configuracoes` | AsyncStorage |
| 13 | Login e cadastro | `login` | AsyncStorage |

As rotas com colchetes (`[id]`, `[nome]`) são **rotas dinâmicas**: recebem um parâmetro pela navegação.

---

## Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| [Expo](https://expo.dev) e Expo Go | Ambiente de desenvolvimento e execução no celular |
| React Native e TypeScript | Interface e tipagem |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegação por arquivos (abas, pilha e rotas dinâmicas) |
| [AniList API](https://docs.anilist.co) (GraphQL) | Fonte dos dados de animes, mangás e personagens |
| `@react-native-async-storage/async-storage` | Armazenamento local (contas, favoritos, lista, configurações) |
| `expo-crypto` | Hash SHA-256 das senhas |
| `@expo/vector-icons` | Ícones |
| `react-native-safe-area-context` | Respeito às áreas seguras (notch e barras do sistema) |

---

## Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org) instalado.
- Aplicativo **Expo Go** no celular (Android ou iOS).
- Celular e computador na **mesma rede Wi-Fi**.

### Passo a passo

```bash
# 1. Criar o projeto base e entrar nele
npx create-expo-app@latest anime-app
cd anime-app

# 2. Limpar os arquivos de exemplo do template
npm run reset-project

# 3. Instalar as dependências do projeto
npx expo install @react-native-async-storage/async-storage expo-crypto react-native-safe-area-context @expo/vector-icons

# 4. Substituir a pasta src pela do projeto (apague a src do template antes)

# 5. Iniciar
npx expo start --clear
```

Depois, abra o **Expo Go** no celular e leia o QR code que aparece no terminal.

### Problemas comuns

| Sintoma | O que fazer |
|---------|-------------|
| `Unable to resolve module ...` | Falta instalar um pacote: rode o `npx expo install` do passo 3 |
| Tela de carregamento que não termina | Teste `https://graphql.anilist.co` no navegador do celular. Se não abrir, é problema de rede |
| Celular não conecta ao projeto | Confirme a mesma rede Wi-Fi, ou rode `npx expo start --tunnel` |
| Telas ou abas que não deveriam existir | Sobrou arquivo antigo na pasta `src`: apague a pasta inteira e copie de novo |
| Erros que só aparecem no navegador (tecla `w`) | Teste no Expo Go: o navegador impõe restrições de rede que o app nativo não tem |

---

## Estrutura do projeto

```
src/
├── app/                         # Telas e rotas (Expo Router)
│   ├── _layout.tsx              # Layout raiz: providers e pilha de navegação
│   ├── (tabs)/                  # Grupo das 4 abas
│   │   ├── _layout.tsx          # Barra de abas e cabeçalho (AppHeader)
│   │   ├── index.tsx            # Início
│   │   ├── mangas.tsx           # Mangás
│   │   ├── favoritos.tsx        # Favoritos
│   │   └── mais.tsx             # Menu "Mais"
│   ├── busca.tsx                # Busca + grade de categorias
│   ├── categoria/[nome].tsx     # Lista de uma categoria (gênero)
│   ├── titulo/[id].tsx          # Detalhes de anime ou mangá
│   ├── personagens/[id].tsx     # Personagens de um título
│   ├── minha-lista.tsx          # Lista por status
│   ├── perfil.tsx               # Perfil do usuário
│   ├── editar-perfil.tsx        # Edição de nome, bio e senha
│   ├── configuracoes.tsx        # Configurações do app
│   └── login.tsx                # Login e cadastro
│
├── components/                  # Componentes reutilizáveis
│   ├── AppHeader.tsx            # Cabeçalho: logo, busca e avatar
│   ├── HeroCarousel.tsx         # Carrossel principal (arrasta, encaixa, autoplay)
│   ├── Carousel.tsx             # Seção com lista horizontal e estados de carga/erro
│   ├── TituloCard.tsx           # Card vertical (capa e título)
│   ├── WideCard.tsx             # Card horizontal (banner e título)
│   ├── TituloRow.tsx            # Linha de lista (capa, dados e etiquetas)
│   ├── FilterChips.tsx          # Filtro Tudo / Animes / Mangás
│   ├── StatusPicker.tsx         # Janela para escolher o status na lista
│   ├── StateViews.tsx           # Telas de carregando e de erro
│   └── Placeholder.tsx          # Tela provisória (não é mais usada; pode apagar)
│
├── services/
│   └── anilist.ts               # Cliente da API: fila, retry, timeout, cache e consultas
│
├── storage/                     # Estado global salvo no aparelho (Context + AsyncStorage)
│   ├── auth.tsx                 # Contas, login, sessão, perfil, senha
│   ├── favorites.tsx            # Favoritos por usuário
│   ├── lista.tsx                # Status dos títulos (Assistindo, Completo, ...)
│   └── settings.tsx             # Configurações do app
│
├── hooks/
│   └── useAsync.ts              # Hook que carrega dados e devolve data, loading, error e reload
│
├── utils/
│   └── confirm.ts               # Confirmação "Tem certeza?" (celular e web)
│
├── genres.ts                    # Lista das 12 categorias (nome, rótulo e cor)
├── navigation.ts                # Funções de navegação (abrir título e categoria)
└── theme.ts                     # Cores e nome do app
```

---

## Como o app funciona por dentro

### Navegação
O **Expo Router** cria as rotas a partir dos arquivos em `src/app/`. A pasta `(tabs)` forma a barra inferior com 4 abas, e os demais arquivos são telas empilhadas por cima. Os arquivos `[id].tsx` e `[nome].tsx` recebem parâmetros lidos com `useLocalSearchParams`.

### Consumo da API
Todo o acesso à AniList passa por `src/services/anilist.ts`:

- **`gql()`**: envia a consulta GraphQL e cuida de fila, timeout, retry e cache.
- **`searchMedia()`**: busca genérica (por tipo, ordenação, gênero, texto e página) que alimenta quase todas as telas.
- **Atalhos** como `getTrending`, `getTopRated`, `getNewEpisodes`, `getGenreCovers`, `getTitulo` e `getPersonagens`.
- **`toTitulo()`**: converte a resposta da API para o tipo `Titulo`, usado em todo o app (anime ou mangá). Também limpa o HTML da sinopse e traduz status e formatos.

As telas usam o hook `useAsync`, que executa a chamada, controla `loading` e `error` e oferece `reload`.

### Estado global
Quatro **Contexts** do React, definidos em `src/storage/`, envolvem o app em `_layout.tsx`:

```
SettingsProvider
  └─ AuthProvider
       └─ FavoritesProvider
            └─ ListaProvider
```

Favoritos e lista dependem do usuário logado, por isso ficam dentro do `AuthProvider`. Ao trocar de usuário, os dois recarregam os dados da conta nova.

### Segurança do login
O login é **simulado e local**, adequado para um trabalho acadêmico:
- A senha nunca é salva em texto puro: guarda-se o hash **SHA-256** (com o e-mail como "sal").
- A validação roda no próprio aparelho.
- Para um aplicativo real, a senha deveria ser verificada em um servidor, com um algoritmo próprio para senhas (bcrypt ou Argon2).

---

## Dados salvos no aparelho

Tudo fica no **AsyncStorage**, sem banco de dados externo.

| Chave | Conteúdo |
|-------|----------|
| `users` | Contas: nome, e-mail, hash da senha, data de cadastro e bio |
| `session` | E-mail de quem está logado |
| `favorites_v2:<email>` | Favoritos do usuário (ou `visitante`) |
| `lista_v1:<email>` | Títulos com status do usuário (ou `visitante`) |
| `settings_v1` | Configurações do app (troca automática do carrossel) |

---

## Limitações conhecidas

- **Dados só no aparelho**: contas, favoritos e lista não sincronizam entre celulares e se perdem ao limpar os dados do app ou desinstalá-lo.
- **Sem recuperação de senha**, porque não há servidor.
- **Dependência da AniList**: sem internet ou com a API fora do ar, as telas mostram erro com o botão "Tentar de novo". Só o que já estiver no cache de 5 minutos continua aparecendo.
- **Limite da API**: cerca de 90 requisições por minuto. A fila interna evita estourar esse limite.
- **Gêneros em inglês** dentro da tela de detalhes, porque é assim que a API os devolve (as 12 categorias da busca têm rótulos em português).
- **Sem reprodução de episódios ou leitura de capítulos**: o app é um catálogo e organizador.

---

## Créditos

- Dados de animes e mangás: **[AniList](https://anilist.co)**, via API pública GraphQL.
- Ícones: [Ionicons](https://ionic.io/ionicons), pelo pacote `@expo/vector-icons`.
- Layout inspirado em apps de catálogo de animes. O nome, a identidade visual e o código são originais deste projeto.
