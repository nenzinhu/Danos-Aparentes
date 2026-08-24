export default function ComparativoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto px-5 py-6">
        <header className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#C8933F] to-[#C44536] grid place-items-center text-white font-extrabold text-xs">DA</div>
            <div className="font-bold text-[#e8f4ff]">Danos Aparentes</div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C8933F]/10 text-[#C8933F] border border-[#C8933F]/25 text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8933F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8933F]"></span>
            </span>
            Vistoria verificável
          </div>
        </header>

        <section className="mt-5 text-center">
          <h1 className="m-0 text-4xl font-extrabold text-[#e8f4ff]">Comparativo <span className="bg-gradient-to-r from-[#C8933F] via-[#ffd699] to-[#C8933F] bg-clip-text text-transparent">Entrada × Retorno</span></h1>
          <p className="mx-auto mt-2 max-w-[720px] text-white/70 text-base">Mesmo padrão, mesma cadeia de custódia. Do check-out ao check-in com hash, QR Code e assinatura digital.</p>
        </section>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-[#C44536]/85 text-white text-xs font-bold border border-white/15 backdrop-blur z-10">ANTES — ENTRADA / CHECK-OUT</div>
            <img src="/exemplos/hero-vistoria-entrada-retorno.png" alt="Relatório de vistoria entrada e retorno lado a lado: evidência comparável do estado do veículo no check-out e check-in" className="w-full h-full object-cover object-top transition-opacity duration-700 opacity-0" draggable="false" onLoad={(e) => (e.currentTarget.style.opacity = '1')} />
          </div>
          <div className="flex flex-col items-center gap-2 text-[#F5F0E8]">
            <div className="w-[2px] h-16 bg-gradient-to-b from-transparent via-[#C8933F] to-transparent rounded-full"></div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C8933F] to-[#C44536] grid place-items-center text-white font-extrabold shadow-[0_6px_20px_rgba(200,147,63,0.35)]">×</div>
            <div className="w-[2px] h-16 bg-gradient-to-b from-transparent via-[#C8933F] to-transparent rounded-full"></div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-[#C8933F]/85 text-white text-xs font-bold border border-white/15 backdrop-blur z-10">DEPOIS — RETORNO / CHECK-IN</div>
            <img src="/exemplos/hero-vistoria-entrada-retorno.png" alt="Relatório de vistoria entrada e retorno lado a lado: evidência comparável do estado do veículo no check-out e check-in" className="w-full h-full object-cover object-top transition-opacity duration-700 opacity-0" draggable="false" onLoad={(e) => (e.currentTarget.style.opacity = '1')} />
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <strong className="block text-[#C8933F] mb-1 text-sm">Hash + QR Code</strong>
            <span className="text-white/80 text-sm leading-relaxed">Cada relatório é único e verificável a qualquer momento.</span>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <strong className="block text-[#C8933F] mb-1 text-sm">Mesmo padrão</strong>
            <span className="text-white/80 text-sm leading-relaxed">Checklist, fotos e assinatura com layout consistente.</span>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <strong className="block text-[#C8933F] mb-1 text-sm">Cadeia de custódia</strong>
            <span className="text-white/80 text-sm leading-relaxed">Do check-out ao check-in sem rasuras ou dúvidas.</span>
          </div>
        </section>

        <div className="mt-6 flex justify-center">
          <a href="/demo" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#C8933F] to-[#e2b066] text-[#1a1a1a] no-underline font-bold">Abrir demonstração</a>
        </div>
      </div>
    </div>
  );
}
