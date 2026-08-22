# Autofill de nome e CPF a partir do scanner de CNH

## Contexto

O app já tem um scanner offline do código de barras PDF417 do verso da CNH
([src/lib/cnhBarcode.ts](../../../src/lib/cnhBarcode.ts),
[src/components/CnhScanner.tsx](../../../src/components/CnhScanner.tsx)),
usado hoje só para preencher automaticamente o número de registro da CNH
(campo 3 do barcode) no formulário de vistoria.

O mesmo texto decodificado do barcode já contém, nos campos anteriores, o
**nome completo** (campo 0) e o **CPF** (campo 1) da pessoa — dado público
do padrão DENATRAN/SENATRAN de CNH, sem custo, sem chamada de rede e sem
implicação de LGPD de terceiros (é o próprio documento que o inspetor está
fotografando, offline, no ato da vistoria).

Motivação original: eliminar mais um campo de digitação manual (e erro de
transcrição), reduzindo o mesmo tipo de atrito já documentado nos posts do
blog sobre redigitação. Foi avaliada e descartada uma consulta paga de CPF
por API de terceiros (nome a partir só do CPF é dado sensível pela LGPD,
custo por consulta, nenhuma fonte pública/gratuita existe) em favor de
reaproveitar dado que já está disponível localmente no barcode.

## Escopo

Extensão pontual do fluxo de scan de CNH já existente. Sem telas novas, sem
mudança de schema no Supabase, sem novas dependências.

## Design

### Extração dos campos

`extractCnhNumberFromBarcode(rawText): string | null` em
`src/lib/cnhBarcode.ts` é substituída por:

```ts
extractCnhFieldsFromBarcode(rawText: string): {
  nome: string | null
  cpf: string | null
  cnhNumber: string | null
}
```

- **Nome** (campo 0): normalizado para Title Case antes de retornar (ex.:
  `"JOAO DA SILVA"` → `"Joao Da Silva"`). Sem validação de formato além de
  "não vazio".
- **CPF** (campo 1): dígitos extraídos e validados pelo algoritmo padrão de
  dígito verificador de CPF. Se a validação falhar, retorna `null` para esse
  campo (não bloqueia os demais).
- **cnhNumber** (campo 3): mantém a validação atual (11 dígitos), sem
  mudança de comportamento.

Cada campo é validado e retornado **independentemente** — falha em um não
invalida os outros (ex.: CPF corrompido no barcode não impede que nome e
CNH sejam preenchidos).

### Propagação do resultado

`CnhScanner` (`src/components/CnhScanner.tsx`) troca a assinatura de
`onResult`:

```ts
// antes
onResult: (cnhNumber: string) => void
// depois
onResult: (fields: { nome: string | null; cpf: string | null; cnhNumber: string | null }) => void
```

O resto do componente (câmera, timeout de 15s, captura do snapshot como
evidência em `document-photos`) não muda.

### Preenchimento no formulário

Em `VehicleInfoForm.tsx`, o callback do scanner passa a fazer:

```ts
onResult={(fields) => {
  if (fields.nome) set('owner', fields.nome)
  if (fields.cpf) set('cpf', fields.cpf)
  if (fields.cnhNumber) set('cnh', fields.cnhNumber)
  setShowCnhScanner(false)
}}
```

Cada `set(...)` só ocorre se o respectivo campo veio válido — se o
inspetor já tinha digitado algo manualmente antes de escanear, o valor
escaneado **sobrescreve**, seguindo o mesmo comportamento que o campo de
CNH já tem hoje.

### Title Case ao vivo no campo "Proprietário / Cliente"

Novo helper `formatTitleCase(val: string): string` em `VehicleInfoForm.tsx`
(mesmo arquivo/padrão de `formatCPF`, já existente), aplicado tanto ao
valor vindo do scanner quanto **na digitação manual em tempo real**:

```ts
// campo owner, hoje:
onChange={e => set('owner', e.target.value)}
// depois:
onChange={e => set('owner', formatTitleCase(e.target.value))}
```

Isso unifica o comportamento: o nome do proprietário sempre aparece em
Title Case no formulário e no PDF gerado, seja ele digitado ou escaneado.

## Fora de escopo

- Data de nascimento, categoria e validade da CNH (campos existem no
  barcode, mas não há campo correspondente no formulário/PDF hoje; exigiria
  mudança de schema para um dado sem uso definido — não faz parte desta
  extensão).
- Modal de confirmação antes de preencher (avaliado e descartado: quebraria
  a fluidez que já existe hoje para o preenchimento do número da CNH, que
  também é aplicado sem confirmação).
- Testes automatizados: verificação será manual (escanear uma CNH real ou
  usar uma string de exemplo do barcode e conferir nome/CPF/CNH), mesmo
  nível de cobertura que a feature de CNH number já tem hoje no repo.

## Verificação

1. `npx tsc --noEmit` sem erros novos.
2. Escanear uma CNH física (ou simular com uma string de barcode de
   exemplo) e confirmar que nome, CPF e número da CNH preenchem
   corretamente no formulário.
3. Testar um CPF com dígito verificador inválido no barcode simulado e
   confirmar que o campo CPF não é sobrescrito, mas nome e CNH continuam
   preenchendo normalmente.
4. Digitar manualmente no campo "Proprietário / Cliente" e confirmar que o
   texto aparece em Title Case em tempo real.
