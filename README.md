# Projeto Tons & Cores — site

Site estático em HTML, CSS e JavaScript puro (sem build, sem dependências de runtime).

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Conteúdo e estrutura semântica do site. |
| `style.css` | Identidade visual, layout responsivo e animações. |
| `script.js` | Menu, formulário de indicação, PIX/WhatsApp, transparência e contatos. |
| `hero.js` | Interação da primeira seção: logo, galeria e modal de história. |
| `stories.js` | Dados reais das histórias (fonte única de conteúdo). |
| `config.js` | Configurações de contato, PIX, transparência, formulário e logo. |

## Conteúdo e configuração

1. **Logo oficial** — os arquivos estão em `assets/`:
   - `logo-tons-e-cores.png` — original, preservado;
   - `logo-tons-e-cores.webp` — versão otimizada usada no hero;
   - `logo-tons-e-cores-nav.webp` — versão reduzida usada na navbar;
   - `favicon.png` — ícone do site;
   - `og-tons-e-cores.jpg` — imagem de compartilhamento (Open Graph).

   O caminho da logo do hero é definido em `config.js` (`brandLogo`). A imagem é
   exibida com `object-fit: contain`, sem deformação.
2. **Histórias reais** — `stories.js` está vazio de propósito. A galeria exibe
   um estado editorial "Histórias em breve" até que pessoas e famílias
   autorizem a publicação. Não preencha com dados fictícios.
3. **Fotografias** — coloque os arquivos em `assets/historias/` e referencie em
   `stories.js`. Otimize antes de publicar (JPG/WebP, até ~1600 px de largura).
4. **Vídeos e depoimentos** — só aparecem quando `video` ou `testimonials`
   existirem no registro da história. Nenhum vídeo genérico é usado.
5. **Doações via Pix** — preencha `pixKey` em `config.js`. Enquanto a chave
   estiver vazia, o botão "Gerar chave PIX!" abre o WhatsApp como fallback, com
   uma mensagem pronta para solicitar a chave.
6. **Portal de transparência** — preencha `transparencyUrl` em `config.js` com o
   link real da planilha, painel ou portal. Enquanto estiver vazio, o botão
   "Acessar portal" fica oculto e o site informa que o portal estará disponível
   em breve.
7. **Links legais** — Política de Privacidade e Termos de Uso ainda aparecem
   como pendentes no rodapé e precisam ser definidos antes da publicação final.
8. **Imagens das seções** — as fotos genéricas foram removidas. As seções sem
   imagem do projeto exibem o placeholder "Imagem em breve"; apenas os arquivos
   enviados pelo projeto (logo e imagem de arquitetura) continuam em uso no site.

## Como cadastrar uma história

Edite `stories.js` e adicione um objeto ao array. O próprio arquivo contém o
schema comentado. Resumo:

```js
window.TONS_E_CORES_STORIES = [
  {
    id: "identificador-unico",
    name: "Nome ou identificação autorizada",
    summary: "Resumo curto.",
    narrative: "Relato mais longo (opcional).\n\nNovo parágrafo.",
    visitContext: "Como foi a visita do projeto.",
    cover: { src: "assets/historias/capa.jpg", alt: "Descrição da foto." },
    photos: [
      { src: "assets/historias/foto-1.jpg", alt: "Descrição da foto." },
      { src: "assets/historias/foto-2.jpg", alt: "Descrição da foto.",
        thumbnail: "assets/historias/mini-2.jpg" }
    ],
    video: {
      src: "assets/historias/depoimento.mp4",
      type: "video/mp4",
      poster: "assets/historias/poster.jpg",
      alt: "Descrição do depoimento.",
      caption: "Crédito ou legenda (opcional).",
      tracks: [
        { src: "assets/historias/depoimento.vtt", language: "pt-BR",
          label: "Português", default: true }
      ]
    },
    testimonials: [
      { author: "Identificação autorizada", text: "Fala real." }
    ],
    authorization: true
  }
];
```

**Privacidade:** apenas registros com `authorization: true` são renderizados.
Não publique endereços, documentos, diagnósticos, renda ou situações pessoais
sem autorização explícita. O modal informa que o conteúdo é publicado com
autorização.

## Comportamentos implementados

- Desktop: hover na área da logo revela a galeria; ao sair sem selecionar, a
  logo retorna. O foco do teclado também mantém a galeria aberta.
- Toque: tocar na logo revela a galeria; o botão "Fechar" e o toque fora da
  área encerram a experiência.
- Teclado: `Tab` alcança a logo, `Enter`/`Espaço` revela a galeria,
  `Esc` fecha a galeria ou o modal. Ao fechar o modal, o foco retorna ao card
  que abriu a história.
- Carrossel: navegação por setas e indicadores; troca automática a cada 10 s
  (pausável, desativada em `prefers-reduced-motion` e ao navegar pelo teclado).
- Modal: `<dialog>` nativo, foco controlado, fecha por `Esc`, clique no fundo
  ou botão; vídeos são pausados e o conteúdo é liberado ao fechar.
- Imagens: capa com `object-fit: cover` na galeria; modal com galeria,
  miniaturas, navegação e link para ampliar. Miniaturas usam carregamento
  preguiçoso.
- Sem histórias: estado editorial discreto, sem pessoas fictícias.
- Doações: sem `pixKey` configurada, o botão "Gerar chave PIX!" abre o WhatsApp
  com uma mensagem pronta para solicitar a chave; ao configurar `pixKey`, o fluxo
  de exibição e cópia da chave volta a funcionar.
- Transparência: o botão "Acessar portal" só aparece quando `transparencyUrl`
  estiver preenchido; caso contrário, o site informa que o portal estará
  disponível em breve.
- Menu mobile: fecha com `Esc`, clique fora ou seleção de um link; o rótulo
  acessível alterna entre "Abrir menu" e "Fechar menu".

## Validação local

```bash
python3 -m http.server 4173
# abra http://127.0.0.1:4173/
node --check config.js
node --check stories.js
node --check hero.js
node --check script.js
```

Não há `package.json`, lint, type-check ou build configurados neste projeto.
