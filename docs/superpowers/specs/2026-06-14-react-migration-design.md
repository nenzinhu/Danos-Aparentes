# AvariasAPARENTES — Migração para React

**Data:** 2026-06-14  
**Status:** Aprovado

---

## Objetivo

Migrar o app standalone `index.html` (7093 linhas, vanilla JS/CSS) para uma aplicação React moderna mantendo design e funcionalidades idênticos ou melhores. O servidor de desenvolvimento será o Vite com entry point padrão (`index.html` → `src/main.tsx`).

---

## Abordagem

**Migração direta:**
1. Restaurar `index.html` da raiz para entry point Vite padrão
2. Apagar todo conteúdo de `src/` (100% do zero)
3. Extrair os 24 blocos SVG do `index.html` em componentes React tipados
4. Portar CSS/tema neon para `src/index.css` com variáveis CSS intactas
5. Construir todos os componentes e hooks do zero

---

## Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS (layout/spacing)
- Variáveis CSS customizadas (design neon/glassmorphism)
- Framer Motion (transições entre vistas)
- html2pdf.js (geração de PDF)
- Web Speech API nativa (TTS gratuito)
- IndexedDB via wrapper customizado (persistência offline)

---

## Features (todas obrigatórias)

| Feature | Detalhe |
|---|---|
| 6 tipos de veículo | Car, Moto, Truck, Van, Bus, Custom |
| 4 vistas por veículo | lateral-left, lateral-right, frontal, traseira |
| SVG clicável | Partes nomeadas com `data-name`, click registra dano |
| Popover de dano | Flutuante sobre o SVG: Arranhado / Amassado / Quebrado / Sem avaria |
| Foto por dano | Câmera nativa, compressão via canvas, base64 |
| Nota por dano | Campo de texto por dano |
| Lista de avarias | Com contador, severidade colorida (leve/média/grave) |
| Formulário veículo | Proprietário, placa, marca, telefone |
| Observações gerais | Textarea livre |
| TTS | Motor (native/google), gênero, velocidade, tom, volume, falar ao clicar/hover |
| PDF profissional | SVGs + tabela de danos, html2pdf.js |
| Copiar relatório | Texto formatado para clipboard |
| Exportar TXT | Download de arquivo texto |
| WhatsApp texto | Abre wa.me com relatório formatado |
| WhatsApp PDF | Gera PDF e abre compartilhamento nativo |
| Vistorias salvas | IndexedDB: salvar, carregar, excluir vistorias completas |
| Dark / Light mode | Classe `light` no `<html>`, variáveis CSS |
| Design neon | Fiel ao original: glassmorphism, glow, gradientes |

**Melhorias sobre o original:**
- Zoom/pan no SVG com suporte a pinch (mobile)
- Transições animadas entre vistas (Framer Motion)
- Toast notifications substituindo `alert()`
- Estado 100% reativo (sem `document.getElementById`)

---

## Tipos de Dados

```ts
type VehicleType = 'car' | 'moto' | 'truck' | 'van' | 'bus' | 'custom'
type ViewType = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira'
type DamageType = 'scratch' | 'dent' | 'broken'
type Severity = 'low' | 'medium' | 'high'

interface Damage {
  id: string
  vehicle: VehicleType
  view: ViewType
  partId: string
  partName: string
  type: DamageType
  typeName: string
  severity: Severity
  notes: string
  photos: string[]
}

interface VehicleInfo {
  owner: string; phone: string; brand: string
  plate: string; generalNotes: string
}

interface SavedReport {
  id: string; savedAt: number
  vehicleInfo: VehicleInfo; damages: Damage[]
}

interface TtsConfig {
  active: boolean; hoverActive: boolean
  engine: 'native' | 'google-tts'
  gender: 'male' | 'female'
  rate: number; pitch: number; volume: number
}
```

---

## Arquitetura de Componentes

