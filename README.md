# 🚗 Danos Aparentes

> Plataforma Brasileira de Inteligência Histórica Veicular — mapeie, laude e audite avarias em campo, com prova criptográfica.

🌐 **Site:** [www.danosaparentes.com.br](https://www.danosaparentes.com.br)

Danos Aparentes é uma aplicação web interativa, responsiva e **offline-first** para uso operacional em campo. Ela permite mapear graficamente avarias, riscos, amassados e fraturas em veículos e motocicletas através de um diagrama visual interativo, gerando relatórios padronizados e automatizados — com **hash SHA-256 e QR Code** para garantir integridade e auditabilidade.

---

## 💡 Ideas, Innovations & Brilliant Minds

A inspeção veicular tradicional vive de três problemas: **ambiguidade** (o que é "risco leve" pra um não é pro outro), **disputa** (quem causou a avaria no pátio, na locadora, no guincho?) e **papel** (laudo escrito à mão, sem prova, fácil de contestar).

O Danos Aparentes resolve os três de uma vez:

- **Mapa visual de avarias por coordenada.** Em vez de texto livre, o operador clica na peça exata do diagrama do veículo e marca o tipo/dimensão/gravidade. A avaria vira dado estruturado, não prosa.
- **Laudo com prova, não com promessa.** Cada relatório recebe um **hash SHA-256** e um **QR Code** que aponta para o original verificável — eliminando falsificação e "memória seletiva" em contestações.
- **Histórico inteligente de veículo.** Por placa, a plataforma reconstrói a linha do tempo (check-in → check-out, transferência, sinistro) de múltiplos operadores — estacionamentos, valets, locadoras, guinchos, depósitos e frotas.
- **IA como copiloto, humano como decisor.** O sistema sugere gravidade e detecta padrões; o operador revisa e aprova. A responsabilidade técnica continua com quem assina.

O resultado é um ciclo onde **a avaria é registrada no momento certo, no lugar certo, com a prova certa** — e o custo de uma disputa cai de "processo de meses" para "conferir um QR Code".

---

## 🚀 Core Innovations & Highlights

| Inovação | O que entrega | Por que importa |
|---|---|---|
| **Diagrama de avarias interativo** | Clique na peça → marca tipo, dimensão e gravidade | Zero ambiguidade: a avaria é coordenada, não descrição |
| **Laudo PDF no navegador** | Geração client-side, sem servidor | Funciona em campo, sem dependência de backend para emitir |
| **Hash SHA-256 + QR Code** | Impressão do hash no laudo + QR apontando ao original | Integridade e verificabilidade contra falsificação |
| **PWA Offline-First** | IndexedDB + fila de sincronização | Continua vistoriando sem internet; sincroniza depois |
| **Sync híbrido (local ⇄ nuvem)** | Supabase Postgres + merge por placa | Dados no dispositivo e na nuvem, sem perder inspeção |
| **Histórico por placa** | Timeline de check-in/check-out/transferência | Audit trail contínuo entre operadores |
| **Blob/antifraude ancorado** | Assinatura do laudo amarrada ao hash | Laudo não editável pós-emissão |
| **Multi-segmento B2B** | Estacionamento, valet, locadora, guincho, depósito, frota | Mesma engine, dores diferentes, um histórico só |

---

## 🧠 Skills & Technical Stack

| Camada | Tecnologias | Detalhe |
|---|---|---|
| **Front-end / UI Canvas** | Next.js 16 (App Router), React 19 | Renderização server/components + hidratação seletiva |
| | TypeScript (strict) | Tipagem de ponta a ponta no laudo e no sync |
| | Tailwind CSS + design tokens | Tema com `--success`/`--success-bright` (emerald) e cyan de marca |
| | Canvas / SVG interativo | Diagrama de avarias por coordenada de peça |
| | PWA (manifest + SW) | Instalável, offline-first, cache de assets |
| **Back-end / Automação** | Supabase (Postgres + RLS) | Armazenamento com Row-Level Security por tenant |
| | Supabase Migrations (idempotentes) | `DROP POLICY IF EXISTS` para reaplicação segura |
| | Sync engine (IndexedDB ⇄ Postgres) | Merge por placa, fila com flush de 10s, throttle |
| | Hash SHA-256 + QR Code | Integridade e verificabilidade do laudo |
| **DevOps / Cloud** | Vercel (deploy automático por push) | Build estático + edge, zero-config |
| | GitHub Actions-ready | Pipeline de lint/typecheck/build |
| | Supabase Cloud | Banco gerenciado, RLS, índices por `tenant_id` |
| **Ferramentas AI-Assisted** | Hermes Agent (coding/deploy) | Commits isolados, tag de backup, deploy verificável |
| | Typecheck + Vitest | `tsc --noEmit` + suite de testes do sync |
| | Skill-based review | Code-review de 5 eixos antes de merge |

---

## 📊 System Flow & Operational Impact

```
┌─────────────┐   ┌──────────────┐   ┌────────────────┐   ┌──────────────┐
│  CAMPO      │   │  APP (PWA)   │   │  LOCAL (IDB)   │   │  NUVEM       │
│  Veículo    │──▶│  Diagrama    │──▶│  Fila sync     │──▶│  Supabase    │
│  na entrada │   │  + IA sugere │   │  (offline OK)  │   │  + histórico │
└─────────────┘   └──────┬───────┘   └───────┬────────┘   └──────┬───────┘
                         │                   │                  │
                         ▼                   ▼                  ▼
                 ┌───────────────┐   ┌──────────────┐   ┌──────────────┐
                 │ Laudo PDF     │   │ Flush 10s    │   │ QR Code      │
                 │ + Hash + QR   │   │ + throttle   │   │ verificável  │
                 └───────────────┘   └──────────────┘   └──────────────┘

   Check-in ──▶ [avaria marcada] ──▶ Check-out ──▶ [compara] ──▶ Disputa?
                                                              │
                                        Sim ─────────────────┤
                                         │                    │
                                         ▼                    ▼
                                  Conferir QR Code      Sem incomodação
                                  (prova original)     (histórico fecha)
```

**Impacto operacional**

- ⏱️ **Redução de tempo.** Laudo estruturado em campo substitui escrita manual e retrabalho de digitação.
- 🎯 **Eliminação de ambiguidade.** Gravidade e tipo são selecionados no diagrama — não interpretados depois.
- 📐 **Padronização de laudos.** Mesmo schema entre unidades, motoristas e operadores.
- 🔒 **Auditabilidade.** Hash + QR Code tornam o laudo contestável apenas com prova em contrário.
- 🔄 **Resiliência.** Offline-first garante inspeção mesmo sem sinal no pátio.

---

## 🔮 Next-Gen Roadmap

- [ ] **Visão Computacional / AI para leitura de fotos de danos.** Detectar e classificar avaria direto da foto (bounding box + gravidade), sugerindo o preenchimento do diagrama automaticamente.
- [ ] **PWA Offline-First aprimorado.** Sincronização incremental por delta e resolução de conflitos por placa com CRDT leve.
- [ ] **Analytics operacional.** Dashboard de taxa de disputa, MTTR de laudo e histórico de reincidência por placa/frota.
- [ ] **Detecção de recorrência.** Alerta quando uma placa retorna com avaria na mesma peça após check-out.
- [ ] **Integração com DETRAN / despachantes.** Laudo de procedência embarcado no fluxo de transferência.
- [ ] **API pública de verificação.** Terceiros conferem a integridade de um laudo via QR Code sem login.
- [ ] **Multi-idioma.** Suporte a layouts LTR/RTL para operação internacional.

---

<p align="center">
  <sub>Danos Aparentes — Inteligência Histórica Veicular • <a href="https://www.danosaparentes.com.br">www.danosaparentes.com.br</a></sub>
</p>
