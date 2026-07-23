import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

async function generateVerificationPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 portrait size

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const width = page.getWidth();
  const height = page.getHeight();

  // Top header bar (Dark Slate Blue)
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.04, 0.09, 0.18),
  });

  // Top Accent Line (Sky Blue)
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: rgb(0.0, 0.68, 1.0),
  });

  // Header Title
  page.drawText('DANOS APARENTES', {
    x: 40,
    y: height - 42,
    size: 20,
    font: fontBold,
    color: rgb(1.0, 1.0, 1.0),
  });

  page.drawText('SISTEMA DE VISTORIA E AUTENTICAÇÃO DIGITAL DE LAUDOS', {
    x: 40,
    y: height - 58,
    size: 8,
    font: fontBold,
    color: rgb(0.58, 0.75, 0.95),
  });

  page.drawText('CERTIFICADO DE AUTENTICIDADE DE LAUDO', {
    x: width - 260,
    y: height - 42,
    size: 9,
    font: fontBold,
    color: rgb(0.0, 0.86, 1.0),
  });

  page.drawText('REF: OS-2312321 · HASH SHA-256', {
    x: width - 260,
    y: height - 56,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.8, 0.9, 1.0),
  });

  // Status Badge Box (Green / Emerald Authentic)
  page.drawRectangle({
    x: 40,
    y: height - 180,
    width: width - 80,
    height: 65,
    color: rgb(0.93, 0.98, 0.95),
    borderColor: rgb(0.1, 0.7, 0.4),
    borderWidth: 1.5,
  });

  page.drawText('STATUS DA VERIFICAÇÃO: DOCUMENTO AUTÊNTICO E INVIOLÁVEL', {
    x: 55,
    y: height - 138,
    size: 11,
    font: fontBold,
    color: rgb(0.04, 0.45, 0.25),
  });

  page.drawText('A integridade deste relatório foi confirmada com sucesso via hash criptográfico SHA-256.', {
    x: 55,
    y: height - 154,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.15, 0.5, 0.3),
  });

  page.drawText('Os dados do veículo, diagrama de avarias e assinaturas correspondem exatamente ao registro público original.', {
    x: 55,
    y: height - 168,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.15, 0.5, 0.3),
  });

  // Section 1: Dados do Registro Autenticado
  page.drawText('1. REGISTRO OFICIAL DO LAUDO', {
    x: 40,
    y: height - 210,
    size: 10,
    font: fontBold,
    color: rgb(0.07, 0.12, 0.24),
  });

  page.drawLine({
    start: { x: 40, y: height - 216 },
    end: { x: width - 40, y: height - 216 },
    thickness: 1,
    color: rgb(0.85, 0.9, 0.95),
  });

  // Table grid for details
  const drawRow = (yPos, label1, val1, label2, val2) => {
    page.drawText(label1, { x: 50, y: yPos, size: 8, font: fontBold, color: rgb(0.45, 0.55, 0.65) });
    page.drawText(val1, { x: 50, y: yPos - 12, size: 10, font: fontBold, color: rgb(0.1, 0.15, 0.25) });

    page.drawText(label2, { x: 300, y: yPos, size: 8, font: fontBold, color: rgb(0.45, 0.55, 0.65) });
    page.drawText(val2, { x: 300, y: yPos - 12, size: 10, font: fontBold, color: rgb(0.1, 0.15, 0.25) });
  };

  drawRow(height - 240, 'PLACA DO VEÍCULO', 'RDT-3333', 'REFERÊNCIA DA ORDEM DE SERVIÇO', 'OS-2312321');
  drawRow(height - 280, 'MARCA / MODELO', 'Fiat Toro Freedom AT6 2020', 'COR DO VEÍCULO', 'Branca');
  drawRow(height - 320, 'PROPRIETÁRIO / CLIENTE', 'São José / SC', 'TOTAL DE AVARIAS MARCADAS', '2 Ocorrências (Leve)');
  drawRow(height - 360, 'EMPRESA EMISSORA DA VISTORIA', 'AutoVistorias S.A. / Danos Aparentes', 'DATA E HORA DE EMISSÃO', '23/07/2026 às 14:32:10 BRT');

  // Section 2: Localização e Coordenadas de GPS Autenticadas
  page.drawText('2. DADOS DE RASTREABILIDADE E GEOLOCALIZAÇÃO (GPS)', {
    x: 40,
    y: height - 410,
    size: 10,
    font: fontBold,
    color: rgb(0.07, 0.12, 0.24),
  });

  page.drawLine({
    start: { x: 40, y: height - 416 },
    end: { x: width - 40, y: height - 416 },
    thickness: 1,
    color: rgb(0.85, 0.9, 0.95),
  });

  page.drawRectangle({
    x: 40,
    y: height - 485,
    width: width - 80,
    height: 58,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.8, 0.88, 0.95),
    borderWidth: 1,
  });

  page.drawText('COORDENADAS DE GPS:', { x: 55, y: height - 440, size: 8, font: fontBold, color: rgb(0.3, 0.4, 0.5) });
  page.drawText('-27.5954, -48.5480 (Precisao: +/- 4 metros)', { x: 180, y: height - 440, size: 9, font: fontMono, color: rgb(0.0, 0.4, 0.8) });

  page.drawText('ENDEREÇO REGISTRADO:', { x: 55, y: height - 458, size: 8, font: fontBold, color: rgb(0.3, 0.4, 0.5) });
  page.drawText('Av. Presidente Kennedy, São José - SC, Brasil', { x: 180, y: height - 458, size: 9, font: fontBold, color: rgb(0.1, 0.15, 0.25) });

  page.drawText('DISPOSITIVO COLETOR:', { x: 55, y: height - 474, size: 8, font: fontBold, color: rgb(0.3, 0.4, 0.5) });
  page.drawText('Mobile PWA Client (SHA-256 GeoStamping Verificado)', { x: 180, y: height - 474, size: 9, font: fontHelvetica, color: rgb(0.2, 0.25, 0.35) });

  // Section 3: Hash Criptográfico e Assinaturas
  page.drawText('3. INVIOLABILIDADE E HASH CRIPTOGRÁFICO DE SEGURANÇA', {
    x: 40,
    y: height - 515,
    size: 10,
    font: fontBold,
    color: rgb(0.07, 0.12, 0.24),
  });

  page.drawLine({
    start: { x: 40, y: height - 521 },
    end: { x: width - 40, y: height - 521 },
    thickness: 1,
    color: rgb(0.85, 0.9, 0.95),
  });

  page.drawRectangle({
    x: 40,
    y: height - 580,
    width: width - 80,
    height: 48,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.85, 0.85, 0.9),
    borderWidth: 1,
  });

  page.drawText('CÓDIGO HASH DE VALIDAÇÃO (SHA-256):', {
    x: 55,
    y: height - 542,
    size: 8,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55),
  });

  page.drawText('EEA9011EA43BCD2177DBB4F6CA639B87', {
    x: 55,
    y: height - 564,
    size: 14,
    font: fontMono,
    color: rgb(0.05, 0.1, 0.25),
  });

  // Assinaturas Digitais Box
  page.drawRectangle({
    x: 40,
    y: height - 670,
    width: (width - 100) / 2,
    height: 75,
    color: rgb(1.0, 1.0, 1.0),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });

  page.drawText('VISTORIADOR RESPONSÁVEL', { x: 55, y: height - 610, size: 8, font: fontBold, color: rgb(0.4, 0.5, 0.6) });
  page.drawText('Vistoriador Assinado via Mobile', { x: 55, y: height - 635, size: 10, font: fontBold, color: rgb(0.1, 0.3, 0.7) });
  page.drawLine({ start: { x: 55, y: height - 645 }, end: { x: 250, y: height - 645 }, thickness: 1, color: rgb(0.7, 0.75, 0.8) });
  page.drawText('CPF: ***.482.910-** · Data: 23/07/2026', { x: 55, y: height - 658, size: 7.5, font: fontHelvetica, color: rgb(0.5, 0.55, 0.6) });

  page.drawRectangle({
    x: 40 + (width - 100) / 2 + 20,
    y: height - 670,
    width: (width - 100) / 2,
    height: 75,
    color: rgb(1.0, 1.0, 1.0),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });

  page.drawText('CLIENTE / PROPRIETÁRIO', { x: 40 + (width - 100) / 2 + 35, y: height - 610, size: 8, font: fontBold, color: rgb(0.4, 0.5, 0.6) });
  page.drawText('Cliente Assinado no Dispositivo', { x: 40 + (width - 100) / 2 + 35, y: height - 635, size: 10, font: fontBold, color: rgb(0.1, 0.3, 0.7) });
  page.drawLine({ start: { x: 40 + (width - 100) / 2 + 35, y: height - 645 }, end: { x: width - 55, y: height - 645 }, thickness: 1, color: rgb(0.7, 0.75, 0.8) });
  page.drawText('CPF: ***.193.402-** · Data: 23/07/2026', { x: 40 + (width - 100) / 2 + 35, y: height - 658, size: 7.5, font: fontHelvetica, color: rgb(0.5, 0.55, 0.6) });

  // Footer Disclaimer
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 45,
    color: rgb(0.95, 0.96, 0.98),
  });

  page.drawText('ESTE DOCUMENTO É UM CERTIFICADO PÚBLICO DE AUTENTICIDADE DE LAUDO DIGITAL.', {
    x: 40,
    y: 28,
    size: 7.5,
    font: fontBold,
    color: rgb(0.3, 0.35, 0.45),
  });

  page.drawText('Qualquer adulteração no arquivo PDF original cancela a chave SHA-256. Verifique em https://danosaparentes.com.br/verify', {
    x: 40,
    y: 14,
    size: 7.5,
    font: fontHelvetica,
    color: rgb(0.4, 0.45, 0.55),
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = resolve('public/exemplos/modelo-verificacao-autenticidade.pdf');
  writeFileSync(outputPath, pdfBytes);
  console.log('Criado PDF de verificação:', outputPath, `${Math.round(pdfBytes.length / 1024)}KB`);
}

generateVerificationPdf().catch(console.error);
