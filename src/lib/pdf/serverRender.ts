import type { Browser } from 'puppeteer-core'

export type ServerPdfRenderResult = {
  pdf: Buffer
  engine: 'chromium'
}

/**
 * HTML → PDF no Node via Chromium headless.
 * Em Vercel usa @sparticuz/chromium; em local tenta Chrome/Chromium do sistema.
 * Se o binário não existir, lança erro tipado para o client cair no fallback.
 */
export async function renderHtmlToPdfBuffer(
  html: string,
  opts?: { preferMultiPage?: boolean },
): Promise<ServerPdfRenderResult> {
  const puppeteer = await import('puppeteer-core')
  let browser: Browser | null = null

  try {
    browser = await launchBrowser(puppeteer)
    const page = await browser.newPage()
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 45_000,
    })
    // Fontes web (Google Fonts no HTML do laudo) — best-effort.
    try {
      await page.evaluate(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = (document as any).fonts
        if (fonts?.ready) await fonts.ready
      })
    } catch { /* ignore */ }

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: Boolean(opts?.preferMultiPage),
      margin: opts?.preferMultiPage
        ? { top: '10mm', bottom: '12mm', left: '8mm', right: '8mm' }
        : { top: '0', bottom: '0', left: '0', right: '0' },
    })

    return { pdf: Buffer.from(pdfUint8), engine: 'chromium' }
  } finally {
    if (browser) {
      try { await browser.close() } catch { /* ignore */ }
    }
  }
}

async function launchBrowser(puppeteer: typeof import('puppeteer-core')): Promise<Browser> {
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

  if (isVercel) {
    const { default: chromium } = await import('@sparticuz/chromium')
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 1800, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  // Dev / CI: Chrome do sistema, se houver.
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean) as string[]

  let lastErr: unknown
  for (const executablePath of candidates) {
    try {
      return await puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
    } catch (err) {
      lastErr = err
    }
  }

  throw new Error(
    `Chromium indisponível para PDF server-side${lastErr instanceof Error ? `: ${lastErr.message}` : ''}`,
  )
}
