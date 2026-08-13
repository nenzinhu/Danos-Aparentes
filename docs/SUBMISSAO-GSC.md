# Submissão ao Google Search Console (GSC)

> Recomendação Quick Win da auditoria (impacto Médio). Garanta a indexação do sitemap.

## Pré-requisitos (já prontos no projeto)
- `src/app/robots.ts` → aponta `sitemap: https://danosaparentes.com.br/sitemap.xml` ✅
- `src/app/sitemap.ts` → gera 90 URLs (páginas + blog + categorias) ✅
- `public/llms.txt` → presença em IA ✅

## Passo a passo
1. Acesse https://search.google.com/search-console/
2. Adicione propriedade: `https://danosaparentes.com.br` (tipo URL prefixo).
3. Verificação: já existe `verification` no `layout.tsx` (Yandex + msvalidate).
   Para Google, use **Tag HTML** ou **DNS** (adicionar registro TXT no domínio):
   - TXT: `google-site-verification=COLE_AQUI_O_TOKEN_DO_GSC`
4. Após verificar, em **Sitemaps** envie: `sitemap.xml`
5. Aguarde o processamento e revise **Cobertura** (erros, excluídos, válidos).

## Verificação local (antes do deploy)
```bash
# robots.txt
curl https://danosaparentes.com.br/robots.txt
# sitemap
curl https://danosaparentes.com.br/sitemap.xml | head -20
# llms.txt
curl https://danosaparentes.com.br/llms.txt
```

## Monitoramento contínuo
- GSC → Relatório de desempenho (impressões, cliques, CTR)
- GSC → Inspeção de URL para páginas novas do blog
- Reenviar sitemap após grandes lotes de posts

## Meta
- Esforço: Baixo | Impacto: Médio | Responsável: Fundador
