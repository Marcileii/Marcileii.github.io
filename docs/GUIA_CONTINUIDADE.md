# Guia de continuidade — Portfólio Marcilei

> Última revisão: 23/11/2026. Referência para novos chats, assistentes e contribuidores. **Não contém credenciais nem dados internos de clientes.**
>
> Este documento não substitui ler o código atualizado, issues/PRs, deploys e testes; deve ser consultado junto da branch `main`.

## 1. Identidade do projeto e links

- **Nome:** Portfólio profissional Marcilei Brandão — desenvolvimento web, CRM, Martech, dados, automações e integrações.
- **Produção:** https://marcilei.com.br/
- **Código-fonte público:** https://github.com/Marcileii/Marcileii.github.io
- **Branch de produção:** `main`; publicação automática na **Vercel**, com domínio próprio. Existe também um espelho GitHub Pages em `https://marcileii.github.io/`.
- **Ambiente:** HTML, CSS e JavaScript no site do portfólio. Demos têm implementações próprias. Não pressupor aplicação React única.
- **Identidade visual:** fundo creme, tipografia escura/serifada nos títulos, acento laranja e verde-limão. O favicon é `/favicon.svg?v=3` e deve ser compartilhado em todas as rotas.
- **Imagem de apresentação atual:** `/assets/portrait-marcilei-2026.webp` usada no `index.html` (substituiu o avatar externo; preservar enquadramento/qualidade desktop e mobile).
- **Escopo público:** distinguir cases anonimizados, demos com dados fictícios, protótipos e produtos próprios. Nunca divulgar fontes, identificadores, URLs internas ou números reais de clientes.

## 2. Estrutura para localizar e editar

| Caminho | Para que serve |
|---|---|
| `index.html` | Home, apresentação, foto, cartões de projetos/cases e links |
| `assets/site.css`, `assets/mobile.css` | Estilo global e comportamento visual responsivo |
| `assets/site.js` | Navegação mobile, menus, seções e carregamento de estilos/funcionalidades |
| `assets/gallery.css`, `assets/mobile-preview.css` | Cards, previews e iframes de sites/demos; previews usam lazy loading |
| `assets/portrait-marcilei-2026.webp` | Foto atual de apresentação |
| `cases/omnichannel-performance/index.html` | Case público **Dashboard de Resultados por Jornada** |
| `assets/case-engagement.js` | Interface de curtidas, comentários e integração com API |
| `backend/neon-engagement/index.txt` | Código-fonte da função backend para reações; execução remota no Neon |
| `scripts/build_secure_site.py` | Montagem do site distribuível e políticas de segurança |
| `qa/*.spec.mjs` | Testes Playwright de responsividade, navegação, casos e engajamento |
| `LinkedIn_posts/` | Skill, histórico e plano editorial — independente do código do portfólio |

## 3. Case principal: Dashboard de Resultados por Jornada

**Página pública:** https://marcilei.com.br/cases/omnichannel-performance/

**Objetivo real do case:** explicar o desafio técnico de observar **resultados de jornadas** de CRM no Salesforce Marketing Cloud (envios, aberturas, cliques, taxas e filtros por jornada/canal/período), não confundir com o **dashboard posterior de volumetria e budget de envios de Portugal/Espanha**, que é outro projeto.

**Demonstração do portfólio:** interativa, com **jornadas e números fictícios**, sem chamada ao SFMC do cliente. A interface inclui filtros de jornada, canal e período, KPIs, gráfico de evolução, tabela por canal, CSV fictício, abas de visão geral/arquitetura e área de comunidade.

**Explicação técnica apresentada ao visitante:** uma arquitetura conceitual com Data Views/relatórios → SQL/Automation Studio → Data Extensions → **CloudPage AJAX** (SSJS/WSProxy, resposta JSON) → **CloudPage HTML** (filtros, gráficos e interação). É uma representação educacional, **não** publicação de código interno nem documentação operacional do cliente.

**Decisões de apresentação:**
- Destacar problema, raciocínio arquitetural e resultado visual; não vender CloudPages como solução universal nem afirmar que supera BI externo.
- Não chamar métricas de abertura/clique de outras plataformas de equivalentes sem qualificação.
- Mostrar seção técnica numa aba separada para quem quiser aprofundar.
- Botão **“Testar dashboard ↓”** no cabeçalho do case salta para `#csDemo`, evitando rolagem longa no mobile.
- Gráfico tem escala adaptada para telas pequenas (viewport mobile), testada em Playwright.
- A área de comentários/curtidas funciona no próprio case, não no backend da plataforma de CRM.

## 4. Curtidas e comentários — backend independente

- Serviço: **Neon PostgreSQL**, projeto separado chamado **Portfolio Engagement**. Não utiliza as bases de produção ou teste do app Meu Mercado.
- Camada de API: função no Neon, com código versionado em `backend/neon-engagement/index.txt`.
- Frontend: `assets/case-engagement.js`.
- Entidades de banco: `public.portfolio_case_likes` e `public.portfolio_case_comments`.
- Identificação básica de visitante via cookie; o backend trabalha com hashes e validações, sem publicar credenciais no navegador.
- Comentários públicos são renderizados como **texto**, não HTML; há limitações simples de frequência, tamanho e conteúdo para reduzir spam.
- O status `visible`/`hidden` na tabela de comentários permite moderação manual.
- Integração e testes automatizados com backend simulado existem em `qa/case-engagement.spec.mjs`. **Não presumir que esses testes simulados validam disponibilidade/gravação remota atual:** consultar Neon quando precisar confirmar.
- Uma verificação manual em 23/11/2026 confirmou gravação de uma curtida e um comentário. Não tratar essa contagem como dado atual.

