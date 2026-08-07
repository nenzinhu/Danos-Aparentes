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

## 🔟 10 Ideias & Inovações

Lista de inovações que definem o Danos Aparentes e direções de produto de alto impacto.
Itens marcados com ✅ já estão implementados no core; 🔶 são parciais (base/gancho no código, falta acabamento); 🔬 são propostas de evolução.

1. **✅ Diagrama de avarias por coordenada de peça.** Em vez de texto livre, o operador clica na peça exata e marca tipo/dimensão/gravidade. A avaria vira dado estruturado — zero ambiguidade.
2. **✅ Laudo com hash SHA-256 + QR Code.** Cada relatório recebe uma impressão digital criptográfica e um QR apontando ao original. Integridade e verificabilidade contra falsificação.
3. **✅ Histórico inteligente por placa.** Linha do tempo contínua (check-in → check-out, transferência, sinistro) entre operadores — estacionamento, valet, locadora, guincho, depósito, frota.
4. **✅ PWA Offline-First.** IndexedDB + fila de sincronização permitem vistoriar sem internet e sincronizar depois (flush de 10s + throttle).
5. **✅ Sync híbrido local⇄nuvem.** Merge por placa com Supabase Postgres + RLS por tenant; dados no dispositivo e na nuvem sem perder inspeção.
6. **🔶 Visão Computacional para leitura de fotos.** Rotas `api/damage-vision`, `api/damage-classify`, `api/view-side-classify` + `viewDamageSuggestClient` já sugerem tipo/severidade e lado da foto. Falta desenhar o bounding box direto no diagrama (hoje é sugestão + humano confirma).
7. **🔶 Laudo de procedência + código público (`DA-YYYY-XXXXXX`).** `publicVerify.ts` + `disclosureScope.ts` já geram código e escopo de divulgação. Integração ponta a ponta com DETRAN/despachantes está pendente.
8. **✅ Detecção de recorrência por placa.** `groupReportsByVehicle` já calcula `newDamagesOnLast` (avanço de avarias entre check-in e check-out). Basta um alerta de UI sobre esse dado.
9. **✅ API pública de verificação.** `api/verify-lookup` + `verify/publicVerify.ts` (`resolveVerifyOutcome`, `maskPlate`) + página `/verify` — terceiros conferem integridade via QR/hash sem login.
10. **🔶 Analytics operacional de disputas.** `lib/analytics`, `lib/monitoring`, `lib/audit` + `api/reliability` já coletam eventos. Dashboard gerencial de taxa de disputa/MTTR está pendente.

---

## 🚀 10 Ideias Futuras (não implementadas)

Inovações **ainda inexistentes** no repositório, viáveis e ancoradas no domínio de inspeção veicular. Complementam — não repetem — as 10 anteriores.

1. **Slider de comparação antes/depois por peça.** Sobrepor foto de check-in e check-out no diagrama com controle deslizante, evidenciando a avaria surgida. (Hoje só há `compareInspections` em dados, sem UI de slider.)
2. **Assinatura biométrica do inspetor.** Reconhecimento facial ou biometria amarrada ao hash do laudo, travando identidade do emissor (hoje `inspectorSignature` é textual).
3. **Vistoria colaborativa em tempo real.** Dois inspetores marcando o mesmo veículo ao mesmo tempo, com merge de avarias por peça.
4. **Marketplace de verificação entre empresas.** Locadora consulta o histórico de uma placa de outra companhia mediante consentimento do proprietário (hoje o histórico é por tenant).
5. **Widget embarcável de selo "Verificado".** Snippet `iframe`/JS para sites de venda de usados exibirem a procedência do veículo via Danos Aparentes.
6. **IA preditiva de custo de reparo.** A partir de tipo/severidade da avaria, estima valor de conserto usando tabela de peças + FIPE (hoje a FIPE só traz valor do veículo).
7. **Detector de fraude por IA.** Cruzamento de padrões — mesma foto em placas diferentes, edição de imagem, timestamps incoerentes — sobre o `auditLog` existente.
8. **Overlay de câmera com contorno do veículo (AR leve).** A câmera mostra o silhueta do modelo sobreposto à peça real para marcar a avaria no ponto exato, offline.
9. **Exportação para seguradora via webhook assinado.** Envio automático do laudo (JSON + PDF) ao sistema da seguradora com Assinatura HMAC, além de PDF/WhatsApp.
10. **Score de conformidade do inspetor.** Pontuação de qualidade de laudo por operador (completude, fotos obrigatórias dos 4 lados), derivada da telemetria já coletada.

---

## 💎 10 Ideias Adicionais

Terceira leva de inovações, distinta das duas anteriores (existentes e futuras) — abrange ângulos jurídico, operacional, integração, UX, dados e sustentabilidade.

1. **Laudo multilíngue automático.** Gere o PDF em PT/ES/EN conforme o perfil do cliente (hoje só PT-BR).
2. **Modo "vistoria relâmpago".** Fluxo de 1 toque para devolução de locadora: só foto dos 4 lados + IA marca tudo, sem abrir o diagrama.
3. **Disparo automático via WhatsApp Business API.** Envio do laudo + QR ao cliente no momento da assinatura (hoje é `wa.me` manual).
4. **Backup georredundante de fotos com checksum.** Replica `photo_evidence` em 2 regiões e valida integridade das fotos originais (anti-perda).
5. **Timeline de vida do veículo.** Além de avarias, registra quilometragem, troca de óleo e pneus para histórico de valorização.
6. **Modo alto contraste para uso sob sol.** UI otimizada para leitura em pátio sob sol forte (acessibilidade operacional).
7. **Webhooks de evento para o cliente.** `inspection.issued`, `dispute.opened` disparam automações no sistema do cliente (Zapier/Make).
8. **Prova on-chain opcional.** Ancorar o hash numa blockchain pública para seguradoras que exigem prova não repudiável.
9. **Wizard de regularização DETRAN.** Pré-preenche o formulário do órgão a partir do laudo para transferência.
10. **Relatório de sustentabilidade da frota.** Disputas fechadas sem processo convertidas em economia e redução de desperdício.

---

<p align="center">
  <sub>Danos Aparentes — Inteligência Histórica Veicular • <a href="https://www.danosaparentes.com.br">www.danosaparentes.com.br</a></sub>
</p>

