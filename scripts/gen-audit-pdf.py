# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
import os

# Register fonts
try:
    pdfmetrics.registerFont(TTFont('Arial', 'arial.ttf'))
    pdfmetrics.registerFont(TTFont('ArialBold', 'arialbd.ttf'))
    FONT = 'Arial'
    FONT_BOLD = 'ArialBold'
except:
    FONT = 'Helvetica'
    FONT_BOLD = 'Helvetica-Bold'

# Colors
NAVY = HexColor('#1B2A4A')
BLUE = HexColor('#2563EB')
GREEN = HexColor('#16A34A')
AMBER = HexColor('#D97706')
RED = HexColor('#DC2626')
ORANGE = HexColor('#EA580C')
GRAY_BG = HexColor('#F8F9FA')
GRAY_BORDER = HexColor('#E2E8F0')
DARK_TEXT = HexColor('#1E293B')
MUTED_TEXT = HexColor('#64748B')
LIGHT_BLUE_BG = HexColor('#EFF6FF')
GREEN_BG = HexColor('#F0FDF4')
WHITE = white

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', fontName=FONT_BOLD, fontSize=28, textColor=NAVY, alignment=TA_CENTER, spaceAfter=6*mm)
subtitle_style = ParagraphStyle('Subtitle', fontName=FONT, fontSize=16, textColor=HexColor('#93C5FD'), alignment=TA_CENTER, spaceAfter=10*mm)
h1_style = ParagraphStyle('H1', fontName=FONT_BOLD, fontSize=22, textColor=NAVY, spaceBefore=8*mm, spaceAfter=4*mm, keepWithNext=True)
h2_style = ParagraphStyle('H2', fontName=FONT_BOLD, fontSize=16, textColor=DARK_TEXT, spaceBefore=6*mm, spaceAfter=3*mm, keepWithNext=True)
body_style = ParagraphStyle('Body', fontName=FONT, fontSize=11, textColor=DARK_TEXT, leading=16, spaceAfter=2*mm)
bullet_style = ParagraphStyle('Bullet', fontName=FONT, fontSize=11, textColor=DARK_TEXT, leading=16, leftIndent=12*mm, spaceAfter=2*mm, bulletIndent=6*mm)
small_style = ParagraphStyle('Small', fontName=FONT, fontSize=9, textColor=MUTED_TEXT, alignment=TA_CENTER)
score_style = ParagraphStyle('Score', fontName=FONT_BOLD, fontSize=11, textColor=WHITE, alignment=TA_CENTER)
label_style = ParagraphStyle('Label', fontName=FONT, fontSize=10, textColor=MUTED_TEXT, alignment=TA_CENTER)

