# Banco de problemas reais e cases — LinkedIn_posts

> Repertório editorial. **Itens aqui NÃO significam publicações feitas.** Antes de criar um novo post, consultar `PUBLICACOES.md` e verificar o estado atual dos links e dos projetos.

## Temas de terça — networking, foco SFMC

| Tema | Origem / contexto já mencionado | Gancho possível | Cuidado |
|---|---|---|---|
| Query trouxe pouquíssimos registros | Consulta cruzando bases grandes resultou em poucos registros; o motivo identificado foi chave primária configurada só para código de campanha na DE destino | "Sua query pode estar certa e o erro estar na Data Extension de destino" | Não culpar INNER JOIN como causa real |
| Query zerada | Investigação com bases e filtros; no fim, origem dos dados havia parado de receber atualização | "Quantas horas você já gastou revendo SQL quando a origem parou de enviar?" | Não inventar datas, totais ou nomes de DE |
| Automação 'verde' | Interesse real em validar resultado, não só execução; problema discutido como tema editorial | "Executou com sucesso. E os dados?" | Não afirmar um incidente pessoal específico sem confirmação |
| Held / Bounce / não recebidos | Análise real de destinatários de uma campanha; necessidade de identificar status | "E quem estava na base, mas não recebeu?" | Não usar números/cliente/identificadores internos |
| Data Views / histórico | Dificuldades com consultas a histórico limitado e extrações recorrentes | "E quando precisamos investigar um envio antigo?" | Conferir retenção aplicável/atual antes de afirmar |
| Automação de monitorização | Desenvolvimento de dashboards e rotinas para acompanhar volumes e canais | "Quem valida a volumetria depois da automação?" | Descrever sem estruturas internas |
| AMPscript / personalização | Experiência em fallbacks, modularidade, campos ausentes e contextos de envio | "Quando falta um atributo, seu email quebra ou tem fallback?" | Nunca expor valores/links reais |

Para cada tema, confirmar singularidade: problema, diagnóstico, gancho e perguntas não devem reproduzir PUB-001 nem rascunhos recentes. Quando só houver tema parecido, procurar um ângulo genuinamente novo.

## Projetos de quinta — catálogo público do portfólio

| Projeto | Tipo | Prova/escopo | Link |
|---|---|---|---|
| Omnichannel Performance Hub | Case corporativo **anonimizado** | Arquitetura SFMC + SSJS + JS + SQL; leitura multicanal e filtros | https://marcileii.github.io/cases/omnichannel-performance/ |
| Dynamic Recommendation Engine | Case corporativo **anonimizado** | AMPscript, SQL, fallback e tracking na personalização de campanhas | https://marcileii.github.io/cases/recommendation-engine/ |
| ServiceFlow | **Protótipo front-end em evolução** | Conceito de operação para empresas de serviços técnicos; React/Vite | https://marcileii.github.io/cases/serviceflow/ |
| LeadFlow | **Demo interativa** | Fluxo de lead, qualificação, score e decisão rumo ao CRM | https://marcileii.github.io/demos/leadflow/ |
| CRM Pro | **Demo interativa no navegador** | Clientes, pipeline, Kanban, tarefas e painel. Estado local do navegador, não SaaS em produção | https://marcileii.github.io/demos/crm-pro/ |
| AgendaPro | **Demo interativa no navegador** | Serviços, profissionais, horários, confirmação e área administrativa | https://marcileii.github.io/demos/agendapro/ |
| Sites/LPs demonstrativos | Demos com **marcas fictícias** | Aurora Estética, Nexo Contábil, Café Atelier, Vista Imóveis e Atlas Studio | https://marcileii.github.io/ |

**Repositório para consulta:** https://github.com/Marcileii/Marcileii.github.io  
**Perfil geral:** https://github.com/Marcileii  
Alguns repositórios como ServiceFlow, Budget-MKT e Cloud-Page-Fluxo-Associa-o são privados. Não linkar diretórios privados, não expor material de cliente. O site pode conter uma reconstrução conceitual anonimizando trabalho feito para clientes; não publicar código real deles.

## Sequenciamento sugerido (não é agendamento nem publicação)

- Terças: escolher dores de SFMC não repetidas, priorizando experiência demonstrável.
- Quintas: alternar cases reais anonimizados de Marketing Cloud com demos/produtos próprios; inicialmente priorizar cases mais próximos da SFMC.
- Não chamar demo de projeto implantado nem protótipo de software pronto.
- Sempre verificar repositórios atuais: projetos, READMEs e links podem ter evoluído.

## Público-alvo

Analistas de CRM, especialistas em Marketing Cloud, desenvolvedores, Tech Leads, arquitetos, responsáveis por Marketing Automation e empresários de consultorias no Brasil e em Portugal.

**Tese de posicionamento:** não apenas trabalhar com ferramenta — identificar dificuldades operacionais, projetar e entregar soluções técnicas confiáveis, integrando CRM, dados, frontend, APIs e IA quando útil.
