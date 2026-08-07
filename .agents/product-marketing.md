# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-08-07

## Product Overview
**One-liner:** Danos Aparentes — a Plataforma Brasileira de Inteligência Histórica Veicular que cria a memória digital permanente de cada veículo.
**What it does:** Registra inspeções veiculares (avarias, fotos, assinaturas, GPS), organiza evidências, monta a linha do tempo e gera dossiês técnicos em PDF com validade jurídica e hash de autenticidade. Tudo offline-first, com sincronização na nuvem quando houver conexão.
**Product category:** Inspeção veicular / Histórico digital de veículo / Dossiê técnico cautelar. (Como o cliente busca: "vistoria de veículo", "laudo de avarias", "histórico do carro", "comprovar batida".
**Product type:** SaaS B2B (multitenant) com uso mobile/PWA em campo; white-label para empresas.
**Business model:** Freemium + assinatura. Trial de 7 dias sem cartão. Planos Starter (até 20 inspeções/mês), Pro (até 80, com marca própria + estatísticas) e Corporativo (equipe/ilimitado). Pagamento via Stripe e PIX.

## Target Audience
**Target companies:** Locadoras de veículos, concessionárias, seguradoras, oficinas/mecânicas, frotistas, peritos e vistoriadores autônomos, detrans/revendedores — no Brasil.
**Decision-makers:** Proprietário/gestor da locadora ou oficina (PMO/operações), gestor de frota, perito líder, e o próprio inspetor de campo que usa o app.
**Primary use case:** Comprovar o estado do veículo na entrada e na saída (devolução) para cobrar avarias e evitar disputas.
**Jobs to be done:**
- Registrar o estado do veículo com fotos e avarias antes/depois de locação ou reparo.
- Gerar um laudo técnico válido e rastreável para cobrança ou seguro.
- Manter um histórico digital permanente e consultável de cada veículo.
**Use cases:**
- Locadora: vistoria de devolução para cobrar danos do cliente.
- Seguradora: laudo para sinistro/perícia.
- Oficina: documentar serviço e avarias para o cliente.
- Frota: acompanhar evolução de danos ao longo do tempo.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Inspetor de campo (User) | Rapidez, funcionar offline no pátio, fotos fáceis | Sem sinal no pátio; papel/planilha perdida | App 100% offline que vira PDF em minutos |
| Gestor de Locadora/Oficina (Champion) | Cobrar avarias, reduzir disputas | Cliente nega o dano na devolução | Dossiê com foto+hash+GPS+assinatura já na devolução |
| Decision Maker (Dono/Gerente) | Custo-benefício, marca no PDF | Perda financeira com avarias não cobradas | Histórico centralizado + PDF com logo da empresa |
| Financial Buyer | Preço previsível, PIX | Incerteza de pagamento | Trial 7 dias grátis, planos por volume, PIX |

## Problems & Pain Points
**Core problem:** Na devolução de um veículo, o cliente nega as avarias e a locadora/oficina não tem prova rastreável — perde dinheiro e tempo em disputa.
**Why alternatives fall short:**
- Planilha/WhatsApp: não provam autoria nem data, não têm validade jurídica.
- Vistoria presencial de terceiro: cara, lenta, agendada.
- Câmera comum: fotos soltas sem vínculo com laudo nem hash.
**What it costs them:** Dinheiro de avarias não cobradas, horas de disputa, risco de seguro negado, imagem de desorganização.
**Emotional tension:** Medo de ser enganado, frustração de "sei que foi ele mas não tenho prova", insegurança jurídica.

## Competitive Landscape
**Direct:** Vistoria cautelar terceirizada (Carfax/Copart inspiraram, mas no BR são presenciais) — cai por ser lenta e cara por inspeção.
**Secondary:** Planilhas/WhatsApp/Google Fotos — caem por não terem validade, vínculo nem rastreabilidade.
**Indirect:** Confiar na palavra do cliente / não documentar — cai por ser comprovadamente arriscado.
**How each falls short for customers:** nenhuma entrega laudo PDF com hash + GPS + assinatura na hora, offline, e com validade para cobrança.

## Differentiation
**Key differentiators:** Histórico digital permanente; IA que sugere avarias; mapa de danos SVG interativo; assinatura digital + GPS + hash de autenticidade no PDF; 100% offline-first; selo/QR de verificação pública.
**How we do it differently:** O app registra no pátio (sem internet), une fotos+danos+assinatura num dossiê e ancora numa cadeia de auditoria — não é só "uma foto a mais".
**Why that's better:** Prova rastreável na hora da devolução, reduz disputas e libera cobrança.
**Why customers choose us:** A primeira plataforma BR de Inteligência Histórica Veicular, com validade jurídica e funcionamento offline.

## Objections
| Objection | Response |
|-----------|----------|
| "Não tenho internet no pátio." | Funciona 100% offline; sincroniza sozinho quando conectar. |
| "É caro / sem cartão?" | Trial 7 dias grátis sem cartão; PIX disponível; plano Starter a partir de R$ 29,90. |
| "O PDF tem validade jurídica?" | Sim: data/hora, GPS, assinatura na tela e hash digital de autenticidade + QR de verificação pública. |
**Anti-persona:** Quem só quer uma foto rápida de um arranhão para uso pessoal (sem necessidade de rastreabilidade/comprovação) — o app é pesado demais para ele; e quem recusa documentar (locadoras fraudulentas) não é público-alvo legítimo.

## Switching Dynamics
**Push:** Custo de disputas por avaria não comprovada; planilha perdida; vistoria terceirizada cara/lenta.
**Pull:** Laudo na hora, offline, com validade e QR de verificação.
**Habit:** Continuar com WhatsApp/fotos soltas porque "sempre foi assim".
**Anxiety:** "Meus dados na nuvem ficam seguros?" / "Vou perder o histórico se trocar de celular?" (RLS + IndexedDB cobrem: cada usuário só vê o próprio; sync na nuvem preserva).

## Customer Language
**How they describe the problem:**
- "O cliente devolveu o carro todo amassado e disse que não foi ele."
- "Não tenho como provar o estado do carro na entrega."
- "A seguradora negou porque faltava laudo."
**How they describe us:**
- "Agora tenho um laudo na hora, com foto e assinatura."
- "O histórico do carro num lugar só."
- "Comprovo as batidas na devolução."
**Words to use:** histórico digital, memória permanente, comprovar avarias, dossiê técnico, evidência, rastreabilidade, validade jurídica, laudo na hora, offline.
**Words to avoid:** "vistoria" como produto (é o meio, não o fim); "app de fotos"; jargão de dev ("IndexedDB", "sync_queue") com o cliente.
**Glossary:**
| Term | Meaning |
|------|---------|
| Dossiê técnico | Laudo PDF de inspeção com danos, fotos, assinaturas, GPS e hash. |
| Hash de autenticidade | Código que comprova que o PDF não foi alterado após emitido. |
| QR de verificação | Link público onde qualquer um confere a autenticidade do laudo. |
| Retorno | Vistoria de devolução que compara com a inspeção de entrada. |

## Brand Voice
**Tone:** Profissional, confiável, direto — com leve proximidade brasileira.
**Style:** Conversacional mas preciso; frases curtas; foca em prova e segurança.
**Personality:** Credível, técnico, organizado, defensor do dono do veículo/inspetor.

## Proof Points
**Metrics:** Trial 7 dias sem cartão; PDF gerado em minutos; 100% offline-first; RLS por usuário.
**Customers:** Locadoras, oficinas, frotistas e peritos (BR) — perfis atendidos nas páginas locadoras/seguradoras/frotas/oficinas.
**Testimonials:**
> "Comprovo as batidas na devolução." — gestor de locadora (tom representativo)
**Value themes:**
| Theme | Proof |
|-------|-------|
| Comprovação | Dossiê + hash + GPS + assinatura + QR |
| Histórico permanente | IndexedDB + nuvem, consulta por placa/modelo/OS |
| Inteligência | IA sugere avarias; linha do tempo compara entrada×saída |

## Goals
**Business goal:** Tornar-se a memória digital padrão de todo veículo no Brasil (referência em Inteligência Histórica Veicular).
**Conversion action:** Iniciar trial grátis de 7 dias (ou assinar um plano).
**Current metrics:** Não informado no repositório; trial 7 dias é a porta de entrada.

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-08-07) — Contexto inicial auto-draftado do código (README, layout, pricing, FAQs, nichos). Revisar ICP e depoimentos reais com o usuário.
