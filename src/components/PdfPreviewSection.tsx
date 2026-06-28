'use client';
import Reveal from './Reveal';

// QR Code simulado (mockup do laudo) — três marcadores de canto + módulos determinísticos
function QrCodeMock({ className = '' }: { className?: string }) {
  const N = 21
  const cells: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        cells[r0 + r][c0 + c] = edge || inner
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, N - 7)
  drawFinder(N - 7, 0)
  const reserved = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (reserved(r, c)) continue
      const v = (r * 73856093) ^ (c * 19349663) ^ ((r + c) * 83492791)
      cells[r][c] = Math.abs(v) % 100 > 52
    }
  }
  const rects: React.ReactNode[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (cells[r][c]) rects.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" />)
    }
  }
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} shapeRendering="crispEdges" preserveAspectRatio="xMidYMid meet" aria-label="QR Code de validação">
      <rect x={0} y={0} width={N} height={N} fill="#ffffff" />
      {rects}
    </svg>
  )
}

// Modelo oficial — corresponde ao PDF real gerado pelo app.
// Arquivo em /public/exemplos/modelo-relatorio-vistoria-veicular.pdf
const MODEL = {
  font: 'system-ui, sans-serif',
  bg: '#ffffff',
  text: '#0f172a',
  border: '#e2e8f0',
  bar: 'linear-gradient(90deg,#1d4ed8,#06b6d4,#3b82f6)',
  accent: '#2563eb',
  headerBg: '#0b1f3c',
  headerText: '#e8f4ff',
  headerSub: '#93b4d4',
  placa: 'RDT3333',
  os: '2312321',
  veiculo: 'Fiat Toro Freedom AT6 2020',
  cor: 'Branca',
  proprietario: 'São José / SC',
  hash: 'EEA9011EA43BCD2177DBB4F6CA639B87',
  file: '/exemplos/modelo-relatorio-vistoria-veicular.pdf',
}

