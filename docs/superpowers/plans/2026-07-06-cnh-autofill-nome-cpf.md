# CNH Autofill de Nome e CPF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estender o scanner de código de barras da CNH (que hoje só extrai o número de registro) para também preencher automaticamente o nome do proprietário e o CPF no formulário de vistoria, e aplicar Title Case ao vivo no campo de nome também quando digitado manualmente.

**Architecture:** O texto já decodificado do barcode PDF417 da CNH contém nome (campo 0) e CPF (campo 1) além do registro da CNH (campo 3) já usado. Uma única função pura em `src/lib/cnhBarcode.ts` passa a extrair e validar os três campos independentemente; o componente de câmera (`CnhScanner.tsx`) só muda o tipo do callback; o formulário (`VehicleInfoForm.tsx`) aplica cada campo validado e usa a mesma função de Title Case tanto no valor escaneado quanto na digitação manual.

**Tech Stack:** TypeScript, React (Next.js), ZXing (`@zxing/browser`, já em uso, sem mudança), `npx tsx` para rodar scripts de verificação ad-hoc (já presente em `node_modules/.bin`, sem instalar nova dependência).

## Global Constraints

- Sem mudança de schema no Supabase.
- Sem novas dependências de projeto (bibliotecas, APIs externas).
- Sem testes automatizados novos no repositório (não há test runner configurado); verificação via script `tsx` descartável + checagem manual, conforme decidido na spec.
- CPF extraído do barcode só é aplicado ao formulário se passar na validação de dígito verificador; caso contrário o campo permanece como estava.
- Nome extraído do barcode (e digitado manualmente) é sempre normalizado para Title Case.
- Cada campo (nome, cpf, número da CNH) é preenchido de forma independente — falha em um não bloqueia os demais.

---

### Task 1: Extrair e validar nome/CPF/CNH em `cnhBarcode.ts`

**Files:**
- Modify: `src/lib/cnhBarcode.ts` (arquivo inteiro, 14 linhas hoje)
- Verify (script descartável, criado e removido nesta task): `scratch-cnhbarcode.ts` na raiz do projeto

**Interfaces:**
- Consumes: nada (função pura, sem dependências externas)
- Produces:
  - `export function toTitleCase(value: string): string` — usado por esta task e pela Task 3
  - `export function extractCnhFieldsFromBarcode(rawText: string): { nome: string | null; cpf: string | null; cnhNumber: string | null }` — usado pela Task 2
  - Remove o export anterior `extractCnhNumberFromBarcode` (sem mais consumidores após a Task 2)

- [ ] **Step 1: Escrever o script de verificação (vai falhar, pois a função ainda não existe)**

Criar `scratch-cnhbarcode.ts` na raiz do projeto (mesmo nível de `package.json`):

```ts
import assert from 'node:assert'
import { extractCnhFieldsFromBarcode } from './src/lib/cnhBarcode'

const VALID_CPF = '11144477735'
const INVALID_CPF = '11144477730'

// Caso 1: todos os campos válidos
const sample = ['JOAO DA SILVA', VALID_CPF, '123456789', '12345678901', '01012030'].join('\n')
const result = extractCnhFieldsFromBarcode(sample)
assert.strictEqual(result.nome, 'Joao Da Silva')
assert.strictEqual(result.cpf, VALID_CPF)
assert.strictEqual(result.cnhNumber, '12345678901')

// Caso 2: CPF com dígito verificador inválido não deve ser preenchido,
// mas nome e CNH continuam preenchendo normalmente
const sampleBadCpf = ['MARIA SOUZA', INVALID_CPF, '987654321', '98765432100', '01012030'].join('\n')
const result2 = extractCnhFieldsFromBarcode(sampleBadCpf)
assert.strictEqual(result2.cpf, null)
assert.strictEqual(result2.nome, 'Maria Souza')
assert.strictEqual(result2.cnhNumber, '98765432100')

// Caso 3: registro de CNH com menos de 11 dígitos não deve ser preenchido,
// mas nome e CPF continuam preenchendo normalmente
const sampleBadCnh = ['PEDRO ALVES', VALID_CPF, '111222333', '123', '01012030'].join('\n')
const result3 = extractCnhFieldsFromBarcode(sampleBadCnh)
assert.strictEqual(result3.cnhNumber, null)
assert.strictEqual(result3.cpf, VALID_CPF)
assert.strictEqual(result3.nome, 'Pedro Alves')

console.log('OK: extractCnhFieldsFromBarcode passou em todos os casos')
```

- [ ] **Step 2: Rodar o script e confirmar que falha**

Run: `npx tsx scratch-cnhbarcode.ts`
Expected: erro em tempo de execução (`TypeError: extractCnhFieldsFromBarcode is not a function` ou equivalente), já que a função ainda não existe em `src/lib/cnhBarcode.ts`.