```
src/
├── main.tsx                  # mount App em #root
├── App.tsx                   # estado global + layout principal
├── index.css                 # variáveis CSS neon + dark/light + reset
├── types.ts
│
├── components/
│   ├── Header.tsx            # título, badges, botões dark/light + saved reports
│   ├── VehicleSelector.tsx   # tabs Car/Moto/Truck/Van/Bus/Custom
│   ├── ViewSelector.tsx      # tabs lateral-esq/lateral-dir/frontal/traseira
│   ├── VehicleViewer.tsx     # SVG ativo + zoom/pan + hint bar + DamageFloat
│   ├── DamageFloat.tsx       # popover: Arranhado/Amassado/Quebrado/Sem avaria
│   ├── DamageList.tsx        # lista de avarias com foto/nota editáveis
│   ├── VehicleInfoForm.tsx   # formulário proprietário/placa/marca/telefone
│   ├── GeneralNotes.tsx      # textarea observações gerais
│   ├── ReportActions.tsx     # WhatsApp, WhatsApp PDF, PDF, Copiar, TXT
│   ├── SavedReportsModal.tsx # modal vistorias salvas (IndexedDB)
│   ├── TtsSettings.tsx       # painel configurações de voz
│   └── vehicles/
│       ├── registry.ts       # mapa VehicleType → ViewType → Component
│       ├── CarLateralLeft.tsx
│       ├── CarLateralRight.tsx
│       ├── CarFrontal.tsx
│       ├── CarTraseira.tsx
│       ├── MotoLateralLeft.tsx
│       ├── MotoLateralRight.tsx
│       ├── MotoFrontal.tsx
│       ├── MotoTraseira.tsx
│       ├── TruckLateralLeft.tsx
│       ├── TruckLateralRight.tsx
│       ├── TruckFrontal.tsx
│       ├── TruckTraseira.tsx
│       ├── VanLateralLeft.tsx
│       ├── VanLateralRight.tsx
│       ├── VanFrontal.tsx
│       ├── VanTraseira.tsx
│       ├── BusLateralLeft.tsx
│       ├── BusLateralRight.tsx
│       ├── BusFrontal.tsx
│       ├── BusTraseira.tsx
│       ├── CustomLateralLeft.tsx
│       ├── CustomLateralRight.tsx
│       ├── CustomFrontal.tsx
│       └── CustomTraseira.tsx
│
├── hooks/
│   ├── useDamages.ts         # CRUD de danos + sync IndexedDB
│   ├── useTts.ts             # Web Speech API + config
│   ├── useZoomPan.ts         # zoom/pan mouse + touch/pinch no SVG
│   └── useSavedReports.ts   # salvar/carregar/excluir vistorias completas
│
└── lib/
    ├── db.ts                 # IndexedDB wrapper (damages + metadata + saved)
    ├── pdf.ts                # gerar PDF com html2pdf.js
    ├── report.ts             # formatar texto, clipboard, TXT, WhatsApp
    └── imageUtils.ts         # compressão de foto via canvas → base64
```

---

## Fluxo de Estado

```
App
├── vehicleType: VehicleType          (useState)
├── viewType: ViewType                (useState)
├── darkMode: boolean                 (useState, persiste localStorage)
├── selectedPart: {id,name} | null   (useState)
│
├── useDamages()
│   ├── damages: Damage[]
│   ├── addDamage / removeDamage / updateDamage / clearDamages
│   └── → sincroniza IndexedDB automaticamente
│
├── useTts()
│   ├── config: TtsConfig
│   ├── speak(text)
│   └── → persiste config no localStorage
│
└── useSavedReports()
    ├── saved: SavedReport[]
    ├── save / load / remove
    └── → IndexedDB store separado
```

---

## CSS Strategy

- Variáveis CSS do `index.html` portadas integralmente para `src/index.css`
- Dark mode: padrão (`:root`)
- Light mode: `html.light { ... }` sobrescreve as variáveis
- Tailwind: apenas utilitários de layout (`flex`, `grid`, `gap`, `p-`, `m-`)
- Estilos visuais (glow, glass, gradientes): via variáveis CSS + classes customizadas em `index.css`
- Font: Outfit (Google Fonts, já no projeto)

---

## SVG Components

Cada componente de veículo recebe:
```ts
interface VehicleProps {
  damages: Damage[]
  selectedPartId: string | null
  onPartClick: (id: string, name: string) => void
  onPartHover: (id: string, name: string) => void
}
```

As partes clicáveis têm `className="part"` e `data-name="Nome da Peça"`. Danos colorem a parte com a cor da severidade (`low`: amarelo, `medium`: laranja, `high`: vermelho).

---

## Ordem de Implementação

1. Restaurar `index.html` (entry point Vite)
2. Limpar `src/`
3. `types.ts` + `src/index.css`
4. `lib/db.ts` + `lib/imageUtils.ts`
5. `hooks/useDamages.ts` + `hooks/useZoomPan.ts`
6. 24 componentes SVG de veículos + `registry.ts`
7. `VehicleViewer.tsx` + `DamageFloat.tsx`
8. `VehicleSelector.tsx` + `ViewSelector.tsx`
9. `DamageList.tsx` + `VehicleInfoForm.tsx` + `GeneralNotes.tsx`
10. `hooks/useTts.ts` + `TtsSettings.tsx`
11. `lib/pdf.ts` + `lib/report.ts` + `ReportActions.tsx`
12. `hooks/useSavedReports.ts` + `SavedReportsModal.tsx`
13. `Header.tsx` + `App.tsx` + `main.tsx`
14. Testes manuais + ajustes visuais
