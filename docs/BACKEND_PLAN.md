# Plano de evolução do backend das demos

CRM Pro e AgendaPro funcionam hoje como demonstrações isoladas no navegador. O objetivo da próxima camada é torná-las aplicações multiusuário sem misturar dados com outros produtos.

## Princípio

**Não usar a base de produção do ServiceFlow para armazenar dados de demos do portfólio.**

As demos devem ter um projeto Supabase próprio ou outro backend isolado, com ambiente separado e dados descartáveis.

## CRM Pro

Modelo inicial:

- `organizations`
- `profiles`
- `clients`
- `opportunities`
- `tasks`
- `activity_log`

Cada registro de negócio deve pertencer a uma organização. Autenticação identifica o usuário; autorização limita as linhas da organização correta.

## AgendaPro

Modelo inicial:

- `organizations`
- `professionals`
- `services`
- `professional_services`
- `availability_rules`
- `appointments`
- `customers`

O cálculo de disponibilidade precisa impedir dupla reserva no backend, não apenas esconder horários no front-end.

## Segurança mínima

- RLS em todas as tabelas expostas pela API.
- Chave secreta nunca no navegador.
- Front-end usa apenas chave publicável.
- Policies devem combinar autenticação com propriedade/organização.
- Operações privilegiadas ficam no servidor/Edge Function quando necessário.
- Seeds das demos não podem conter dados reais.

## Fases

1. Projeto de backend isolado.
2. Auth e estrutura de organizações.
3. Schema + RLS + seeds fictícios.
4. Integração do CRM Pro.
5. Integração do AgendaPro.
6. Testes de autorização e concorrência.
7. Ambiente demo resetável.

A versão atual com `localStorage` continua útil como fallback público sem dependência de serviço externo.
