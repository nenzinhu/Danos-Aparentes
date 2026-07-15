# API de saída — integração ERP/CRM (plano Corporativo)

A API de saída permite que sistemas externos (ERP, CRM, frota, seguradora) **leiam** os laudos sincronizados da sua empresa.

## Autenticação

1. No app, abra **Identidade da Empresa** (configurações) com plano **Corporativo**.
2. Em **API de saída**, gere uma chave.
3. Guarde a chave — ela só é mostrada **uma vez**.

Envie a chave em toda requisição:

```http
Authorization: Bearer da_live_...
```

ou

```http
X-API-Key: da_live_...
```

## Endpoints

Base: `https://danosaparentes.com.br`

### Listar laudos

```http
GET /api/v1/inspections
```

| Query | Descrição |
|-------|-----------|
| `plate` | Filtra por placa (normalizada) |
| `updated_since` | ISO-8601 — só laudos atualizados a partir desta data |
| `limit` | 1–100 (padrão 20) |
| `offset` | Paginação (padrão 0) |
| `include_damages` | `false` para omitir avarias (mais leve) |

Resposta:

```json
{
  "data": [ { "id": "...", "plate": "ABC1D23", "damages": [ ... ] } ],
  "meta": { "total": 42, "limit": 20, "offset": 0, "has_more": true }
}
```

### Detalhe de um laudo

```http
GET /api/v1/inspections/{id}
```

## Escopo

A chave enxerga os laudos do **dono da empresa** e de todos os **inspetores aceitos** na equipe.

## Limites

- Até **5 chaves ativas** por empresa.
- Rate limit: **120 req/min** por chave + IP.
- Assinaturas digitais (imagens base64) **não** vão no JSON — só flags `signed_by_inspector` / `signed_by_client`.
- Fotos retornam como URL pública do Storage (`storage:` → URL).

## Exemplo (curl)

```bash
curl -sS "https://danosaparentes.com.br/api/v1/inspections?plate=ABC1D23&limit=5" \
  -H "Authorization: Bearer da_live_SUA_CHAVE"
```

## Migração no Supabase

Aplique a migration `src/supabase/migrations/20260715_company_api_keys.sql` (ou `npm run db:push`) antes de usar em produção.
