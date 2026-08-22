import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const root = 'src'
const endpoints = new Set()
const files = []
function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    const s = statSync(p)
    if (s.isDirectory()) walk(p)
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) files.push(p)
  }
}
walk(root)

const re = /\/api\/[a-zA-Z0-9_-]+/g
for (const f of files) {
  const txt = readFileSync(f, 'utf8')
  let m
  while ((m = re.exec(txt))) endpoints.add(m[0])
}

// For each endpoint, find caller context: the fetch/axios + method + query/body
const report = []
for (const ep of [...endpoints].sort()) {
  const callers = []
  for (const f of files) {
    const txt = readFileSync(f, 'utf8')
    const lines = txt.split('\n')
    lines.forEach((line, i) => {
      if (line.includes(ep)) {
        const ctx = lines.slice(Math.max(0, i - 4), i + 5).map((l, j) => `  ${j - 4}: ${l}`).join('\n')
        callers.push(`FILE ${f}:${i + 1}\n${ctx}`)
      }
    })
  }
  report.push(`\n===== ${ep} (${callers.length} refs) =====\n` + callers.join('\n---\n'))
}
console.log(report.join('\n'))
