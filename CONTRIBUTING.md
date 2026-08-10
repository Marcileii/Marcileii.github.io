# Contribuindo com o portfólio

## Branches

1. Atualize `develop`.
2. Crie uma branch `feature/<nome-curto>` a partir de `develop`.
3. Faça mudanças pequenas e coerentes.
4. Abra PR para `develop`.
5. Corrija qualquer falha de QA antes do merge.
6. Depois da validação integrada, abra PR de `develop` para `main`.

## Definition of Done

Uma mudança só está pronta quando:

- o fluxo principal funciona sem erro de JavaScript;
- desktop e mobile não têm overflow horizontal;
- botões, formulários e CTAs têm estados e tamanhos utilizáveis;
- contraste e hierarquia visual foram revisados;
- links internos não estão quebrados;
- nenhuma credencial ou dado de cliente foi publicado;
- demos deixam claro quando não existe backend real;
- o workflow `Portfolio QA` passou;
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
- chaves secretas;
- credenciais;
- URLs internas sensíveis;
- dados reais de clientes;
- dumps de bancos de produção.
