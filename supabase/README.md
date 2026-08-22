# Estrutura do banco (Supabase)

- `supabase/schema.sql` — **schema-base** (tabelas originais). Não editar para adicionar colunas/tabelas novas.
- `src/supabase/` — raiz do projeto Supabase CLI (`config.toml`).
- `src/supabase/migrations/` — **migrações versionadas e idempotentes**. Toda alteração de schema nova vem para cá, com nome `AAAAMMDDHHMMSS_descricao.sql`.

## Como aplicar

```bash
npm run db:push          # aplica schema-base + todas as migrações em ordem (usa SUPABASE_DB_URL do .env)
npm run db:migrate:api   # aplica migrações via API do Supabase (sem conexão direta)
npm run check:sync-schema # valida que o schema do sync está em dia
```

O script `scripts/push-schema.mjs` aplica `supabase/schema.sql` e depois as migrações de `src/supabase/migrations/` em ordem alfabética — deixando o banco sempre no estado atual completo.
