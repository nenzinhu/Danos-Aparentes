const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

function textRun(text, opts = {}) {
  return new TextRun({ text, size: 18, color: '1E293B', ...opts });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400 }, children: [
    new TextRun({ text, bold: true, size: 32, color: '1B2A4A' })
  ]});
}

function para(text) {
  return new Paragraph({ spacing: { before: 200 }, children: [textRun(text)] });
}

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: [{
      default: new Header({
        children: [new Paragraph({
          children: [
            textRun('danosaparentes.com.br', { bold: true, size: 18, color: '1B2A4A' }),
            textRun('\t\tSEO / GEO / AEO Audit Report', { size: 18, color: '64748B' })
          ],
          alignment: AlignmentType.CENTER
        })]
      })
    }],
    footers: [{
      default: new Footer({
        children: [new Paragraph({
          children: [
            textRun('Claude Skill and Plugin by Alex Labat', { size: 16, color: '94A3B8' }),
            textRun('\t\tPage ', { size: 16, color: '94A3B8' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '94A3B8' })
          ],
          alignment: AlignmentType.CENTER
        })]
      })
    }],
    children: [
      new Paragraph({ spacing: { before: 1800 }, alignment: AlignmentType.CENTER, children: [textRun('danosaparentes.com.br', { bold: true, size: 56, color: '1B2A4A' })] }),
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [textRun('SEO / GEO / AEO Audit Report', { size: 32, color: '93C5FD' })] }),
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [textRun('FULL AUDIT', { size: 22, color: '1B2A4A' })] }),
      new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [textRun('Date: 2026-08-20', { size: 18, color: '64748B' })] }),
      new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [textRun('Claude Skill and Plugin by Alex Labat', { size: 16, color: '94A3B8' })] }),

      new Paragraph({ children: [new PageBreak()] }),

      heading1('Executive Summary'),
      para('Danos Aparentes é uma plataforma B2B de "Inteligência Histórica Veicular" que permite registrar inspeções de veículos, comparar estados ao longo do tempo e gerar evidências verificáveis (PDF com QR Code e hash SHA-256). O site está bem estruturado em termos de SEO técnico, com título otimizado, meta description presente, Open Graph, canonical, robots.txt e sitemap.xml. Os principais pontos de melhoria estão na profundidade de conteúdo para AEO (poucas perguntas diretas) e na adoção de schema markup mais rico (faltam FAQ e HowTo schema).'),

      new Paragraph({ spacing: { before: 400 }, children: [textRun('Scores', { bold: true, size: 24, color: '1B2A4A' })] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [
            new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: '16A34A', type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, verticalAlign: VerticalAlign.CENTER, children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('SEO', { bold: true, size: 20, color: 'FFFFFF' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('8/10', { bold: true, size: 48, color: 'FFFFFF' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Strong', { size: 16, color: 'FFFFFF', italics: true })] })
            ]}),
            new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: 'D97706', type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, verticalAlign: VerticalAlign.CENTER, children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('GEO', { bold: true, size: 20, color: 'FFFFFF' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('6/10', { bold: true, size: 48, color: 'FFFFFF' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('On Track', { size: 16, color: 'FFFFFF', italics: true })] })
            ]}),
            new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: 'D97706', type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, verticalAlign: VerticalAlign.CENTER, children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('AEO', { bold: true, size: 20, color: 'FFFFFF' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('5/10', { bold: true, size: 48, color: 'FFFFFF' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Needs Work', { size: 16, color: 'FFFFFF', italics: true })] })
            ]})
          ]})
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      heading1('SEO Analysis'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('Technical On-Page', { bold: true, size: 24 })] }),
      para('Title Tag: Presente. Contém termos-chave: "Vistoria de veículos, histórico e laudo de avarias | Danos Aparentes". Comprimento ~65 caracteres (bom).'),
      para('Meta Description: Presente. ~155 caracteres (ótimo). Contém CTA "Comece grátis".'),
      para('H1: Presente e único: "Saiba exatamente quando um dano aconteceu." Bom alinhamento com intenção de busca.'),
      para('Open Graph: Todos os og: tags presentes (title, description, url, image, type, locale).'),
      para('Schema Markup: Organization + WebSite + SoftwareApplication + WebPage. Oportunidade: adicionar FAQ e HowTo schema.'),
      para('Canonical: Self-referencing "/" presente.'),
      para('Robots.txt: Presente, bem configurado. Bloqueia /api/, /app/, /pagamento-*.'),
      para('Sitemap.xml: Presente, com imagens e lastmod. ~139 URLs indexadas.'),
      para('Viewport: Presente: width=device-width, initial-scale=1, maximum-scale=5.'),

      new Paragraph({ children: [new PageBreak()] }),

      heading1('GEO Analysis'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('E-E-A-T Assessment', { bold: true, size: 24 })] }),
      para('Possui página "sobre" com informações da empresa. Dados de contato (suporte@danosaparentes.com.br). Autor Jeferson identificado no schema Organization. Trust signals presentes: depoimentos reais com nomes e empresas (Marcelo R., Thiago M., Marcos V.). Oportunidade: página "Sobre" com história mais rica, credenciais mais visíveis.'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('Content for AI Synthesis', { bold: true, size: 24 })] }),
      para('Conteúdo é factual e bem estruturado. Proposta "Inteligência Histórica Veicular" está clara. Exemplos concretos (Toyota Corolla ABC-1234, Chevrolet Onix ABC1D23). Estatísticas específicas presentes: "7 dias grátis", "R$ 79,90/mês", "hash SHA-256". Oportunidade: citar fontes externas, adicionar dados estatísticos do setor.'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('Technical GEO', { bold: true, size: 24 })] }),
      para('HTTPS presente (Vercel). Schema Organization + SoftwareApplication bem definidos. Links para redes sociais presentes. Robots.txt não bloqueia conteúdo relevante. Site renderizado staticamente (Next.js SSG).'),

      new Paragraph({ children: [new PageBreak()] }),

      heading1('AEO Analysis'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('Featured Snippet Eligibility', { bold: true, size: 24 })] }),
      para('Headings em formato de pergunta presentes ("Quem causou o dano?", "Quanto custa não identificar um dano?"). No entanto, respostas não estão em formato conciso (40-60 palavras) imediatamente abaixo. Faltam definições claras no formato "X é...". Poucas listas numeradas e tabelas comparativas.'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('Structured Answer Formats', { bold: true, size: 24 })] }),
      para('FAQ page existe mas não possui FAQ schema markup. Não há HowTo schema para "Como funciona". Speakable schema não implementado. Oportunidades rápidas de AEO.'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [textRun('Voice Search Readiness', { bold: true, size: 24 })] }),
      para('Conteúdo usa linguagem profissional mas conversacional. Endereça perguntas "como", "quanto custa", "o que é". Faltam respostas mais diretas e curtas para assistentes de voz.'),

      new Paragraph({ children: [new PageBreak()] }),

      heading1('Priority Recommendations'),
      new Paragraph({ spacing: { before: 200 }, children: [textRun('1. [CRITICAL] Adicionar FAQ Schema markup na página /faq — Esforço: Baixo | Impacto: Alto', { bold: true, size: 18, color: 'DC2626' })] }),
      new Paragraph({ spacing: { before: 100 }, children: [textRun('2. [HIGH] Criar respostas concisas (40-60 palavras) para perguntas nos H2/H3 — Esforço: Médio | Impacto: Alto', { bold: true, size: 18, color: 'EA580C' })] }),
      new Paragraph({ spacing: { before: 100 }, children: [textRun('3. [MEDIUM] Adicionar HowTo schema em "Como funciona" — Esforço: Baixo | Impacto: Médio', { bold: true, size: 18, color: 'D97706' })] }),
      new Paragraph({ spacing: { before: 100 }, children: [textRun('4. [QUICK WIN] Adicionar Speakable schema — Esforço: Baixo | Impacto: Médio', { bold: true, size: 18, color: '16A34A' })] }),
      new Paragraph({ spacing: { before: 100 }, children: [textRun('5. [HIGH] Adicionar Author schema e credenciais na página Sobre — Esforço: Médio | Impacto: Alto', { bold: true, size: 18, color: 'EA580C' })] }),

      new Paragraph({ children: [new PageBreak()] }),

      heading1("What's Working Well"),
      para('✓ SEO técnico sólido: título, meta description, canonical, robots.txt, sitemap.xml'),
      para('✓ Open Graph completo para compartilhamento social'),
      para('✓ Schema Organization + SoftwareApplication + WebPage'),
      para('✓ Proposta de valor clara: "Inteligência Histórica Veicular"'),
      para('✓ Trust signals com depoimentos reais identificáveis'),
      para('✓ HTTPS, segurança e performance (Vercel/Next.js SSG)'),
      para('✓ Conteúdo factual com exemplos concretos (placas, datas, valores)'),

      new Paragraph({ children: [new PageBreak()] }),

      heading1('Glossary'),
      new Paragraph({ spacing: { before: 200 }, children: [
        new TextRun({ text: 'SEO (Search Engine Optimization): ', bold: true, size: 18 }),
        textRun('Otimização para mecanismos de busca tradicionais (Google, Bing)')
      ]}),
      new Paragraph({ spacing: { before: 100 }, children: [
        new TextRun({ text: 'GEO (Generative Engine Optimization): ', bold: true, size: 18 }),
        textRun('Otimização para motores de busca generativos (Perplexity, ChatGPT Search, Gemini)')
      ]}),
      new Paragraph({ spacing: { before: 100 }, children: [
        new TextRun({ text: 'AEO (Answer Engine Optimization): ', bold: true, size: 18 }),
        textRun('Otimização para mecanismos de resposta direta (featured snippets, voice search)')
      ]})
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = 'C:/Users/Nenzinhu/Downloads/seo-audit-danosaparentes-2026-08-20.docx';
  fs.writeFileSync(outPath, buffer);
  console.log('DOCX written: ' + outPath);
}).catch(err => {
  console.error('Error:', err.message);
});
