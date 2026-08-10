# Marcilei Brandão — Portfólio

Portfólio profissional de **Desenvolvimento Web, Sistemas, CRM, Automação, Dados e Integrações**.

🌐 Produção: https://marcileii.github.io/

## Estrutura do conteúdo

### Sistemas funcionais
- **CRM Pro** — dashboard, clientes, oportunidades, pipeline Kanban e tarefas.
- **AgendaPro** — serviços, profissionais, horários, confirmação e painel administrativo.
- **LeadFlow** — simulação de formulário → payload → scoring → CRM → próxima ação.

### Produto e cases
- **ServiceFlow** — produto próprio para gestão de serviços técnicos.
- **Omnichannel Performance Hub** — case corporativo anonimizado de dashboard multicanal.
- **Dynamic Recommendation Engine** — case anonimizado de personalização e recomendação dinâmica.

### Sites & Landing Pages
Aurora Estética, Nexo Contábil, Café Atelier, Vista Imóveis e Atlas Studio são marcas fictícias criadas para demonstração de direção visual, front-end, responsividade e conversão.

> Cases corporativos não expõem nomes de clientes, dados internos, credenciais, identificadores ou código proprietário.

## Fluxo Git

- `main` — produção estável publicada no GitHub Pages.
- `develop` — integração e validação antes da produção.
- `feature/*` — desenvolvimento isolado por funcionalidade.

Fluxo esperado:

`feature/* → Pull Request → QA → develop → QA final → Pull Request → main`

Mudanças grandes não devem ser desenvolvidas diretamente em `main`.

## QA

O workflow `.github/workflows/qa.yml` executa em branches e Pull Requests:

1. auditoria estática dos HTMLs;
2. validação de links e assets locais;
3. Playwright em Chromium;
4. desktop `1440x900` e mobile `390x844`;
5. detecção de overflow horizontal e controles pequenos;
6. fluxos funcionais de CRM Pro, AgendaPro, LeadFlow e página de contratação;
7. screenshots de evidência anexados ao workflow.

A publicação em `main` só deve acontecer depois do gate de QA.

## Demos e dados

CRM Pro e AgendaPro são demonstrações de portfólio. Nesta versão, os dados criados pelo visitante ficam no `localStorage` do próprio navegador e podem ser resetados pela interface.

Isso permite testar fluxos completos sem misturar dados de portfólio com bases reais ou expor credenciais. A evolução para backend multiusuário está documentada em `docs/BACKEND_PLAN.md`.

## Conversão

A rota `/contratar/` organiza o briefing e prepara um email revisável antes do envio. Nenhum dado do formulário é transmitido automaticamente.

A camada de analytics do portfólio registra eventos em `window.dataLayer` e mantém até 50 eventos locais no navegador para depuração. Um coletor externo pode ser conectado futuramente sem alterar os CTAs.
