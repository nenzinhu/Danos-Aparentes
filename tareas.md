# Tarefas — Conversão B2B · Histórico e Sistema de Evidência Veicular

**Produto:** Danos Aparentes  
**Posicionamento-alvo:** Histórico e Sistema de Evidência Veicular  
**Objetivo:** excelência de conversão (clique no site → uso do app)  
**Data:** 2026-08-02

---

## Squad

| Expert | Foco |
|--------|------|
| @cro | Hierarquia de CTA, fricção, mensagem em 5s |
| @copywriting | Headline/valor por vertical B2B |
| @product-marketing | Plataforma (histórico) vs ferramenta (laudo único) |
| @signup | Caminho `/app?mode=signup` com UTMs intactos |
| @bill-gates (lente) | Chokepoint: quem controla o histórico do veículo |

---

## Backlog priorizado

### P0 — Quick wins (implementar agora)

- [x] **CTA primário = uso do produto** em `/oficinas`, `/frotas`, `/seguradoras` (trial → `/app?mode=signup`); WhatsApp vira secundário
- [x] **CTA final** das mesmas páginas inclui trial (não só chat)
- [x] **Reposicionamento unificado** “Histórico e Sistema de Evidência Veicular” em metadata, kickers e heróis B2B
- [x] **Home:** subheadline alinhada ao posicionamento de evidência/histórico
- [x] Artefatos `tareas.md` + `plan_implementacion.md`

### P1 — Alto impacto (próximo ciclo)

- [x] Seção “Histórico por veículo” (antes/depois) em cada landing B2B com CTA para trial
- [x] Sticky CTA mobile nas landings B2B
- [x] Unificar microcopy de CTA: “Começar 7 dias grátis — sem cartão” (constante compartilhada)
- [x] Message match Ads → landing (UTM + headline espelhada)
  - UTMs: `utm_content` / `utm_term` / `utm_campaign` → `src/lib/b2bMessageMatch.ts`
  - Ex.: `/locadoras?utm_content=ja-estava-assim`
  - Evento `message_match` no dataLayer/GA
- [x] Instrumentar eventos: `cta_click`, `signup_start`, `first_inspection` (funil clique→uso)


### P2 — Testes A/B

- [ ] Headline dor vs headline plataforma (“histórico por placa”)
- [ ] CTA “Testar na minha [vertical]” vs “Começar 7 dias grátis”
- [ ] Hero com vídeo acima da dobra vs laudo demo acima da dobra

### P3 — Plataforma (moat)

- [x] Landing `/historico` pública (produto, não só token) — sitemap + links B2B
- [ ] Prova social real quando houver (sem inventar cases)
- [x] Onboarding pós-signup: primeira vistoria em &lt; 3 min (ativação)
  - Auto-login após cadastro + checklist placa → diagrama → laudo
  - Eventos: `onboarding_start`, `onboarding_step_click`, `onboarding_complete`, `onboarding_dismiss`

---

## Critérios de sucesso

1. Visitante entende em ≤ 5s: **histórico + evidência**, não só “app de laudo”.
2. CTA primário acima da dobra leva a **usar o app**, não a conversa no WhatsApp.
3. Cada vertical mantém dor específica, mas sob a mesma marca-plataforma.
4. Funil medido: landing → signup → primeira vistoria.