def build_pdf():
    out_path = 'C:/Users/Nenzinhu/Downloads/seo-audit-danosaparentes-2026-08-20.pdf'
    doc = SimpleDocTemplate(out_path, pagesize=A4,
                           leftMargin=2*cm, rightMargin=2*cm,
                           topMargin=2*cm, bottomMargin=2*cm)
    story = []

    # Cover
    story.append(Spacer(1, 4*cm))
    story.append(Paragraph('danosaparentes.com.br', title_style))
    story.append(Paragraph('SEO / GEO / AEO Audit Report', subtitle_style))
    story.append(Paragraph('FULL AUDIT', ParagraphStyle('AuditType', fontName=FONT, fontSize=14, textColor=NAVY, alignment=TA_CENTER)))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph('Date: 2026-08-20', small_style))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('Claude Skill and Plugin by Alex Labat', small_style))

    story.append(PageBreak())

    # Executive Summary
    story.append(Paragraph('Executive Summary', h1_style))
    story.append(Paragraph(
        'Danos Aparentes é uma plataforma B2B de <b>"Inteligência Histórica Veicular"</b> que permite '
        'registrar inspeções de veículos, comparar estados ao longo do tempo e gerar evidências verificáveis '
        '(PDF com QR Code e hash SHA-256). O site está bem estruturado em termos de SEO técnico, com título '
        'otimizado, meta description presente, Open Graph, canonical, robots.txt e sitemap.xml. Os principais '
        'pontos de melhoria estão na profundidade de conteúdo para AEO (poucas perguntas diretas) e na adoção '
        'de schema markup mais rico (faltam FAQ e HowTo schema).', body_style))

    # Scores Table
    story.append(Spacer(1, 5*mm))
    score_data = [
        [Paragraph('<b>SEO</b>', ParagraphStyle('SL', fontName=FONT_BOLD, fontSize=14, textColor=WHITE, alignment=TA_CENTER)),
         Paragraph('<b>GEO</b>', ParagraphStyle('GL', fontName=FONT_BOLD, fontSize=14, textColor=WHITE, alignment=TA_CENTER)),
         Paragraph('<b>AEO</b>', ParagraphStyle('AL', fontName=FONT_BOLD, fontSize=14, textColor=WHITE, alignment=TA_CENTER))],
        [Paragraph('<b>8/10</b>', ParagraphStyle('S8', fontName=FONT_BOLD, fontSize=28, textColor=WHITE, alignment=TA_CENTER)),
         Paragraph('<b>6/10</b>', ParagraphStyle('S6', fontName=FONT_BOLD, fontSize=28, textColor=WHITE, alignment=TA_CENTER)),
         Paragraph('<b>5/10</b>', ParagraphStyle('S5', fontName=FONT_BOLD, fontSize=28, textColor=WHITE, alignment=TA_CENTER))],
        [Paragraph('<i>Strong</i>', ParagraphStyle('ST', fontName=FONT, fontSize=10, textColor=WHITE, alignment=TA_CENTER)),
         Paragraph('<i>On Track</i>', ParagraphStyle('GT', fontName=FONT, fontSize=10, textColor=WHITE, alignment=TA_CENTER)),
         Paragraph('<i>Needs Work</i>', ParagraphStyle('AT', fontName=FONT, fontSize=10, textColor=WHITE, alignment=TA_CENTER))],
    ]
    score_table = Table(score_data, colWidths=[5.5*cm, 5.5*cm, 5.5*cm])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), GREEN),
        ('BACKGROUND', (1, 0), (1, -1), AMBER),
        ('BACKGROUND', (2, 0), (2, -1), AMBER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(score_table)

    story.append(PageBreak())

    # SEO Analysis
    story.append(Paragraph('SEO Analysis', h1_style))
    story.append(Paragraph('Technical On-Page', h2_style))
    seo_items = [
        '<b>Title Tag:</b> Presente. Contém termos-chave: "Vistoria de veículos, histórico e laudo de avarias | Danos Aparentes". Comprimento ~65 caracteres (bom).',
        '<b>Meta Description:</b> Presente. ~155 caracteres (ótimo). Contém CTA "Comece grátis".',
        '<b>H1:</b> Presente e único: "Saiba exatamente quando um dano aconteceu." Bom alinhamento com intenção de busca.',
        '<b>Open Graph:</b> Todos os og: tags presentes (title, description, url, image, type, locale).',
        '<b>Schema Markup:</b> Organization + WebSite + SoftwareApplication + WebPage. Oportunidade: adicionar FAQ e HowTo schema.',
        '<b>Canonical:</b> Self-referencing "/" presente.',
        '<b>Robots.txt:</b> Presente, bem configurado. Bloqueia /api/, /app/, /pagamento-*.',
        '<b>Sitemap.xml:</b> Presente, com imagens e lastmod. ~139 URLs indexadas.',
        '<b>Viewport:</b> Presente: width=device-width, initial-scale=1, maximum-scale=5.',
    ]
    for item in seo_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))

    story.append(PageBreak())

    # GEO Analysis
    story.append(Paragraph('GEO Analysis', h1_style))
    story.append(Paragraph('E-E-A-T Assessment', h2_style))
    story.append(Paragraph(
        'Possui página "sobre" com informações da empresa. Dados de contato (suporte@danosaparentes.com.br). '
        'Autor Jeferson identificado no schema Organization. Trust signals presentes: depoimentos reais com nomes '
        'e empresas (Marcelo R., Thiago M., Marcos V.). Oportunidade: página "Sobre" com história mais rica, '
        'credenciais mais visíveis.', body_style))
    story.append(Paragraph('Content for AI Synthesis', h2_style))
    story.append(Paragraph(
        'Conteúdo é factual e bem estruturado. Proposta "Inteligência Histórica Veicular" está clara. '
        'Exemplos concretos (Toyota Corolla ABC-1234, Chevrolet Onix ABC1D23). Estatísticas específicas presentes: '
        '"7 dias grátis", "R$ 79,90/mês", "hash SHA-256". Oportunidade: citar fontes externas, adicionar dados '
        'estatísticos do setor.', body_style))
    story.append(Paragraph('Technical GEO', h2_style))
    story.append(Paragraph(
        'HTTPS presente (Vercel). Schema Organization + SoftwareApplication bem definidos. Links para redes sociais '
        'presentes. Robots.txt não bloqueia conteúdo relevante. Site renderizado staticamente (Next.js SSG).', body_style))

    story.append(PageBreak())

    # AEO Analysis
    story.append(Paragraph('AEO Analysis', h1_style))
    story.append(Paragraph('Featured Snippet Eligibility', h2_style))
    story.append(Paragraph(
        'Headings em formato de pergunta presentes ("Quem causou o dano?", "Quanto custa não identificar um dano?"). '
        'No entanto, respostas não estão em formato conciso (40-60 palavras) imediatamente abaixo. Faltam definições '
        'claras no formato "X é...". Poucas listas numeradas e tabelas comparativas.', body_style))
    story.append(Paragraph('Structured Answer Formats', h2_style))
    story.append(Paragraph(
        'FAQ page existe mas não possui FAQ schema markup. Não há HowTo schema para "Como funciona". '
        'Speakable schema não implementado. Oportunidades rápidas de AEO.', body_style))
    story.append(Paragraph('Voice Search Readiness', h2_style))
    story.append(Paragraph(
        'Conteúdo usa linguagem profissional mas conversacional. Endereça perguntas "como", "quanto custa", "o que é". '
        'Faltam respostas mais diretas e curtas para assistentes de voz.', body_style))

    story.append(PageBreak())

    # Priority Recommendations
    story.append(Paragraph('Priority Recommendations', h1_style))
    recs = [
        ('#DC2626', '1. [CRITICAL] Adicionar FAQ Schema markup na página /faq', 'Esforço: Baixo | Impacto: Alto'),
        ('#EA580C', '2. [HIGH] Criar respostas concisas (40-60 palavras) para perguntas nos H2/H3', 'Esforço: Médio | Impacto: Alto'),
        ('#D97706', '3. [MEDIUM] Adicionar HowTo schema em "Como funciona"', 'Esforço: Baixo | Impacto: Médio'),
        ('#16A34A', '4. [QUICK WIN] Adicionar Speakable schema', 'Esforço: Baixo | Impacto: Médio'),
        ('#EA580C', '5. [HIGH] Adicionar Author schema e credenciais na página Sobre', 'Esforço: Médio | Impacto: Alto'),
    ]
    for color, title, meta in recs:
        rec_data = [[Paragraph(f'<font color="{color}"><b>{title}</b></font>', ParagraphStyle('R', fontName=FONT_BOLD, fontSize=11)),
                     Paragraph(meta, ParagraphStyle('M', fontName=FONT, fontSize=10, textColor=MUTED_TEXT, alignment=TA_RIGHT))]]
        rec_table = Table(rec_data, colWidths=[11*cm, 5.5*cm])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), GRAY_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, GRAY_BORDER),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 2*mm))

    story.append(PageBreak())

    # What's Working Well
    story.append(Paragraph("What's Working Well", h1_style))
    positives = [
        'SEO técnico sólido: título, meta description, canonical, robots.txt, sitemap.xml',
        'Open Graph completo para compartilhamento social',
        'Schema Organization + SoftwareApplication + WebPage',
        'Proposta de valor clara: "Inteligência Histórica Veicular"',
        'Trust signals com depoimentos reais identificáveis',
        'HTTPS, segurança e performance (Vercel/Next.js SSG)',
        'Conteúdo factual com exemplos concretos (placas, datas, valores)',
    ]
    for p in positives:
        story.append(Paragraph(f'&#10003; {p}', bullet_style))

    story.append(PageBreak())

    # Glossary
    story.append(Paragraph('Glossary', h1_style))
    glossary = [
        ('SEO (Search Engine Optimization):', 'Otimização para mecanismos de busca tradicionais (Google, Bing).'),
        ('GEO (Generative Engine Optimization):', 'Otimização para motores de busca generativos (Perplexity, ChatGPT Search, Gemini).'),
        ('AEO (Answer Engine Optimization):', 'Otimização para mecanismos de resposta direta (featured snippets, voice search).'),
    ]
    for term, definition in glossary:
        story.append(Paragraph(f'<b>{term}</b> {definition}', bullet_style))

    # Build PDF
    doc.build(story)
    print(f'PDF written: {out_path}')

build_pdf()
