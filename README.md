# ⛩️ OtakuVault

> Um aplicativo mobile moderno desenvolvido em **React Native (Expo Go)** para gerenciamento de listas de animes e mangás, integrando a **AniList API** e persistência de dados local.

---

## 📱 Sobre o Projeto
O **OtakuVault** é um aplicativo projetado para entusiastas da cultura otaku explorarem catálogos em tempo real, acompanharem lançamentos de episódios e gerenciarem suas próprias coleções de animes e mangás de forma fluida e intuitiva. 

O projeto conta com arquitetura modular, Dark Mode nativo e navegação baseada em arquivos (`Expo Router`).

---

## 🛠️ Tecnologias Utilizadas
* **Framework:** React Native / Expo (SDK 58)
* **Navegação:** Expo Router (File-based Routing & Bottom Tabs)
* **Persistência Local:** AsyncStorage (Para perfil, configurações e favoritos salvos offline)
* **API Externa:** [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)
* **Estilização & Ícones:** StyleSheet nativo + `@expo/vector-icons`

---

## 📂 Arquitetura de Telas (As 12 Páginas do Sistema)

O fluxo de navegação do aplicativo distribui-se entre abas principais e rotas empilhadas (Stack):

### Navegação Principal (Abas)
1. **Início (`/(tabs)/index`)** — Feed principal contendo seções de *Em alta*, *Novos episódios* e *Recém adicionados*.
2. **Mangás (`/(tabs)/mangas`)** — Seção dedicada aos quadrinhos com abas para *Mais lidos*, *Recomendados* e *Recém atualizados*.
3. **Favoritos / Minha Lista (`/(tabs)/favoritos`)** — Central de itens salvos com cartões de capa, ano, tags de tipo (*Anime/Mangá*), botão de exclusão rápida e filtro dinâmico (*Tudo / Animes / Mangás*).
4. **Menu / Mais (`/(tabs)/mais`)** — Central de controle com card do usuário, atalhos para perfil, configurações, créditos e encerramento de sessão.

### Rotas de Exploração e Detalhes
5. **Busca e Categorias (`/busca`)** — Tela de pesquisa em tempo real combinada com uma grade colorida de gêneros.
6. **Lista de Resultados / Categoria (`/categoria/[slug]`)** — Exibição filtrada de obras obtidas através da busca ou de um gênero selecionado.
7. **Detalhes da Obra (`/anime/[id]`)** — Visão completa com sinopse, pontuação, estúdio, banner e botões de ação.
8. **Lista de Personagens (`/personagens/[id]`)** — Exibição do elenco e personagens associados à obra.

### Área do Usuário e Ajustes
9. **Perfil do Usuário (`/perfil`)** — Tela de exibição com avatar personalizado, destaques de favoritos e data de cadastro (*Membro desde*).
10. **Editar Perfil (`/editar-perfil`)** — Formulário para alteração de nome de usuário e biografia, sincronizado com o armazenamento local.
11. **Configurações (`/configuracoes`)** — Painel de ajustes gerais do app, incluindo a opção de limpar dados e favoritos salvos.
12. **Login e Cadastro (`/login`)** — Tela inicial de autenticação simulada para identificação de sessão no dispositivo.

---

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para clonar e testar o **OtakuVault** no seu celular via **Expo Go**:

### Pré-requisitos
* Node.js instalado na máquina.
* Aplicativo **Expo Go** instalado no seu smartphone (Android ou iOS).

### Passo a Passo
1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/OtakuVault.git](https://github.com/SEU-USUARIO/OtakuVault.git)