- [ ] **Step 3: Implementar `src/lib/cnhBarcode.ts` por completo**

Substituir todo o conteúdo do arquivo por:

```ts
// Leitura do código de barras PDF417 do verso da CNH brasileira.
//
// O layout de campos é público (padrão DENATRAN/SENATRAN): os campos vêm
// separados por quebra de linha — nome, cpf, identidade, registro CNH,
// validade, ... — isso é bem mais confiável que OCR de texto solto, que
// sofre com fonte/reflexo/foto tremida.

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

// Validação padrão de dígito verificador de CPF (dois dígitos calculados
// a partir dos 9 primeiros). Usada só para decidir se o CPF lido do
// barcode é confiável o suficiente para preencher o formulário — não bloqueia
// digitação manual em nenhum outro lugar do app.
function isValidCpfChecksum(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  const calcDigit = (base: string, weightStart: number): number => {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (weightStart - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const d1 = calcDigit(digits.slice(0, 9), 10)
  const d2 = calcDigit(digits.slice(0, 9) + d1, 11)
  return digits === digits.slice(0, 9) + String(d1) + String(d2)
}

export function extractCnhFieldsFromBarcode(rawText: string): {
  nome: string | null
  cpf: string | null
  cnhNumber: string | null
} {
  const fields = rawText.split(/\r?\n/).map(f => f.trim()).filter(Boolean)

  const nomeRaw = fields[0] || ''
  const nome = nomeRaw.length > 0 ? toTitleCase(nomeRaw) : null

  const cpfDigits = (fields[1] || '').replace(/\D/g, '')
  const cpf = isValidCpfChecksum(cpfDigits) ? cpfDigits : null

  const registro = fields[3] || ''
  const cnhDigits = registro.replace(/\D/g, '')
  // Registro de CNH tem 11 dígitos.
  const cnhNumber = cnhDigits.length === 11 ? cnhDigits : null

  return { nome, cpf, cnhNumber }
}
```

- [ ] **Step 4: Rodar o script e confirmar que passa**

Run: `npx tsx scratch-cnhbarcode.ts`
Expected: imprime `OK: extractCnhFieldsFromBarcode passou em todos os casos` e sai com código 0, sem erros.

- [ ] **Step 5: Remover o script descartável e checar tipos**

Run: `rm scratch-cnhbarcode.ts`
Run: `npx tsc --noEmit`
Expected: nenhum erro de tipo (o único consumidor antigo, `CnhScanner.tsx`, ainda importa o nome antigo — isso é esperado e será corrigido na Task 2; se `tsc` acusar erro em `CnhScanner.tsx` por causa disso, é o esperado nesta task).

- [ ] **Step 6: Commit**

```bash
git add src/lib/cnhBarcode.ts
git commit -m "feat(vistoria): extrai nome e CPF do barcode da CNH, com validação"
```

---

### Task 2: Atualizar `CnhScanner` para repassar os três campos

**Files:**
- Modify: `src/components/CnhScanner.tsx`

**Interfaces:**
- Consumes: `extractCnhFieldsFromBarcode` de `../lib/cnhBarcode` (Task 1) — assinatura `(rawText: string) => { nome: string | null; cpf: string | null; cnhNumber: string | null }`
- Produces: prop `onResult: (fields: { nome: string | null; cpf: string | null; cnhNumber: string | null }) => void` — consumida pela Task 3

- [ ] **Step 1: Trocar o import e a assinatura da prop `onResult`**

Em `src/components/CnhScanner.tsx`, linha 3, trocar:

```ts
import { extractCnhNumberFromBarcode } from '../lib/cnhBarcode'
```

por:

```ts
import { extractCnhFieldsFromBarcode } from '../lib/cnhBarcode'
```

E trocar a interface `Props` (linhas 6-9):

```ts
interface Props {
  onResult: (cnhNumber: string) => void
  onClose: () => void
}
```

por:

```ts
interface Props {
  onResult: (fields: { nome: string | null; cpf: string | null; cnhNumber: string | null }) => void
  onClose: () => void
}
```

- [ ] **Step 2: Atualizar o callback de decodificação**

No corpo de `decodeFromVideoDevice` (linhas 31-51), trocar:

```ts
          (result, _err, ctrl) => {
            if (cancelled || !result) return
            const cnhNumber = extractCnhNumberFromBarcode(result.getText())
            if (!cnhNumber) return

            clearTimeout(timeoutId)
            ctrl.stop()
            cancelled = true

            // Snapshot do frame atual para guardar como evidência (best-effort).
            const video = videoRef.current
            if (video) {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              canvas.getContext('2d')?.drawImage(video, 0, 0)
              canvas.toBlob(blob => { if (blob) uploadCnhPhoto(blob) }, 'image/jpeg', 0.85)
            }

            onResult(cnhNumber)
          },
```

por:

