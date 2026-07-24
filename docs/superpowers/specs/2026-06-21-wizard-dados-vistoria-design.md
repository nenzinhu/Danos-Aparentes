# Design: Wizard de Dados da Vistoria

**Data:** 2026-06-21  
**Status:** Aprovado  
**Escopo:** Reorganizar o formulário de dados do cliente/veículo (`VehicleInfoForm`) em wizard de 3 passos, focado em clareza e facilidade no celular, sem alterar modelo de dados nem backend.

## Problema

O formulário atual (`VehicleInfoForm.tsx`) concentra placa, cliente, documentos, veículo, local, observações, campos personalizados e assinaturas em **uma única página longa**, com seções reordenáveis via ↑/↓. Funciona, mas no celular exige muita rolagem e dispersa a atenção durante a vistoria.

O usuário confirmou que o fluxo de marcar avarias está satisfatório; o gargalo percebido é **organizar e digitar os dados do cliente/veículo** de forma mais clara.

## Objetivo

Substituir a lista vertical longa por um **wizard guiado em 3 passos**:

1. **Veículo** — placa, consulta API, dados do veículo e local  
2. **Cliente** — proprietário, telefone, perfil/OS, documentos  
3. **Finalizar** — observações, campos personalizados, assinaturas  

Manter toda a lógica existente (formatação, API de placa, filtros de campos, PDF/sync inalterados).

## Abordagem escolhida

**Wizard fixo em 3 passos** (abordagem 1 da brainstorm). Descartadas:

- Wizard + modo scroll completo dual (dois layouts para manter)  
- Wizard só no mobile e scroll no desktop (comportamento inconsistente)  

## Arquitetura

### Componentes

| Componente | Responsabilidade |
|------------|------------------|
| `VehicleInfoForm.tsx` | Orquestra wizard, estado `wizardStep`, agrupa seções por passo |
| `WizardStepper.tsx` *(novo)* | Barra “1 Veículo · 2 Cliente · 3 Finalizar”; indica ativo/concluído; permite voltar a passos visitados |
| `WizardNav.tsx` *(inline ou no mesmo arquivo)* | Rodapé sticky: Voltar / Continuar / Concluir dados |

### Mapeamento de seções → passos

| Passo | Conteúdo (seções atuais) |
|-------|--------------------------|
| 1 — Veículo | Bloco consulta de placa + `veiculo` + `local` |
| 2 — Cliente | `perfil` + `cliente` + `documentos` |
| 3 — Finalizar | `observacoes` + `personalizados` + `assinaturas` |

Ordem **fixa** no wizard. Controles ↑/↓ de reordenar seções **removidos da UI principal** (podem permanecer apenas no painel ⚙️ avançado, se necessário no futuro).

### Fluxo de dados

- **`VehicleInfo`** e **`onChange`**: inalterados.  
- Consulta de placa, `formatCPF`, `formatPhone`, campos personalizados, `SignaturePad`: mesma implementação, apenas renderizados no passo correspondente.  
- PDF (`pdf.ts`), sync (`sync.ts`), vistorias salvas: sem mudança — consomem o mesmo objeto.

### Estado do wizard

| Estado | Armazenamento | Reset |
|--------|---------------|-------|
| `wizardStep` (1 \| 2 \| 3) | `useState` | “Limpar tudo” em `app/page.tsx` → passo 1 |
| `maxStepVisited` (opcional) | `useState` | idem — permite clicar só em passos já visitados |
| Persistência opcional | `localStorage` key `vistoria_wizard_step` | “Limpar tudo”; opcional |

Ao **carregar vistoria salva**: abrir no **passo 1** (revisão completa dos dados).

## UI / UX

### Stepper (topo do card)

```
[ 1 Veículo ] — [ 2 Cliente ] — [ 3 Finalizar ]
```

- Ativo: destaque sky-400  
- Concluído: ✓ verde, clicável para voltar  
- Futuro: cinza, não clicável  

Título complementar: **“Dados da vistoria — Passo X de 3”**.

### Layout por passo

**Passo 1 — Veículo**

- Bloco da placa (visual atual mantido)  
- Grid responsivo: marca, cor, tipo, cidade/UF  
- Rodapé: apenas **Continuar →**

**Passo 2 — Cliente**

- Nome e telefone (largura total)  
- Perfil + Nº OS (2 colunas em `sm+`)  
- CPF, CNH, categoria (grid responsivo)  
- Rodapé: **← Voltar** | **Continuar →**

**Passo 3 — Finalizar**

- Observações gerais  
- Campos personalizados (criar/listar como hoje)  
- Assinaturas vistoriador + cliente (empilhadas no mobile, lado a lado em `sm+`)  
- Rodapé: **← Voltar** | **Concluir dados**

**Concluir dados:** toast “✅ Dados da vistoria prontos” + chamar `onToggleCollapse()` se disponível (minimizar card).

### Rodapé sticky (mobile)

Barra fixa dentro do card, ~48px, botões touch-friendly. `padding-bottom` no conteúdo do passo para evitar sobreposição.

### Header preservado

- **⚙️ Campos** (visibilidade de campos): mantido  
- **▲ Minimizar**: mantido  
- Campos ocultos via ⚙️ não aparecem no passo correspondente  

### Transições

Fade/slide leve (~200ms) entre passos; respeitar `prefers-reduced-motion: reduce`.

## Validação e erros

- **Nenhum campo obrigatório** para avançar entre passos (vistoria parcial permitida).  
- Estados da placa (idle / loading / found / error): inalterados.  
- Usuário pode marcar avarias antes de concluir o wizard.  
- Placa inválida ou offline: pode continuar com preenchimento manual no passo 1.

## Fora de escopo

- Wizard diferente por breakpoint (mobile vs desktop)  
- Modo “formulário completo” em scroll paralelo  
- Validação obrigatória por passo  
- Mover token da API de placa para server-side (tarefa de segurança separada)  
- Alterações em PDF, Stripe, Google Ads, landing  

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/VehicleInfoForm.tsx` | Wizard, agrupamento por passo, remoção ↑/↓ da UI principal |
| `src/components/WizardStepper.tsx` | Novo componente |
| `src/app/app/page.tsx` | Reset `wizardStep` em `handleClearAll` (via callback ref ou prop, se necessário) |

## Critérios de aceite (testes manuais)

1. Mobile: navegar passos 1→2→3 sem scroll excessivo por passo  
2. Placa encontrada na API → dados preenchidos no passo 1 → continuar para passo 2  
3. Placa não encontrada → preenchimento manual → continuar  
4. Ocultar CPF no ⚙️ → não aparece no passo 2  
5. Voltar do passo 2 para 1 sem perder dados digitados  
6. Salvar e carregar vistoria → todos os campos intactos  
7. “Limpar tudo” → volta ao passo 1 e limpa `VehicleInfo`  
8. Gerar PDF → campos refletem dados preenchidos no wizard  

## Riscos

| Risco | Mitigação |
|-------|-----------|
| `VehicleInfoForm.tsx` já é grande (~800 linhas) | Extrair `WizardStepper` + helpers de passo; evitar duplicar markup dos campos |
| Usuários acostumados com scroll longo | Wizard é o único modo; passos claros e voltar livre |
| Regressão em campos personalizados/assinaturas | Testes manuais 4, 6, 8 acima |

## Decisões de brainstorm registradas

- Público: genérico (autônomo, oficina, locadora, equipe)  
- Dor principal: organização dos dados do cliente, não marcar avarias  
- Preferência de layout: wizard em passos (opção D)  
- Abordagem: wizard fixo 3 passos (recomendada e aprovada)