**Segurança:** nunca copiar strings de conexão, tokens ou segredos para documentação pública. Manter credenciais apenas no gerenciamento privado do serviço. Revisar CORS, rate limits, custos e moderação antes de ampliar a exposição pública.

## 5. Portfólio mobile e UX

- Priorizar usuários em celular; **não assumir que 70% do tráfego é mobile sem dados de analytics**.
- Testes usam viewports de **360, 390 e 430 px** e tablet; incluem navegação, menus, overflow, tamanhos de toque e screenshots.
- Previews/iframes de projetos são carregados sob demanda (`loading="lazy"`): screenshots full-page feitos antes de rolar podem capturá-los vazios; conferir após scroll real.
- `qa/mobile-scroll-audit.spec.mjs` exercita rolagem, previews e o caminho home → case → aba técnica.
- Manter CTAs claros, legibilidade do gráfico, enquadramento da foto e velocidade de carregamento.
- Próximas melhorias de UI devem ser revisadas visualmente antes de publicar, sobretudo em celular.

## 6. LinkedIn: conteúdo e agendamentos

**Entrada da skill:** [`LinkedIn_posts/README.md`](../LinkedIn_posts/README.md). A fonte oficial de status é [`LinkedIn_posts/PUBLICACOES.md`](../LinkedIn_posts/PUBLICACOES.md).

Estratégia atual: **terça** — experiência/dor real de Salesforce Marketing Cloud e networking; **quinta** — projeto/case validado, preferencialmente com demonstração pública. Linguagem humana, curta, baseada em fatos, sem expor nomes/dados de clientes.

Confirmado pelo autor em 23/11/2026:
- **Terça, 24/11, 13h (Brasília):** post sobre query SFMC e diagnóstico relacionado à chave primária da Data Extension — **AGENDADO**.
- **Quinta, 26/11, 13h (Brasília):** post do case de Resultados por Jornada, linkando o case público — **AGENDADO**.

**AGENDADO não é PUBLICADO.** Confirmar a publicação efetiva e eventual URL do LinkedIn antes de atualizar o status; nunca agendar, responder pessoas ou publicar automaticamente sem autorização.

## 7. Fluxo de mudanças e checagens

1. Ler README, este guia e os arquivos realmente envolvidos; consultar GitHub `main` atual.
2. Criar branch `feature/*`, `fix/*` ou `docs/*`, evitando alterações diretas em produção.
3. Executar/revisar QA estático, segurança e Playwright; conferir desktop e mobile.
4. Abrir PR, validar resultados e integrar somente após passar os testes.
5. Confirmar o status de implantação **Vercel** para o commit integrado em `main`. Não prometer produção só por haver commit.
6. Ao concluir mudança importante, atualizar este guia se mudar stack, integrações, rotas ou regras de trabalho.
7. Para alterações apenas editoriais, usar a pasta `LinkedIn_posts/`; não mexer no site.

**Histórico de PRs relevantes** (consultar diff para detalhes):
- [#31 — Dashboard de jornadas e arquitetura](https://github.com/Marcileii/Marcileii.github.io/pull/31)
- [#32 — Curtidas/comentários e Neon](https://github.com/Marcileii/Marcileii.github.io/pull/32)
- [#33 — Favicon consistente](https://github.com/Marcileii/Marcileii.github.io/pull/33)
- [#34 — Agendamentos LinkedIn e domínio](https://github.com/Marcileii/Marcileii.github.io/pull/34)
- [#35 — Auditoria e gráfico mobile](https://github.com/Marcileii/Marcileii.github.io/pull/35)
- [#36 — Nova foto e botão Testar dashboard](https://github.com/Marcileii/Marcileii.github.io/pull/36)

## 8. Como começar em um chat novo

Copie a mensagem abaixo:

> Estou continuando meu portfólio em https://github.com/Marcileii/Marcileii.github.io. Antes de sugerir ou alterar qualquer coisa, leia o README e o arquivo `docs/GUIA_CONTINUIDADE.md` na branch `main`, além dos arquivos da funcionalidade em questão. Meu site de produção é https://marcilei.com.br, com deploy na Vercel. Respeite cases anonimizados e dados fictícios. Não publique sem testes e confirmação de deploy. Se formos trabalhar no LinkedIn, leia toda a pasta `LinkedIn_posts/` e confira o histórico de agendamentos. Diga o que verificou e me ajude a continuar a tarefa que vou descrever.

**Limite importante:** nenhum novo chat ganha automaticamente toda a história das conversas anteriores apenas por ter esse link. O guia centraliza decisões verificadas e os arquivos restantes mostram a implementação; informações privadas, decisões ainda não registradas e novos resultados precisam ser recuperados separadamente.