```ts
          (result, _err, ctrl) => {
            if (cancelled || !result) return
            const fields = extractCnhFieldsFromBarcode(result.getText())
            // Registro da CNH continua sendo o sinal de "leitura bem-sucedida":
            // é o campo mais estável do barcode e já era usado assim antes
            // desta mudança. Nome e CPF, quando também vierem válidos no
            // mesmo frame, são repassados junto.
            if (!fields.cnhNumber) return

            clearTimeout(timeoutId)
            ctrl.stop()
            cancelled = true

            // Snapshot do frame atual para guardar como evidência (best-effort).
            const video = videoRef.current
            if (video) {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              canvas.getContext('2d')?.drawImage(video, 0, 0)
              canvas.toBlob(blob => { if (blob) uploadCnhPhoto(blob) }, 'image/jpeg', 0.85)
            }

            onResult(fields)
          },
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: erro apontando `src/components/VehicleInfoForm.tsx` (o call site ainda não foi atualizado — esperado nesta task, será corrigido na Task 3). Nenhum erro deve apontar para `CnhScanner.tsx` em si.

- [ ] **Step 4: Commit**

```bash
git add src/components/CnhScanner.tsx
git commit -m "feat(vistoria): CnhScanner repassa nome e CPF junto com o nº da CNH"
```

---

### Task 3: Preencher nome/CPF/CNH no formulário e aplicar Title Case ao digitar

**Files:**
- Modify: `src/components/VehicleInfoForm.tsx:6` (import), `:798` (campo owner), `:930-933` (callback do scanner)

**Interfaces:**
- Consumes:
  - `toTitleCase` de `../lib/cnhBarcode` (Task 1) — assinatura `(value: string) => string`
  - `CnhScanner` com prop `onResult: (fields: { nome: string | null; cpf: string | null; cnhNumber: string | null }) => void` (Task 2)
  - `set(field: keyof VehicleInfo, value: string): void` — já existe em `VehicleInfoForm.tsx:263`, sem mudança
- Produces: nada consumido por outras tasks (fim da cadeia)

- [ ] **Step 1: Importar `toTitleCase`**

Em `src/components/VehicleInfoForm.tsx`, linha 6, trocar:

```ts
import CnhScanner from './CnhScanner'
```

por:

```ts
import CnhScanner from './CnhScanner'
import { toTitleCase } from '../lib/cnhBarcode'
```

- [ ] **Step 2: Aplicar Title Case ao digitar no campo "Proprietário / Cliente"**

Na linha 798, trocar:

```tsx
<input id="owner-input" className={inputClasses} value={info.owner} onChange={e => set('owner', e.target.value)} placeholder="Ex: João Silva" />
```

por:

```tsx
<input id="owner-input" className={inputClasses} value={info.owner} onChange={e => set('owner', toTitleCase(e.target.value))} placeholder="Ex: João Silva" />
```

- [ ] **Step 3: Preencher nome, CPF e CNH a partir do resultado do scanner**

Nas linhas 929-934, trocar:

```tsx
                  {showCnhScanner && (
                    <CnhScanner
                      onResult={(cnhNumber) => { set('cnh', cnhNumber); setShowCnhScanner(false) }}
                      onClose={() => setShowCnhScanner(false)}
                    />
                  )}
```

por:

```tsx
                  {showCnhScanner && (
                    <CnhScanner
                      onResult={(fields) => {
                        // Nome já vem em Title Case de extractCnhFieldsFromBarcode.
                        if (fields.nome) set('owner', fields.nome)
                        if (fields.cpf) set('cpf', fields.cpf)
                        if (fields.cnhNumber) set('cnh', fields.cnhNumber)
                        setShowCnhScanner(false)
                      }}
                      onClose={() => setShowCnhScanner(false)}
                    />
                  )}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum erro.

- [ ] **Step 5: Verificação manual no navegador**

Run: iniciar o servidor de dev (`npm run dev`) e abrir o app.

Checklist manual (conforme a seção "Verificação" da spec):
1. Digitar manualmente no campo "Proprietário / Cliente" (ex: `joao da silva`) e confirmar que aparece como `Joao Da Silva` em tempo real.
2. Abrir o scanner de CNH (botão 📷 ao lado do campo de nº da CNH) e escanear uma CNH real (ou apontar para um código de barras PDF417 de teste gerado com os campos `nome\ncpf\nidentidade\nregistro\nvalidade`) e confirmar que nome, CPF e nº da CNH preenchem corretamente.
3. Repetir o scan com um CPF de dígito verificador inválido no barcode de teste e confirmar que o campo CPF não é sobrescrito, mas nome e CNH continuam preenchendo.

- [ ] **Step 6: Commit**

```bash
git add src/components/VehicleInfoForm.tsx
git commit -m "feat(vistoria): autofill de nome e CPF a partir do scanner de CNH"
```