export default function PdfPreviewSection() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Coluna Esquerda: Mockup Visual do PDF */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4 order-2 lg:order-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--signal-bright)]">
            Modelo · Relatório de Vistoria Veicular
          </span>

          <div className="w-full max-w-[480px] rounded-2xl shadow-2xl p-6 border relative overflow-hidden text-left" style={{ minHeight: '580px', fontFamily: MODEL.font, background: MODEL.bg, color: MODEL.text, borderColor: MODEL.border }}>

            {/* Detalhe Superior colorido */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: MODEL.bar }} />

            {/* Cabeçalho */}
            <div className="flex justify-between items-start -mx-6 -mt-6 px-6 pt-7 pb-4 mb-1" style={{ background: MODEL.headerBg, color: MODEL.headerText }}>
              <div className="flex items-center gap-3">
                {/* Personalização de Logo */}
                <div className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-1 text-center select-none shrink-0 leading-none">
                  <span className="text-[7px] font-black tracking-tighter block uppercase">Sua Logo</span>
                  <span className="text-[6px] text-slate-400 mt-0.5 font-bold">Aqui</span>
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight uppercase" style={{ color: MODEL.headerText }}>Danos Aparentes</h4>
                  <p className="text-[7px] font-semibold tracking-wider" style={{ color: MODEL.headerSub }}>Nome da sua Empresa / Concessionária</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded border" style={{ color: MODEL.headerText, borderColor: `${MODEL.headerSub}80` }}>{MODEL.placa}</span>
                <p className="text-[8px] font-bold mt-1" style={{ color: MODEL.headerSub }}>OS: {MODEL.os}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-extrabold text-amber-700 uppercase tracking-wider">Avarias de grau leve detectadas</span>
                <p className="text-[7px] text-amber-600 font-medium">2 ocorrências registradas na lateral esquerda.</p>
              </div>
              <span className="text-xs font-black text-amber-600">2x</span>
            </div>

            {/* Tabela de Informações */}
            <div className="mt-4 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              <span className="text-[8px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: MODEL.accent }}>Identificação do Veículo</span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[9px]">
                <div>
                  <span className="text-slate-400 text-[8px] block">Proprietário / Cliente</span>
                  <strong className="text-slate-700 font-semibold">{MODEL.proprietario}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[8px] block">Marca / Modelo</span>
                  <strong className="text-slate-700 font-semibold">{MODEL.veiculo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[8px] block">Placa</span>
                  <strong className="text-slate-700 font-semibold">{MODEL.placa}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[8px] block">Cor</span>
                  <strong className="text-slate-700 font-semibold">{MODEL.cor}</strong>
                </div>
              </div>
            </div>

            {/* Desenho do Veículo com a avaria */}
            <div className="mt-4 border border-slate-200 rounded-lg p-3 bg-white flex flex-col items-center">
              <span className="text-[8px] font-extrabold uppercase tracking-widest block align-self-start mb-1 w-full text-left" style={{ color: MODEL.accent }}>Diagrama de Danos</span>
              <div className="w-full max-w-[280px] py-1 opacity-90 filter brightness-95">
                <img
                  src="/vehicles-img/car.png"
                  alt="Diagrama de danos do veículo"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Detalhamento Técnico das Avarias (igual ao documento oficial gerado) */}
            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-2.5 py-1.5" style={{ background: MODEL.accent }}>
                <span className="text-[7px] font-extrabold text-white uppercase tracking-widest">Detalhamento Técnico das Avarias</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[6.5px] uppercase text-slate-500 font-bold">
                    <th className="px-2 py-1">Peça / Componente</th>
                    <th className="px-2 py-1">Tipo de Dano</th>
                    <th className="px-2 py-1 text-center">Grau</th>
                  </tr>
                </thead>
                <tbody className="text-[7px] text-slate-700">
                  <tr className="border-t border-slate-100 bg-white">
                    <td className="px-2 py-1.5 font-bold uppercase">Porta Diant. Esquerda</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center gap-1">✏️ Riscos / Abrasão</span>
                    </td>
                    <td className="px-2 py-1.5 text-center"><span className="text-amber-600 font-black uppercase">Leve</span></td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-white">
                    <td className="px-2 py-1.5 font-bold uppercase">Porta Tras. Esquerda</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center gap-1">✏️ Riscos / Abrasão</span>
                    </td>
                    <td className="px-2 py-1.5 text-center"><span className="text-amber-600 font-black uppercase">Leve</span></td>
                  </tr>
                </tbody>
              </table>
              <div className="bg-slate-50 px-2.5 py-1 border-t border-slate-100 flex items-center gap-2 text-[6px] text-slate-400 font-semibold uppercase tracking-wide">
                <span>Tipos classificados:</span>
                <span className="text-slate-500">✏️ Risco</span>
                <span className="text-slate-500">🔨 Deformação</span>
                <span className="text-slate-500">💥 Fratura</span>
              </div>
            </div>

            {/* Seção de Fotos Anexadas no Mockup do PDF */}
            <div className="mt-4 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-left">
              <span className="text-[8px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: MODEL.accent }}>Fotos das Avarias Anexadas</span>
              <div className="flex gap-2">
                <div className="w-1/3 border border-slate-200 rounded overflow-hidden bg-white">
                  {/* Imagem simulada */}
                  <div className="h-16 bg-slate-100 flex items-center justify-center relative">
                    <span className="text-lg">📷</span>
                    <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full border border-red-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="p-1 border-t border-slate-100 text-[6px] leading-tight text-slate-600">
                    <strong>Porta Dianteira Esq.</strong>
                    <p className="text-slate-400 font-semibold mt-0.5">Risco na pintura</p>
                  </div>
                </div>
                {/* Descrição e Geotagging */}
                <div className="w-2/3 flex flex-col justify-center text-[8px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Fotos em alta resolução anexadas automaticamente</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Carimbo de data, hora e coordenadas de GPS na imagem</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="text-center">
                <div className="h-8 flex items-center justify-center">
                  <span className="font-serif italic text-xs text-blue-800 opacity-80 select-none">Vistoriador Assinado</span>
                </div>
                <div className="border-t border-slate-300 mx-4 mt-1"></div>
                <span className="text-[7px] text-slate-400 uppercase font-bold mt-1 block">Vistoriador Responsável</span>
              </div>
              <div className="text-center">
                <div className="h-8 flex items-center justify-center">
                  <span className="font-serif italic text-xs text-blue-800 opacity-80 select-none">Cliente Assinado</span>
                </div>
                <div className="border-t border-slate-300 mx-4 mt-1"></div>
                <span className="text-[7px] text-slate-400 uppercase font-bold mt-1 block">Assinatura do Responsável</span>
              </div>
            </div>

            {/* Rodapé e validação */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-slate-400">
              <div className="space-y-1">
                <span className="text-[7px] font-black uppercase text-slate-400 block tracking-widest">Hash de Validação SHA-256</span>
                <code className="text-[7px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded block break-all max-w-[140px]">
                  {MODEL.hash}
                </code>
              </div>
              <div className="w-10 h-10 border border-slate-200 p-0.5 rounded bg-white">
                <QrCodeMock className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Abrir o PDF real do modelo */}
          <a
            href={MODEL.file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border border-[var(--card-border)] text-[var(--text-main)] hover:border-primary/50 hover:text-primary transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>
            Abrir modelo · Relatório de Vistoria Veicular
          </a>
        </div>

        {/* Coluna Direita: Informações explicativas */}
        <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
          <Reveal className="space-y-6">
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Laudos PDF invioláveis, prontos para enviar
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Ao concluir a vistoria, o sistema gera instantaneamente um PDF pronto para enviar, com identificação do veículo, fotos anexadas, diagrama de danos, hash de validação e as assinaturas colhidas na tela. Veja ao lado um modelo real de Relatório de Vistoria Veicular gerado pelo app.
          </p>
          </Reveal>

          <ul className="space-y-3.5">
            {[
              { title: 'Identificação do Veículo e Proprietário Personalizável', desc: 'Você decide o que incluir e onde: mostre ou oculte campos, crie campos próprios e mova cada seção (perfil, cliente, documentos, veículo, local, assinaturas) para a posição que quiser no laudo.' },
              { title: 'Código Hash SHA-256', desc: 'Garante que o PDF original não pode ser adulterado de forma alguma, gerando validade e segurança jurídica perante seguradoras.' },
              { title: 'QR Code de Validação', desc: 'Qualquer pessoa pode escanear o QR Code no papel para conferir o laudo digital original armazenado na nuvem segura.' },
              { title: 'Assinatura Eletrônica na Tela', desc: 'Elimina totalmente a necessidade de papéis físicos e canetas. Coleta rápida pelo celular de forma legal e simples.' }
            ].map((feat, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[var(--signal-bright)] text-base mt-0.5">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">{feat.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
