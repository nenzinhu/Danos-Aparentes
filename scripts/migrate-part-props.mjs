import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(__dirname, '../src/components/vehicles')
const block = /  function partProps\(id: string\) \{[\s\S]*?    \}\r?\n  \}\r?\n/
const importLine = "import { usePartProps } from './usePartProps'"
const hookLine = '  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)'

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.tsx') || file === 'VehicleDefs.tsx') continue
  const fp = path.join(dir, file)
  let src = fs.readFileSync(fp, 'utf8')
  if (!src.includes('function partProps(id: string)') || src.includes('usePartProps')) continue
  src = src.replace(block, hookLine + '\n\n')
  if (!src.includes('usePartProps')) {
    console.log('SKIP (no replace):', file)
    continue
  }
  src = src.replace(
    "import { VehicleProps } from '../../types'",
    `import { VehicleProps } from '../../types'\n${importLine}`,
  )
  fs.writeFileSync(fp, src)
  console.log('OK', file)
}
