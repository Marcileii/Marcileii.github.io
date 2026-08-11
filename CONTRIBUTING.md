# Contribuindo com o portfólio

## Branches

1. Atualize `develop`.
2. Crie uma branch `feature/<nome-curto>` a partir de `develop`.
3. Faça mudanças pequenas e coerentes.
4. Abra PR para `develop`.
5. Corrija qualquer falha de QA ou Security QA antes do merge.
6. Depois da validação integrada, abra PR de `develop` para `main`.
7. Use merge normal em releases para manter `develop` e `main` com histórico compatível.

## Definition of Done

Uma mudança só está pronta quando:

- o fluxo principal funciona sem erro de JavaScript;
- desktop e mobile não têm overflow horizontal;
- botões, formulários e CTAs têm estados e tamanhos utilizáveis;
- contraste e hierarquia visual foram revisados;
- links internos não estão quebrados;
- nenhuma credencial, segredo ou dado real de cliente foi publicado;
- não há source maps em produção;
- não há chamada de rede, script externo, iframe externo ou form action externo sem revisão explícita;
- dados digitados em demos não são persistidos além da sessão quando isso não é necessário;
- conteúdo do usuário nunca entra em `innerHTML` sem sanitização;
- demos deixam claro quando não existe backend real;
- o workflow `Portfolio QA` passou por Static QA, Security QA, build seguro e Playwright;
- o teste funcional roda contra o mesmo `dist/` que será publicado;
- mudanças relevantes estão documentadas.

## Regras de conteúdo

- Não inventar depoimentos, resultados ou métricas.
- Cases corporativos devem ser anonimizados.
- Demos fictícias devem ser identificadas como demonstrações.
- Evitar transformar todas as páginas no mesmo template.
- Cada projeto precisa deixar claro: problema, experiência, tecnologia e o que o visitante consegue testar.

## Segurança

Nunca versionar:

- tokens;
- chaves secretas ou service-role keys;
- senhas ou credenciais;
- certificados/chaves privadas;
- URLs internas sensíveis;
- dados reais de clientes;
- dumps de bancos de produção;
- arquivos `.env`;
- source maps de produção.

Toda lógica de autenticação, autorização, segredo, pagamento ou acesso privilegiado deve ficar em backend. O frontend deve ser tratado como informação pública mesmo quando o bundle estiver compactado.
