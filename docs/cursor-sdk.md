# Cursor SDK — automação de agentes

CLI em `scripts/cursor-agent.mjs` usando `@cursor/sdk` com **`Agent.create()`**.

## Setup

```bash
# Node >= 22.13 (repo testado em 22.14)
export CURSOR_API_KEY="cursor_..."   # Dashboard → Integrations
npm run agent -- --help
```

## Padrões

| Caso | Comando |
|---|---|
| Prompt livre (local) | `npm run agent -- --stream "Explique src/lib/sync.ts"` |
| P0 PIX idempotency | `npm run agent:pix` |
| P0 sync pull seguro | `npm run agent:sync` |
| Follow-up | `npm run agent -- --resume agent-xxx "Escreva o teste"` |
| Cloud + PR | `npm run agent -- --cloud --task pix-idempotency --stream` |

Runtime **local** é o default (`local: { cwd }`). Passe `--cloud` só quando quiser VM Cursor + `autoCreatePR`.

## Tasks pré-definidas

Alinhadas aos P0 de `analysis/avarias-aparentes-pwa/FULLSTACK_AUDIT.md`:

- `pix-idempotency`
- `sync-pull-safe`
- `pdf-escape`
- `historico-tenant`

## Exit codes

| Code | Significado |
|---|---|
| 0 | Run `finished` |
| 1 | Startup (`CursorAgentError` — auth/config/rede) |
| 2 | Run executou e falhou / cancelou |

## Armadilhas

1. Sempre passe `local` ou `cloud` explicitamente (o script já faz).
2. Distinguir exit 1 (não iniciou) de exit 2 (falhou no meio).
3. O script sempre faz dispose do agente (`Symbol.asyncDispose`).
4. Sempre chama `wait()` após `send()`.
5. `CURSOR_API_KEY` obrigatória — não hardcode.
