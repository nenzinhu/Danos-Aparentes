import React from 'react'

// Figura com a IMAGEM REAL do PDF gerado pelo app (render da 1ª página),
// usada nos artigos. Destaca que a logo e o nome são os da empresa do cliente.
export function LaudoSheet() {
  return (
    <figure className="not-prose my-8">
      <a
        href="/exemplos/modelo-relatorio-vistoria-veicular.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="group block mx-auto max-w-[420px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10 transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--primary)] outline-none"
      >
        <img
          src="/exemplos/modelo-relatorio.webp"
          alt="Exemplo real do PDF de Relatório de Vistoria Veicular gerado pelo app, com cabeçalho personalizável (logo e nome da empresa), identificação do veículo, diagrama de danos, detalhamento das avarias, galeria fotográfica, assinaturas e hash de validação."
          width={900}
          height={1273}
          loading="lazy"
          decoding="async"
          className="w-full h-auto bg-white"
        />
      </a>
      <figcaption className="mt-3 text-center text-[0.8rem] text-[var(--text-muted)]">
        Exemplo real do PDF gerado pelo app.{' '}
        <strong className="text-[var(--text-main)]">A logo e o nome do topo são os da sua empresa</strong> —
        personalizáveis nas configurações. Toque para abrir o PDF completo.
      </figcaption>
    </figure>
  )
}
