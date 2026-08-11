# Security Policy

This portfolio is a public static website. Browser-delivered HTML, CSS and JavaScript must always be considered readable by visitors. Security therefore does **not** depend on hiding frontend code.

## Non-negotiable rules

- Never commit passwords, private API keys, private tokens, service-role keys, private certificates or credentials.
- Never place privileged business logic or authorization decisions in frontend code.
- Never expose a database directly without server-side authorization and row-level access controls.
- Never publish source maps in production.
- Never send portfolio/demo form data to a third party unless that integration is explicitly reviewed and documented.
- External scripts, external iframes and browser network calls are blocked by the repository security gate unless intentionally reviewed.
- Demo data must be fictitious. Corporate/client implementation details, credentials, internal identifiers and proprietary operational data must not be published.

## Production architecture rule

For any future real application:

`Browser -> authenticated backend/API -> authorization -> database / private APIs`

Secrets live only in protected server-side environment variables or a secret manager. Public frontend variables are treated as public information.

## Automated controls

Every feature/release is expected to pass:

1. Static QA.
2. Security source audit.
3. Secure Pages build.
4. Security audit of the exact deploy artifact.
5. Playwright desktop/mobile functional QA.

The Pages deployment publishes only the generated `dist/` artifact. Repository documentation, workflows, QA files and development scripts are not included in the website artifact.

## Reporting a vulnerability

Do not publish credentials or exploit details in a public issue. Use GitHub's private vulnerability reporting/security advisory flow when available. If that is not available, use the portfolio contact flow and describe the issue without including live secrets.

## Incident response

If a secret is ever exposed:

1. Revoke/rotate it immediately.
2. Remove it from the current code.
3. Treat Git history and previous deployments as compromised copies.
4. Rewrite repository history when appropriate.
5. Re-run security QA before publishing again.
