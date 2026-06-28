import React from 'react'

// Figura de uma "folha de PDF" do laudo, como ele sai do app — com a
// logo e o nome da EMPRESA DO CLIENTE no cabeçalho (white-label).
// Usada nos artigos do blog para mostrar o resultado real.
export function LaudoSheet() {
  return (
    <figure className="not-prose my-8">
      <div className="mx-auto max-w-[420px] rounded-xl overflow-hidden bg-white text-slate-900 shadow-2xl ring-1 ring-black/10">
        {/* Barra superior colorida */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#1d4ed8,#06b6d4,#3b82f6)' }} />

        {/* Cabeçalho — logo e nome DO CLIENTE */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3" style={{ background: '#0b1f3c' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-lg border-2 border-dashed border-sky-300/60 flex flex-col items-center justify-center text-center leading-none shrink-0">
              <span className="text-[7px] font-black uppercase tracking-tight text-sky-200">Sua logo</span>
              <span className="text-[6px] font-bold text-sky-300/70 mt-0.5">aqui</span>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-tight text-sky-50">Nome da sua empresa</p>
              <p className="text-[7px] font-semibold tracking-wider text-sky-300/80">Concessionária · Locadora · Despachante</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded border border-sky-300/40 text-sky-50">RDT3333</span>
            <p className="text-[8px] font-bold mt-1 text-sky-300/80">OS: 2312321</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Identificação */}
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-blue-700 block mb-2">Identificação do veículo</span>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[9px]">
              <div><span className="text-slate-400 text-[8px] block">Marca / Modelo</span><strong className="font-semibold">Fiat Toro Freedom 2020</strong></div>
              <div><span className="text-slate-400 text-[8px] block">Placa</span><strong className="font-semibold">RDT3333</strong></div>
              <div><span className="text-slate-400 text-[8px] block">Cor</span><strong className="font-semibold">Branca</strong></div>
              <div><span className="text-slate-400 text-[8px] block">Local</span><strong className="font-semibold">São José / SC</strong></div>
            </div>
          </div>

          {/* Detalhamento */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-2.5 py-1.5" style={{ background: '#2563eb' }}>
              <span className="text-[7px] font-extrabold text-white uppercase tracking-widest">Detalhamento técnico das avarias</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[6.5px] uppercase text-slate-500 font-bold">
                  <th className="px-2 py-1">Peça</th><th className="px-2 py-1">Tipo</th><th className="px-2 py-1 text-center">Grau</th>
                </tr>
              </thead>
              <tbody className="text-[7px] text-slate-700">
                <tr className="border-t border-slate-100"><td className="px-2 py-1.5 font-bold uppercase">Porta Diant. Esq.</td><td className="px-2 py-1.5">✏️ Riscos / Abrasão</td><td className="px-2 py-1.5 text-center"><span className="text-amber-600 font-black uppercase">Leve</span></td></tr>
                <tr className="border-t border-slate-100"><td className="px-2 py-1.5 font-bold uppercase">Porta Tras. Esq.</td><td className="px-2 py-1.5">✏️ Riscos / Abrasão</td><td className="px-2 py-1.5 text-center"><span className="text-amber-600 font-black uppercase">Leve</span></td></tr>
              </tbody>
            </table>
          </div>

          {/* Validação */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <span className="text-[7px] font-black uppercase text-slate-400 block tracking-widest">Hash SHA-256</span>
              <code className="text-[7px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded block max-w-[150px] break-all">EEA9011EA43BCD2177DBB4F6CA639B87</code>
            </div>
            <div className="w-9 h-9 border border-slate-200 rounded grid place-items-center bg-white">
              <svg viewBox="0 0 7 7" className="w-7 h-7" shapeRendering="crispEdges" aria-hidden="true">
                <rect width="7" height="7" fill="#fff" />
                {[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[6,0],[5,1],[4,2],[6,2],[0,4],[2,4],[1,5],[4,4],[6,4],[5,5],[4,6],[6,6],[3,3]].map(([x,y],i)=>(
                  <rect key={i} x={x} y={y} width="1" height="1" fill="#0f172a" />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[0.8rem] text-[var(--text-muted)]">
        Exemplo real do PDF gerado. <strong className="text-[var(--text-main)]">A logo e o nome do cabeçalho são os da sua empresa</strong> —
        personalizáveis nas configurações.
      </figcaption>
    </figure>
  )
}
